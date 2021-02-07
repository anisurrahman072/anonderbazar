import {AfterViewInit, Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {NgProgress} from "@ngx-progressbar/core";
import {ToastrService} from "ngx-toastr";
import {Store} from "@ngrx/store";
import {Observable} from "rxjs/Observable";
import {ActivatedRoute, Router} from "@angular/router";
import {Subscription} from "rxjs/Subscription";
import * as fromStore from "../../../../state-management";
import {Cart, User} from "../../../../models";
import {AreaService, AuthService, CartItemService, CartService, OrderService} from "../../../../services";
import {AppSettings} from '../../../../config/app.config';
import {PaymentAddressService} from '../../../../services/payment-address.service';
import {LoaderService} from "../../../../services/ui/loader.service";
import {FormValidatorService} from "../../../../services/validator/form-validator.service";

@Component({
    selector: 'app-checkout-page',
    templateUrl: './checkout-page.component.html',
    styleUrls: ['./checkout-page.component.scss']
})
export class CheckoutPageComponent implements OnInit, AfterViewInit {
    currentUser$: Observable<User>;
    divisionSearchOptions: any = [];
    shippingZilaSearchOptions: any = [];
    zilaSearchOptions: any = [];
    shippingUpazilaSearchOptions: any = [];
    upazilaSearchOptions: any = [];
    prevoius_address: any;
    prevoius_address_id: any;
    checkoutForm: FormGroup;
    help1Show: boolean = false;
    help2Show: boolean = false;
    isAddNew = false;
    isDelivery = true;
    isPickup = false;
    cart$: Observable<Cart>;
    cartData: any;
    user_id: any;
    IMAGE_ENDPOINT = AppSettings.IMAGE_ENDPOINT;
    LIST_IMAGE_ENDPOINT = AppSettings.IMAGE_LIST_ENDPOINT;
    shippingFirstName: string;
    shippingLastName: string;
    shippingPhone: string;
    courierCharges: any;
    shippingCharge: number = 0;
    grantTotal: number = 0;
    shipping_division_id: string;
    shipping_zila_id: string;
    shipping_upazila_id: string;
    shippingAddress: string;
    shippingPostCode: string;
    billshippingFirstName: string;
    billshippingLastName: string;
    billshippingPhone: string;
    billdivision_id: string;
    billzila_id: string;
    billupazila_id: string;
    billaddress: string;
    billpostCode: string;
    private currentUser: User;
    private currentUserSub: Subscription;
    newShippingAddress: boolean = false;
    newBillingAddress: boolean = false;
    isCopy: boolean = true;
    showPayment: boolean = false;
    hideCashonDelivery: boolean = false;
    successOrderId: any = false;
    showFormError: boolean = false;
    orderId;

    constructor(private route: ActivatedRoute,
                private router: Router,
                private areaService: AreaService,
                private authService: AuthService,
                private fb: FormBuilder,
                private orderService: OrderService,
                private PaymentAddressService: PaymentAddressService,
                private store: Store<fromStore.HomeState>,
                private cartItemService: CartItemService,
                private cartService: CartService,
                public _progress: NgProgress,
                private toastr: ToastrService,
                public loaderService: LoaderService) {

    }

    // init the component
    ngOnInit() {


        this.checkoutForm = this.fb.group({
            // billing
            billing_id: ['', []],
            firstName: ['', [Validators.required]],
            lastName: ['', [Validators.required]],
            address: ['', [Validators.required]],
            phone: ['', [Validators.required, FormValidatorService.phoneNumberValidator]],
            postCode: ['', [Validators.required]],
            country: ['Bangladesh', [Validators.required]],
            upazila_id: ['', [Validators.required]],
            zila_id: ['', [Validators.required]],
            division_id: ['', [Validators.required]],

            // shipping

            shipping_id: ['', []],
            shippingFirstName: ['', [Validators.required]],
            shippingLastName: ['', [Validators.required]],
            shippingAddress: ['', [Validators.required]],
            shippingPhone: ['', [Validators.required, FormValidatorService.phoneNumberValidator]],
            shippingPostCode: ['', [Validators.required]],
            shipping_country: ['Bangladesh', [Validators.required]],
            shipping_upazila_id: ['', [Validators.required]],
            shipping_zila_id: ['', [Validators.required]],
            shipping_division_id: ['', [Validators.required]],

            //paymentType
            paymentType: ['Cash', []]
        });

        let queryParams = this.route.snapshot.queryParams;

        if (queryParams['order']) {
            this.successOrderId = queryParams['order'];
        }

        this.currentUser$ = this.store.select<any>(fromStore.getCurrentUser);

        // this.cart$ = this.store.select<any>(fromStore.getCart);

        this.areaService.getAllDivision().subscribe(result => {
            this.divisionSearchOptions = result;
        });

        this.currentUserSub = this.currentUser$.subscribe((user) => {
            this.currentUser = user;
        });

        this.user_id = this.authService.getCurrentUserId();

        this.loaderService.showLoader();

        this.grantTotal = 0;
        this.cartService.getByUserId(this.user_id).subscribe(cartData => {
            this.cartData = cartData;

            this.updateGrandTotal();
            this.cartService.getCourierCharges().subscribe(globalConfig => {
                if (Array.isArray(globalConfig) && globalConfig.length > 0) {
                    this.courierCharges = globalConfig[0]
                }
                this.loaderService.hideLoader();
            });

        });

        this.prevoius_address_change(this.user_id);
    }

    updateGrandTotal(shouldUpateShippingCharge: boolean = true, zilaId: number = 0) {
        this.grantTotal = 0;
        let selectedZilaId = zilaId;

        if (typeof this.cartData !== 'undefined' && typeof this.cartData.data !== 'undefined') {
            this.grantTotal = this.cartData.data.total_price;
        }

        if (selectedZilaId === 0) {
            let formValue = this.checkoutForm.getRawValue();
            if (formValue.shipping_zila_id) {
                selectedZilaId = formValue.shipping_zila_id;
            }
        }

        if (shouldUpateShippingCharge) {
            this.shippingCharge = 0;
            let noShippingCharge = false;
            if (typeof this.cartData.data !== 'undefined' && typeof this.cartData.data.cart_items !== 'undefined' && this.cartData.data.cart_items.length > 0) {
                const foundCouponProduct = this.cartData.data.cart_items.find((item) => {
                    return item.product_id && !!item.product_id.is_coupon_product;
                });
                noShippingCharge = foundCouponProduct && this.cartData.data.cart_items.length === 1;

                this.hideCashonDelivery = foundCouponProduct;
            }

            if (selectedZilaId > 0 && !noShippingCharge) {
                if (this.courierCharges) {
                    this.shippingCharge = selectedZilaId == 2942 ? this.courierCharges.dhaka_charge : this.courierCharges.outside_dhaka_charge
                }

                if (this.shippingCharge) {
                    this.grantTotal = this.grantTotal + this.shippingCharge;
                }
            }
        }
    }

    //Method for loader hide
    ngAfterViewInit() {
        this.loaderService.hideLoader();
    }

    //Event method for resetting the form
    resetForm($event: MouseEvent) {
        $event.preventDefault();
        this.checkoutForm.reset();
        this.updateGrandTotal();
        for (const key in this.checkoutForm.controls) {
            this.checkoutForm.controls[key].markAsPristine();
        }
    }

    //Event method for setting up form in validation
    getFormControl(name) {
        return this.checkoutForm.controls[name];
    }

    //Event method for submitting the form
    public formCheckout = ($event, value) => {
        if (this.cartData && this.cartData.data.cart_items.length <= 0) {
            this.toastr.error("You have no items in your cart!", "Empty cart!");
            return false;
        }
        let requestPayload = {
            user_id: this.user_id,

            billing_address: {
                id: this.newBillingAddress ? '' : value.billing_id,
                firstName: value.firstName,
                lastName: value.lastName,
                address: value.address,
                country: value.country,
                phone: value.phone,
                postCode: value.postCode,
                upazila_id: value.upazila_id,
                zila_id: value.zila_id,
                division_id: value.division_id
            },
            shipping_address: {
                id: this.newShippingAddress ? '' : value.shipping_id,
                firstName: value.shippingFirstName,
                lastName: value.shippingLastName,
                address: value.shippingAddress,
                country: value.shipping_country,
                phone: value.shippingPhone,
                postCode: value.shippingPostCode,
                upazila_id: value.shipping_upazila_id,
                zila_id: value.shipping_zila_id,
                division_id: value.shipping_division_id
            },
            paymentType: value.paymentType,
            is_copy: this.isCopy,
        };
        this._progress.start("mainLoader");
        if (value.paymentType == "SSLCommerce") {
            this.orderService.sslcommerzInsert(requestPayload).subscribe(result => {
                this._progress.complete("mainLoader");
                this.store.dispatch(new fromStore.LoadCart());
                window.location.href = result.GatewayPageURL;
            });
        } else {
            this.orderService.customInsert(requestPayload).subscribe(result => {
                this._progress.complete("mainLoader");
                this.store.dispatch(new fromStore.LoadCart());
                // this.router.navigate(['/profile/orders/invoice/', result.order.id]);
                this.successOrderId = result.order.id;
                this.toastr.success("Your order has been successfully placed.", "Note");
            });
        }
    }

    //Method for previous address change

    prevoius_address_change(user_id: number) {
        // var prevoius_address_id = $event.target.value;
        this.PaymentAddressService.getpaymentaddress(user_id).subscribe(result => {
            this.prevoius_address = result;
        });
    }


    //Method for division change

    divisionChange($event, type) {
        var divisionId = $event.target.value;
        if (type == 'shipping') {
            this.updateGrandTotal();
            this.areaService.getAllZilaByDivisionId(divisionId).subscribe(result => {
                this.shippingZilaSearchOptions = result;
                this.shippingUpazilaSearchOptions = [];
            });
        } else {
            this.areaService.getAllZilaByDivisionId(divisionId).subscribe(result => {
                this.zilaSearchOptions = result;
                this.upazilaSearchOptions = [];
            });
        }
    }

    // Method for zila change

    zilaChange($event, type) {
        var zilaId = $event.target.value;
        if (type == 'shipping') {
            this.areaService.getAllUpazilaByZilaId(zilaId).subscribe(result => {
                this.shippingUpazilaSearchOptions = result;
            });
            this.updateGrandTotal(true, zilaId);
        } else {
            this.areaService.getAllUpazilaByZilaId(zilaId).subscribe(result => {
                this.upazilaSearchOptions = result;
            });
        }
    }

    //Method for showing delivery section

    showDelivarySection() {
        this.isDelivery = true;
        this.isPickup = false;
    }

    //Method for showing pickup location in front view

    showPickupSection() {
        this.isDelivery = false;
        this.isPickup = true;
    }

    //Method for coping shipping address
    copyAll() {
        if (this.isCopy) {
            let formValue = this.checkoutForm.getRawValue();
            this.checkoutForm.patchValue({
                billing_id: formValue.shipping_id,
                firstName: formValue.shippingFirstName,
                lastName: formValue.shippingLastName,
                address: formValue.shippingAddress,
                phone: formValue.shippingPhone,
                postCode: formValue.shippingPostCode,
                upazila_id: formValue.shipping_upazila_id,
                zila_id: formValue.shipping_zila_id,
                division_id: formValue.shipping_division_id,
            });

            let zila = this.shippingZilaSearchOptions.find(x => x.id == formValue.shipping_zila_id);
            let upZila = this.shippingUpazilaSearchOptions.find(x => x.id == formValue.shipping_upazila_id);
            if (zila) {
                this.zilaSearchOptions.push(zila);
            }
            if (upZila) {
                this.upazilaSearchOptions.push(upZila);
            }
        }
    }

    //Event method for removing cart items
    removeCartItem(cartItemId) {
        this._progress.start("mainLoader");
        this.cartItemService.delete(cartItemId).subscribe(res => {
            this.cartService.getByUserId(this.user_id).subscribe(cartData => {
                this.cartData = cartData;
                this.updateGrandTotal();
                this._progress.complete("mainLoader");
                this.toastr.info("Item removed from cart Successfully", 'Note');
            });
            this.store.dispatch(new fromStore.LoadCart());
        });
    }

    //Method for address change

    onAddressChange(id, type) {
        let address = this.prevoius_address.find(x => x.id == id);
        if (type == 'shipping') {
            this.checkoutForm.patchValue({
                shippingFirstName: address.first_name,
                shippingLastName: address.last_name,
                shippingAddress: address.address,
                shippingPhone: address.phone,
                shippingPostCode: address.postal_code,
                shipping_upazila_id: address.upazila_id.id,
                shipping_zila_id: address.zila_id.id,
                shipping_division_id: address.division_id.id,
            });
            this.shippingZilaSearchOptions.push(address.zila_id);
            this.shippingUpazilaSearchOptions.push(address.upazila_id);

            this.updateGrandTotal(true, address.zila_id.id);
        } else {
            this.checkoutForm.patchValue({
                firstName: address.first_name,
                lastName: address.last_name,
                address: address.address,
                phone: address.phone,
                postCode: address.postal_code,
                upazila_id: address.upazila_id.id,
                zila_id: address.zila_id.id,
                division_id: address.division_id.id,
            });
            this.zilaSearchOptions.push(address.zila_id);
            this.upazilaSearchOptions.push(address.upazila_id);
        }
    }

    //Method for address toggle in checkout page

    onAddressToggle(event, type) {
        event.preventDefault();
        if (type == 'shipping') {

            this.newShippingAddress = !this.newShippingAddress;
            if (!this.newShippingAddress) {
                let shipping_id = this.checkoutForm.get('shipping_id').value;
                if (shipping_id) {
                    this.onAddressChange(shipping_id, 'shipping')
                }
            } else {
                this.checkoutForm.patchValue({
                    shipping_id: '',
                    shippingFirstName: '',
                    shippingLastName: '',
                    shippingAddress: '',
                    shippingPhone: '',
                    shippingPostCode: '',
                    shipping_upazila_id: '',
                    shipping_zila_id: '',
                    shipping_division_id: '',
                });
            }
            this.updateGrandTotal()

        } else {
            this.newBillingAddress = !this.newBillingAddress;
            if (!this.newBillingAddress) {
                let billing_id = this.checkoutForm.get('billing_id').value;
                if (billing_id) {
                    this.onAddressChange(billing_id, 'billing')
                }
            } else {
                this.checkoutForm.patchValue({
                    billing_id: '',
                    firstName: '',
                    lastName: '',
                    address: '',
                    phone: '',
                    postCode: '',
                    upazila_id: '',
                    zila_id: '',
                    division_id: '',
                });
            }
        }
    }

    //Method for get all addresses for current user

    getAddress(type) {
        let formValue = this.checkoutForm.getRawValue();
        if (type == 'shipping') {
            let division = this.divisionSearchOptions.find(x => x.id == formValue.shipping_division_id);
            let shipping_upazila = this.shippingUpazilaSearchOptions.find(x => x.id == formValue.shipping_upazila_id);
            let shipping_zila = this.shippingZilaSearchOptions.find(x => x.id == formValue.shipping_zila_id);
            let fullAddress = formValue.shippingAddress + ', ' +
                division.name + ', ' +
                shipping_upazila.name + ', ' +
                shipping_zila.name;
            return fullAddress;
        } else {
            let division = this.divisionSearchOptions.find(x => x.id == formValue.division_id);
            let shipping_upazila = this.upazilaSearchOptions.find(x => x.id == formValue.upazila_id);
            let shipping_zila = this.zilaSearchOptions.find(x => x.id == formValue.zila_id);
            let fullAddress = formValue.address + ', ' +
                division.name + ', ' +
                shipping_upazila.name + ', ' +
                shipping_zila.name;
            return fullAddress;
        }
    }

    //Method for proceed to pay

    processToPay() {
        console.log('--------------------processToPay----------------------', this.isCopy, this.cartData, this.checkoutForm)
        if (this.isCopy) {
            this.copyAll();
        }
        if (this.cartData && (typeof this.cartData.data === 'undefined' || this.cartData.data.cart_items.length <= 0)) {
            this.toastr.error("You have no items in your cart!", "Empty cart!");
            return false;
        }
        if (this.checkoutForm.invalid) {
            this.showFormError = true;
            this.toastr.error("Both shipping and billing address is required!", "Sorry!");
            return false;
        }
        this.showPayment = true
    }

    // Method for update cart

    updateCartItem(cartItem) {
        this._progress.start("mainLoader");
        let data = {
            "cart_id": cartItem.cart_id,
            "product_id": cartItem.product_id.id,
            "product_quantity": cartItem.product_quantity,
            "product_total_price": cartItem.product_total_price
        };

        this.loaderService.showLoader();
        this.cartItemService.update(cartItem.id, data).subscribe(res => {
            this.cartService.getByUserId(this.user_id).subscribe(cartData => {
                this.loaderService.hideLoader();
                this.cartData = cartData;
                this.updateGrandTotal();
                this._progress.complete("mainLoader");
                this.toastr.info("Cart Item updated Successfully", 'Note');
            })
        });
    }

    changeCartItemQuantity(cartItem, action) {
        if (action == 'increase') {
            let maxProductQuantity = cartItem.product_id.quantity;
            if (cartItem.product_quantity < maxProductQuantity) {
                cartItem.product_quantity += 1;
                cartItem.product_total_price = cartItem.product_unit_price * cartItem.product_quantity;
            } else {
                this.toastr.error('Unable to increase quantity!', 'Sorry!');
                return false;
            }
        } else {
            if (cartItem.product_quantity > 1) {
                cartItem.product_quantity -= 1;
                cartItem.product_total_price = cartItem.product_unit_price * cartItem.product_quantity;
            } else {
                this.toastr.error('Unable to decrease quantity!', 'Sorry!');
                return false;
            }
        }
        this.updateCartItem(cartItem);
    }

    checkAddressSegment(type, segment) {
        let formValue = this.checkoutForm.getRawValue();
        if (segment == 'zila') {
            let division = type == 'shipping' ? formValue.shipping_division_id : formValue.division_id;
            if (!division) {
                this.toastr.error('Select Division first!', 'Note');
            }
        } else if (segment == 'upazila') {
            let zila = type == 'shipping' ? formValue.shipping_zila_id : formValue.zila_id;
            if (!zila) {
                this.toastr.error('Select Zila first!', 'Note');
            }
        }
    }

//Event method for setting up form in validation
    getSignUpFormControl(type) {
        return this.checkoutForm.controls[type];
    }
}
