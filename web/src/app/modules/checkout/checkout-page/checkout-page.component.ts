import {AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, TemplateRef} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {ToastrService} from "ngx-toastr";
import {Store} from "@ngrx/store";
import {Observable} from "rxjs/Observable";
import {ActivatedRoute, Router} from "@angular/router";
import {Subscription} from "rxjs/Subscription";
import * as fromStore from "../../../state-management";
import {Cart, Offer, User} from "../../../models";
import {AreaService, AuthService, CartItemService, CartService, OrderService} from "../../../services";
import {AppSettings} from '../../../config/app.config';
import {PaymentAddressService} from '../../../services/payment-address.service';
import {LoaderService} from "../../../services/ui/loader.service";
import {FormValidatorService} from "../../../services/validator/form-validator.service";
import {GLOBAL_CONFIGS, ORDER_TYPE, PAYMENT_METHODS, PAYMENT_STATUS} from "../../../../environments/global_config";
import {BsModalRef, BsModalService} from 'ngx-bootstrap/modal';
import {BkashService} from "../../../services/bkash.service";
import {Title} from "@angular/platform-browser";
import {QueryMessageModalComponent} from "../../shared/components/query-message-modal/query-message-modal.component";
import {FileHolder, UploadMetadata} from "angular2-image-upload";
import * as he from 'he';
import {DesignimageService} from "../../../services/designimage.service";

@Component({
    selector: 'app-checkout-page',
    templateUrl: './checkout-page.component.html',
    styleUrls: ['./checkout-page.component.scss']
})
export class CheckoutPageComponent implements OnInit, OnDestroy, AfterViewInit {

    private currentUser: User;
    private currentUserSub: Subscription;
    private mainSubscription: Subscription;

    bKashWalletModalRef: BsModalRef;
    paymentGatewayErrorModalRef: BsModalRef;
    currentUser$: Observable<User>;
    cart$: Observable<Cart>;
    offer$: Observable<Offer>;

    divisionSearchOptions: any = [];
    shippingZilaSearchOptions: any = [];
    zilaSearchOptions: any = [];
    shippingUpazilaSearchOptions: any = [];
    upazilaSearchOptions: any = [];
    prevoius_address: any;
    checkoutForm: FormGroup;

    termsAndPolicy: boolean = false;
    showBkashPayment: boolean = false;
    showNagadPayment: boolean = false;

    isDelivery = true;
    isPickup = false;
    cartData: any;
    message: any;
    user_id: any;

    IMAGE_ENDPOINT = AppSettings.IMAGE_ENDPOINT;
    LIST_IMAGE_ENDPOINT = AppSettings.IMAGE_LIST_ENDPOINT;
    IMAGE_EXT = GLOBAL_CONFIGS.productImageExtension;
    enabledPaymentMethods = GLOBAL_CONFIGS.activePaymentMethods;
    private bKashTestUsers: any = GLOBAL_CONFIGS.bkashTestUsers;
    private nagadTestUsers: any = GLOBAL_CONFIGS.nagadTestUsers;

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

    newShippingAddress: boolean = false;
    newBillingAddress: boolean = false;
    isCopy: boolean = true;
    showPayment: boolean = false;
    hideCashonDelivery: boolean = false;
    successOrderId: any = false;
    showFormError: boolean = false;
    orderId;
    noShippingCharge: boolean = false;

    authUserWallets: any;
    couponCashbackAmount: number = 0;

    disableCashOnDelivery: boolean = false;
    isOfflinePayable: boolean = false;
    isFreeShipping: boolean = true;
    maxDhakaCharge: number = 0;
    maxOutsideDhakaCharge: number = 0;

    CASH_PAYMENT_TYPE = PAYMENT_METHODS.CASH_PAYMENT_TYPE;
    CASHBACK_PAYMENT_TYPE = PAYMENT_METHODS.CASHBACK_PAYMENT_TYPE;
    SSL_COMMERZ_PAYMENT_TYPE = PAYMENT_METHODS.SSL_COMMERZ_PAYMENT_TYPE;
    BKASH_PAYMENT_TYPE = PAYMENT_METHODS.BKASH_PAYMENT_TYPE;
    NAGAD_PAYMENT_TYPE = PAYMENT_METHODS.NAGAD_PAYMENT_TYPE;
    OFFLINE_PAYMENT_TYPE = PAYMENT_METHODS.OFFLINE_PAYMENT_TYPE;
    REGULAR_ORDER = ORDER_TYPE.REGULAR_ORDER;

    isPartiallyPayable = true;
    isShowOfflineForm: boolean = false;

    ImageFile = [];
    storeImageFileName: File[] = [];
    showImageMissingValidation: boolean = false;

    offerData: any;

    /** Offer payment gateway variables */
    isAllowedSslCommerzInOfferedProductPurchase = true;
    isAllowedBkashInOfferedProductPurchase = true;
    isAllowedOfflineInOfferedProductPurchase = true;
    isAllowedCashInDeliveryInOfferedProductPurchase = true;
    isAllowedNagadInOfferedProductPurchase = true;

    isAllowedOfferPaymentGateway = false;

    private offerIdNumber = null;
    private offerType = null;

    isAllowedToProcessToPay = true;

    wrongCartItemsModalRef: BsModalRef;

    constructor(
        private cdr: ChangeDetectorRef,
        private route: ActivatedRoute,
        private router: Router,
        private areaService: AreaService,
        private authService: AuthService,
        private fb: FormBuilder,
        private orderService: OrderService,
        private PaymentAddressService: PaymentAddressService,
        private store: Store<fromStore.HomeState>,
        private cartItemService: CartItemService,
        private cartService: CartService,
        private toastr: ToastrService,
        private modalService: BsModalService,
        private bKashService: BkashService,
        public loaderService: LoaderService,
        private title: Title,
        private designImagesService: DesignimageService) {

    }

    // init the component
    ngOnInit() {
        this.offer$ = this.store.select<any>(fromStore.getOffer);
        this.offer$.subscribe(offerData => {
            if(offerData && offerData.finalCollectionOfProducts){
                this.offerData = offerData.finalCollectionOfProducts;
                console.log("this.offerData: ", this.offerData);
            }
        })

        this.checkoutForm = this.fb.group({
            offlinePaymentMethods: ['', []],
            transactionIdForBank: ['', []],
            bankName: ['', []],
            branchName: ['', []],
            accountNumberForBank: ['', []],

            // Billing
            billing_id: ['', []],
            firstName: ['', [Validators.required]],
            // lastName: ['', [Validators.required]],
            lastName: ['', []],
            address: ['', [Validators.required]],
            phone: ['', [Validators.required, FormValidatorService.phoneNumberValidator]],
            postCode: ['', [Validators.required]],
            country: ['Bangladesh', [Validators.required]],
            upazila_id: ['', [Validators.required]],
            zila_id: ['', [Validators.required]],
            division_id: ['', [Validators.required]],

            // Shipping
            shipping_id: ['', []],
            shippingFirstName: ['', [Validators.required]],
            // shippingLastName: ['', [Validators.required]],
            shippingLastName: ['', []],
            shippingAddress: ['', [Validators.required]],
            shippingPhone: ['', [Validators.required, FormValidatorService.phoneNumberValidator]],
            shippingPostCode: ['', [Validators.required]],
            shipping_country: ['Bangladesh', [Validators.required]],
            shipping_upazila_id: ['', [Validators.required]],
            shipping_zila_id: ['', [Validators.required]],
            shipping_division_id: ['', [Validators.required]],

            //PaymentType
            paymentType: ['', []]
        });


        this.currentUser$ = this.store.select<any>(fromStore.getCurrentUser);

        this.currentUserSub = this.currentUser$.subscribe((user) => {
            this.currentUser = user;
            if (this.currentUser) {
                this.user_id = this.currentUser.id;
                if (this.currentUser.couponLotteryCashback && this.currentUser.couponLotteryCashback.length > 0) {
                    this.couponCashbackAmount = parseFloat(this.currentUser.couponLotteryCashback[0].amount);
                }
                this.showBkashPayment = this.bKashTestUsers.find((userId) => this.user_id == userId);
                this.showNagadPayment = this.nagadTestUsers.find((userId) => this.user_id == userId);
            } else {
                this.user_id = null;
            }
        }, () => {
            this.user_id = null;
        });

        this.cart$ = this.store.select<any>(fromStore.getCart);
        this.offer$ = this.store.select<any>(fromStore.getOffer);
        this.offer$.subscribe(offerData => {
            console.log("offeraData: ", offerData);
        })

        this.loaderService.showLoader();
        this.grantTotal = 0;
        this.mainSubscription = this.cartService.getCourierCharges()
            .concatMap((globalConfig: any) => {
                if (Array.isArray(globalConfig) && globalConfig.length > 0) {
                    this.courierCharges = globalConfig[0];
                    /*this.cart$.subscribe((cartData) => {
                        console.log('cartData', cartData);
                        if (cartData) {
                            this.cartData = cartData;
                            console.log("Cart info: ", cartData);
                            this.setShippingCharge();
                        } else {
                            this.cartData = null;
                        }
                        this.updateGrandTotal();
                        this.addPageTitle();
                    }, (err) => {
                        console.log(err);
                        this.toastr.error('Unable to update cart data', 'Sorry!');
                    });*/
                    setTimeout(() => {
                        this.store.dispatch(new fromStore.LoadCart());
                        this.cart$.subscribe((cartData) => {
                            if (cartData) {
                                this.cartData = cartData;
                                this.setOffersPaymentsGatewayAndChekCartHasWrongOfferItems(this.cartData.data.cart_items);
                                this.setShippingCharge();
                            } else {
                                this.cartData = null;
                            }
                            this.updateGrandTotal();
                            this.addPageTitle();
                        }, (err) => {
                            console.log(err);
                            this.toastr.error('Unable to update cart data', 'Sorry!');
                        });
                    }, 1000);

                    return this.areaService.getAllDivision();
                }
                return Observable.throw(new Error('Problem in getting global config.'));
            })
            .concatMap((divisionList: any) => {
                if (Array.isArray(divisionList) && divisionList.length > 0) {
                    // this.divisionSearchOptions = divisionList.sort((a, b) => a.name.localeCompare(b.name));
                    this.divisionSearchOptions = divisionList;
                    return this.PaymentAddressService.getAuthUserPaymentAddresses();
                }
                return Observable.throw(new Error('Problem in getting division list.'));
            })
            .subscribe((previousAddresses: any) => {
                // console.log('previous addresses', previousAddresses);
                this.prevoius_address = previousAddresses.map((decode) => {
                    let address = {...decode};
                    address.first_name = he.decode(address.first_name)
                    address.last_name = he.decode(address.last_name)
                    address.address = he.decode(address.address)
                    return address;
                })
                this.loaderService.hideLoader();

            }, (err) => {
                console.log(err);
                this.loaderService.hideLoader();
                this.toastr.error('Unable to load cart and other data', 'Sorry!');
            });


    }

    setOffersPaymentsGatewayAndChekCartHasWrongOfferItems(cartItems){
        this.isAllowedSslCommerzInOfferedProductPurchase = true;
        this.isAllowedBkashInOfferedProductPurchase = true;
        this.isAllowedOfflineInOfferedProductPurchase = true;
        this.isAllowedCashInDeliveryInOfferedProductPurchase = true;
        this.isAllowedNagadInOfferedProductPurchase = true;

        this.isAllowedOfferPaymentGateway = false;
        this.isAllowedToProcessToPay = true;

        this.offerIdNumber = null;
        this.offerType = null;

        cartItems.forEach((item, i) => {
            let productId = item.product_id.id;

            if(this.offerData[productId]){
                console.log("this.offerIdNumber: ", this.offerIdNumber, );
                if(i > 0){
                    if(this.offerIdNumber && this.offerData[productId].offer_id_number && this.offerIdNumber != this.offerData[productId].offer_id_number){
                        this.isAllowedToProcessToPay = false;
                    } else if(!this.offerIdNumber && this.offerData[productId].offer_id_number){
                        this.isAllowedToProcessToPay = false;
                    } else if(this.offerIdNumber && !this.offerData[productId].offer_id_number){
                        this.isAllowedToProcessToPay = false;
                    }
                }
                this.offerIdNumber = this.offerData[productId].offer_id_number;
                this.offerType = this.offerData[productId].offer_type;
                this.isAllowedOfferPaymentGateway = true;

                if(!this.offerData[productId].pay_by_sslcommerz){
                    this.isAllowedSslCommerzInOfferedProductPurchase = false;
                }
                if(!this.offerData[productId].pay_by_bKash){
                    this.isAllowedBkashInOfferedProductPurchase = false;
                }
                if(!this.offerData[productId].pay_by_offline){
                    this.isAllowedOfflineInOfferedProductPurchase = false;
                }
                if(!this.offerData[productId].pay_by_cashOnDelivery){
                    this.isAllowedCashInDeliveryInOfferedProductPurchase = false;
                }
                if(!this.offerData[productId].pay_by_nagad){
                    this.isAllowedNagadInOfferedProductPurchase = false;
                }
            } else {
                if(this.offerIdNumber){
                    this.isAllowedToProcessToPay = false;
                }
            }
        });

    }

    //Method for previous address change
    previousAddressChange() {
        // var prevoius_address_id = $event.target.value;
        this.PaymentAddressService.getAuthUserPaymentAddresses().subscribe(result => {
            this.prevoius_address = result;
        }, (err) => {
            console.log(err);
        });
    }

    ngOnDestroy() {
        if (this.mainSubscription) {
            this.mainSubscription.unsubscribe();
        }
        if (this.currentUserSub) {
            this.currentUserSub.unsubscribe();
        }
    }

    private openPaymentGatewayModal(message) {
        this.paymentGatewayErrorModalRef = this.modalService.show(QueryMessageModalComponent, {});
        this.paymentGatewayErrorModalRef.content.title = 'Payment has been failed';
        this.paymentGatewayErrorModalRef.content.message = message;
    }

    ngAfterViewInit() {
        this.loaderService.hideLoader();

        let queryParams = this.route.snapshot.queryParams;

        if (queryParams['order']) {
            this.successOrderId = queryParams['order'];
        } else if (queryParams['bKashError']) {
            setTimeout(() => {
                this.openPaymentGatewayModal(queryParams['bKashError']);
                this.cdr.detectChanges();
            }, 500);
        } else if (queryParams['sslCommerzError']) {
            setTimeout(() => {
                this.openPaymentGatewayModal(queryParams['sslCommerzError']);
                this.cdr.detectChanges();
            }, 500);
        } else if (queryParams['bkashURL']) {
            window.location.href = queryParams['bkashURL'];
        }
    }

    /*
        onAgreedToBKashTerms(event: any) {
            console.log('onAgreedToBKashTerms', event);
            this.agreedToBKashTermsConditions = event;

        }*/

    // Method for update cart
    updateCartItem(cartItem, action) {

        this.loaderService.showLoader();

        let currentQty = cartItem.product_quantity;

        let maxProductQuantity = cartItem.product_id.quantity;

        if (action == 'increase') {
            if (currentQty >= maxProductQuantity) {
                this.loaderService.hideLoader();
                this.toastr.error('Unable to increase quantity!', 'Sorry!');
                return false;
            }
        } else {
            if (currentQty <= 1) {
                this.loaderService.hideLoader();
                this.toastr.error('Unable to decrease quantity!', 'Sorry!');
                return false;
            }
        }

        let data = {
            "cart_id": cartItem.cart_id,
            "product_id": cartItem.product_id.id,
            "action_name": action,
            "quantity": 1
        };

        this.loaderService.showLoader();
        this.cartItemService.update(cartItem.id, data).subscribe(res => {
            this.store.dispatch(new fromStore.LoadCart());
            this.loaderService.hideLoader();
            this.toastr.info("Cart Item updated Successfully", 'Note');
        }, () => {
            this.loaderService.hideLoader();
            this.toastr.error("Cart Item has not been updated Successfully", 'Error');
        });
    }

    setShippingCharge() {
        this.disableCashOnDelivery = false;
        this.isOfflinePayable = false;
        this.maxDhakaCharge = 0;
        this.maxOutsideDhakaCharge = 0;
        this.isPartiallyPayable = true;
        this.cartData.data.cart_items.map(item => {
            if (item.product_id.disable_cash_on_delivery) {
                this.disableCashOnDelivery = true;
            }
            if (item.product_id.offline_payment) {
                this.isOfflinePayable = true;
            }
            if (!item.product_id.partially_payable) {
                this.isPartiallyPayable = false;
            }
            let itemDhakaCharge = 0;
            let itemOutsideDhakaCharge = 0;
            if (item.product_id.free_shipping === 0) {
                itemDhakaCharge = item.product_id.dhaka_charge ? item.product_id.dhaka_charge : this.courierCharges.dhaka_charge;
                itemOutsideDhakaCharge = item.product_id.outside_dhaka_charge ? item.product_id.outside_dhaka_charge : this.courierCharges.outside_dhaka_charge;
                this.isFreeShipping = false;
            }
            this.maxDhakaCharge = Math.max(this.maxDhakaCharge, itemDhakaCharge);
            this.maxOutsideDhakaCharge = Math.max(this.maxOutsideDhakaCharge, itemOutsideDhakaCharge);
        });
    }

    //Event method for removing cart items
    removeCartItem(cartItemId) {

        this.loaderService.showLoader();
        this.cartItemService.delete(cartItemId).subscribe(res => {
            this.store.dispatch(new fromStore.LoadCart());
            // this.setShippingCharge();
            // this.updateGrandTotal();
            this.toastr.info("Item removed from cart successfully", 'Note');

            this.cartData.data.cart_items =  this.cartData.data.cart_items.filter(item => item.id != cartItemId);

            this.setOffersPaymentsGatewayAndChekCartHasWrongOfferItems(this.cartData.data.cart_items);

            this.loaderService.hideLoader();
        }, () => {
            this.loaderService.hideLoader();
            this.toastr.error("Cart Item has not been removed successfully", 'Error');
        });
    }

    updateGrandTotal(shouldUpateShippingCharge: boolean = true, zilaId: number = 0) {

        this.grantTotal = 0;
        let selectedZilaId = zilaId;

        if (this.cartData !== null && typeof this.cartData !== 'undefined' && typeof this.cartData.data !== 'undefined') {
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
            this.noShippingCharge = false;
            if (this.cartData !== null && typeof this.cartData !== 'undefined' && typeof this.cartData.data !== 'undefined' &&
                typeof this.cartData.data.cart_items !== 'undefined' && this.cartData.data.cart_items.length > 0) {

                const foundCouponProduct = this.cartData.data.cart_items.find((item) => {
                    return item.product_id && !!item.product_id.is_coupon_product;
                });

                this.noShippingCharge = foundCouponProduct && this.cartData.data.cart_items.length === 1;

                if (AppSettings.IS_PRODUCTION) {
                    this.hideCashonDelivery = foundCouponProduct;
                    if (!this.hideCashonDelivery) {

                        // TODO: Temporary Solution
                        // console.log('this.cartData.data.cart_items', this.cartData.data.cart_items);

                        this.hideCashonDelivery = this.cartData.data.cart_items.find((item) => {
                            return item.product_id && item.product_id.subcategory_id == GLOBAL_CONFIGS.cashPaymentOffFor;
                        });
                    }
                }
            }

            if (selectedZilaId > 0 && !this.noShippingCharge) {
                if (this.courierCharges && !this.isFreeShipping) {
                    this.shippingCharge = selectedZilaId == AppSettings.DHAKA_ZILA_ID ? this.maxDhakaCharge : this.maxOutsideDhakaCharge;
                }
                if (this.shippingCharge) {
                    this.grantTotal = this.grantTotal + this.shippingCharge;
                }
            }
        }
    }

    /*
        //Event method for resetting the form
        resetForm($event: MouseEvent) {
            $event.preventDefault();
            this.checkoutForm.reset();
            this.updateGrandTotal();
            for (const key in this.checkoutForm.controls) {
                this.checkoutForm.controls[key].markAsPristine();
            }
        }
    */

    // method for offline order
    saveOrderForOfflinePayment($event, value) {
        this.loaderService.showLoader();
        if (this.cartData && this.cartData.data.cart_items.length <= 0) {
            this.toastr.error("You have no items in your cart!", "Empty cart!", {
                positionClass: 'toast-bottom-right'
            });
            this.loaderService.hideLoader();
            return false;
        }

        if (this.ImageFile.length <= 0) {
            this.showImageMissingValidation = true;
            this.toastr.error("Please upload the image first!", "Not provided the money receipt!", {
                positionClass: 'toast-bottom-right'
            });
            this.loaderService.hideLoader();
            return false;
        }


        let billing_address = {
            id: this.newBillingAddress ? '' : value.billing_id,
            firstName: this.noShippingCharge ? (this.currentUser && this.currentUser.first_name) ? this.currentUser.first_name : 'Anonder' : value.firstName,
            lastName: this.noShippingCharge ? (this.currentUser && this.currentUser.last_name) ? this.currentUser.last_name : 'Bazar' : value.lastName,
            address: this.noShippingCharge ? 'Urban Rose, Suite-3B, House-61, Road-24, Gulshan-1' : value.address,
            country: value.country,
            phone: this.noShippingCharge ? (this.currentUser && this.currentUser.phone) ? this.currentUser.phone : '+8801958083908' : value.phone,
            postCode: this.noShippingCharge ? '1212' : value.postCode,
            upazila_id: this.noShippingCharge ? '6561' : value.upazila_id,
            zila_id: this.noShippingCharge ? AppSettings.DHAKA_ZILA_ID : value.zila_id,
            division_id: this.noShippingCharge ? '68' : value.division_id
        };

        let shipping_address = {
            id: this.newShippingAddress ? '' : value.shipping_id,
            firstName: this.noShippingCharge ? (this.currentUser && this.currentUser.first_name) ? this.currentUser.first_name : 'Anonder' : value.shippingFirstName,
            lastName: this.noShippingCharge ? (this.currentUser && this.currentUser.last_name) ? this.currentUser.last_name : 'Bazar' : value.shippingAddress,
            address: this.noShippingCharge ? 'Urban Rose, Suite-3B, House-61, Road-24, Gulshan-1' : value.shippingAddress,
            country: value.shipping_country,
            phone: this.noShippingCharge ? (this.currentUser && this.currentUser.phone) ? this.currentUser.phone : '+8801958083908' : value.shippingPhone,
            postCode: this.noShippingCharge ? '1212' : value.shippingPostCode,
            upazila_id: this.noShippingCharge ? '6561' : value.shipping_upazila_id,
            zila_id: this.noShippingCharge ? AppSettings.DHAKA_ZILA_ID : value.shipping_zila_id,
            division_id: this.noShippingCharge ? '68' : value.shipping_division_id
        };

        const formData: FormData = new FormData();
        let payLoad = {
            shipping_address,
            billing_address,
            orderType: ORDER_TYPE.REGULAR_ORDER,
            paymentStatus: PAYMENT_STATUS.UNPAID,
            is_copy: this.isCopy
        }
        formData.append('paymentType', this.OFFLINE_PAYMENT_TYPE);
        formData.append('shipping_address', JSON.stringify(shipping_address));
        formData.append('billing_address', JSON.stringify(billing_address));
        formData.append('orderType', `${ORDER_TYPE.REGULAR_ORDER}`);
        formData.append('paymentStatus', `${PAYMENT_STATUS.UNPAID}`);
        formData.append('is_copy', `${this.isCopy}`);

        if (value.paymentType == PAYMENT_METHODS.OFFLINE_PAYMENT_TYPE) {
            if (this.ImageFile.length > 0) {
                this.ImageFile = this.ImageFile.map(image => image.split(this.IMAGE_ENDPOINT)[1]);
                formData.append('image', JSON.stringify(this.ImageFile));
            }
        } else {
            this.toastr.error('Error occurred', "Insert correct payment method", {
                positionClass: 'toast-bottom-right'
            });
            return false;
        }


        this.orderService.placeOrder(formData)
            .subscribe(order => {
                this.store.dispatch(new fromStore.LoadCurrentUser());
                this.store.dispatch(new fromStore.LoadCart());
                this.toastr.success("Your order has been placed. Please wait for verification your payment.", "Success!", {
                    positionClass: 'toast-top-right'
                });
                this.router.navigate(['/profile/orders/invoice/', order.id]);
                this.loaderService.hideLoader();
            }, error => {
                if(error.error && error.error.additionalMessage){
                    this.toastr.info(error.error.additionalMessage, "Order not placed!", {
                        positionClass: 'toast-top-right'
                    });
                } else {
                    this.toastr.error("Error occurred while placing your order.", "Error!", {
                        positionClass: 'toast-top-right'
                    });
                }
                this.loaderService.hideLoader();
            })
    }


    // method for confirm without payment
    formConfirmWithoutPayment($event, value) {
        this.loaderService.showLoader();
        if (this.cartData && this.cartData.data.cart_items.length <= 0) {
            this.toastr.error("You have no items in your cart!", "Empty cart!", {
                positionClass: 'toast-bottom-right'
            });
            return false;
        }

        let requestPayload = {
            user_id: this.user_id,

            billing_address: {
                id: this.newBillingAddress ? '' : value.billing_id,
                firstName: this.noShippingCharge ? (this.currentUser && this.currentUser.first_name) ? this.currentUser.first_name : 'Anonder' : value.firstName,
                lastName: this.noShippingCharge ? (this.currentUser && this.currentUser.last_name) ? this.currentUser.last_name : 'Bazar' : value.lastName,
                address: this.noShippingCharge ? 'Urban Rose, Suite-3B, House-61, Road-24, Gulshan-1' : value.address,
                country: value.country,
                phone: this.noShippingCharge ? (this.currentUser && this.currentUser.phone) ? this.currentUser.phone : '+8801958083908' : value.phone,
                postCode: this.noShippingCharge ? '1212' : value.postCode,
                upazila_id: this.noShippingCharge ? '6561' : value.upazila_id,
                zila_id: this.noShippingCharge ? AppSettings.DHAKA_ZILA_ID : value.zila_id,
                division_id: this.noShippingCharge ? '68' : value.division_id
            },
            shipping_address: {
                id: this.newShippingAddress ? '' : value.shipping_id,
                firstName: this.noShippingCharge ? (this.currentUser && this.currentUser.first_name) ? this.currentUser.first_name : 'Anonder' : value.shippingFirstName,
                lastName: this.noShippingCharge ? (this.currentUser && this.currentUser.last_name) ? this.currentUser.last_name : 'Bazar' : value.shippingAddress,
                address: this.noShippingCharge ? 'Urban Rose, Suite-3B, House-61, Road-24, Gulshan-1' : value.shippingAddress,
                country: value.shipping_country,
                phone: this.noShippingCharge ? (this.currentUser && this.currentUser.phone) ? this.currentUser.phone : '+8801958083908' : value.shippingPhone,
                postCode: this.noShippingCharge ? '1212' : value.shippingPostCode,
                upazila_id: this.noShippingCharge ? '6561' : value.shipping_upazila_id,
                zila_id: this.noShippingCharge ? AppSettings.DHAKA_ZILA_ID : value.shipping_zila_id,
                division_id: this.noShippingCharge ? '68' : value.shipping_division_id
            },
            orderType: 2,
            paymentStatus: 1,
            is_copy: this.isCopy,
            courierCharge: value.shipping_zila_id === AppSettings.DHAKA_ZILA_ID ? this.maxDhakaCharge : this.maxOutsideDhakaCharge
        };

        this.orderService.placeOrderWithoutPayment(requestPayload)
            .subscribe(data => {
                this.store.dispatch(new fromStore.LoadCurrentUser());
                this.store.dispatch(new fromStore.LoadCart());
                this.toastr.success("Your order has been placed without amount.", "Success!", {
                    positionClass: 'toast-top-right'
                });
                this.router.navigate(['/profile/orders/invoice/', data.id]);
                this.loaderService.hideLoader();
            }, error => {
                this.loaderService.hideLoader();
                this.store.dispatch(new fromStore.LoadCurrentUser());
                this.store.dispatch(new fromStore.LoadCart());
                this.toastr.error("Problem in placing your order.", "Oppppps!", {
                    positionClass: 'toast-bottom-right'
                });
            })
    }

    //Event method for submitting the form
    public formCheckout = ($event, value, modalTemplate: TemplateRef<any>) => {
        if (this.cartData && this.cartData.data.cart_items.length <= 0) {
            this.toastr.error("You have no items in your cart!", "Empty cart!", {
                positionClass: 'toast-bottom-right'
            });
            return false;
        }
        console.log('formCheckout', value)
        if (!(value && value.paymentType)) {
            this.toastr.error("Please select a payment method in order to proceed", "Error", {
                positionClass: 'toast-bottom-right'
            });
            return false;
        }

        let requestPayload = {
            user_id: this.user_id,

            billing_address: {
                id: this.newBillingAddress ? '' : value.billing_id,
                firstName: this.noShippingCharge ? (this.currentUser && this.currentUser.first_name) ? this.currentUser.first_name : 'Anonder' : value.firstName,
                lastName: this.noShippingCharge ? (this.currentUser && this.currentUser.last_name) ? this.currentUser.last_name : 'Bazar' : value.lastName,
                address: this.noShippingCharge ? 'Urban Rose, Suite-3B, House-61, Road-24, Gulshan-1' : value.address,
                country: value.country,
                phone: this.noShippingCharge ? (this.currentUser && this.currentUser.phone) ? this.currentUser.phone : '+8801958083908' : value.phone,
                postCode: this.noShippingCharge ? '1212' : value.postCode,
                upazila_id: this.noShippingCharge ? '6561' : value.upazila_id,
                zila_id: this.noShippingCharge ? AppSettings.DHAKA_ZILA_ID : value.zila_id,
                division_id: this.noShippingCharge ? '68' : value.division_id
            },
            shipping_address: {
                id: this.newShippingAddress ? '' : value.shipping_id,
                firstName: this.noShippingCharge ? (this.currentUser && this.currentUser.first_name) ? this.currentUser.first_name : 'Anonder' : value.shippingFirstName,
                lastName: this.noShippingCharge ? (this.currentUser && this.currentUser.last_name) ? this.currentUser.last_name : 'Bazar' : value.shippingAddress,
                address: this.noShippingCharge ? 'Urban Rose, Suite-3B, House-61, Road-24, Gulshan-1' : value.shippingAddress,
                country: value.shipping_country,
                phone: this.noShippingCharge ? (this.currentUser && this.currentUser.phone) ? this.currentUser.phone : '+8801958083908' : value.shippingPhone,
                postCode: this.noShippingCharge ? '1212' : value.shippingPostCode,
                upazila_id: this.noShippingCharge ? '6561' : value.shipping_upazila_id,
                zila_id: this.noShippingCharge ? AppSettings.DHAKA_ZILA_ID : value.shipping_zila_id,
                division_id: this.noShippingCharge ? '68' : value.shipping_division_id
            },
            paymentType: value.paymentType,
            is_copy: this.isCopy,
            courierCharge: value.shipping_zila_id === AppSettings.DHAKA_ZILA_ID ? this.maxDhakaCharge : this.maxOutsideDhakaCharge
        };

        if (value.paymentType == this.SSL_COMMERZ_PAYMENT_TYPE || value.paymentType === this.CASHBACK_PAYMENT_TYPE ||
            value.paymentType === this.NAGAD_PAYMENT_TYPE || value.paymentType === this.CASH_PAYMENT_TYPE) {
            this.loaderService.showLoader();
            this.orderService.placeOrder(requestPayload).subscribe(result => {

                console.log('result-SSLCommerce', result);
                this.loaderService.hideLoader();
                if (result && result.GatewayPageURL) {
                    this.store.dispatch(new fromStore.LoadCart());
                    window.location.href = result.GatewayPageURL;
                } else if (result && result.status === 'Success' && result.callBackUrl) {
                    this.store.dispatch(new fromStore.LoadCart());
                    window.location.href = result.callBackUrl;
                } else if (result && result.order_id) {
                    this.successOrderId = result.order_id;
                    this.store.dispatch(new fromStore.LoadCurrentUser());
                    this.store.dispatch(new fromStore.LoadCart());
                } else if (result && result.id) {
                    this.successOrderId = result.id;
                    this.store.dispatch(new fromStore.LoadCurrentUser());
                    this.store.dispatch(new fromStore.LoadCart());
                } else {
                    this.toastr.error("Problem in placing your order.", "Oppppps!", {
                        positionClass: 'toast-bottom-right'
                    });
                }
            }, (error) => {
                this.loaderService.hideLoader();
                if (error.error && error.error.additionalMessage) {
                    this.toastr.info(error.error.additionalMessage, "Order not place!", {
                        positionClass: 'toast-top-right'
                    });
                } else if (error && error.error) {
                    this.toastr.error(error.error.message, "Problem in placing your order!", {
                        positionClass: 'toast-bottom-right'
                    });
                } else {
                    this.toastr.error("Problem in placing your order.", "Oppppps!", {
                        positionClass: 'toast-bottom-right'
                    });
                }
            });

        } else if (value.paymentType === this.BKASH_PAYMENT_TYPE) {

            this.loaderService.showLoader();
            this.bKashService.getAuthUserWallets()
                .subscribe((res) => {
                    console.log(res);
                    this.authUserWallets = res;
                    this.loaderService.hideLoader();
                    this.bKashWalletModalRef = this.modalService.show(modalTemplate);
                }, (err) => {
                    console.log(err);
                    this.loaderService.hideLoader();
                });

        } else {
            this.toastr.success("Please Choose a Correct Payment Method", "Wrong Payment Method", {
                positionClass: 'toast-bottom-right'
            });
        }
    }

    disabledButtonClick(termsAndPolicy) {
        if (!termsAndPolicy) {
            this.toastr.error("Please read and agree to the Terms & Conditions, Privacy Policy and Refund and Return Policy of Anonder Bazar", "", {
                positionClass: 'toast-bottom-left'
            });
        }
    }

    proceedWithBkash($event, value, authUserWallet = null) {
        $event.preventDefault();
        let requestPayload: any = {};

        if (authUserWallet) {
            requestPayload.agreement_id = authUserWallet.agreement_id;
            requestPayload.payerReference = authUserWallet.wallet_no;

        } else {
            this.toastr.error("Please choose a bkash wallet to proceed.", "Error", {
                positionClass: 'toast-bottom-right'
            });
            return false;
        }

        if (this.cartData && this.cartData.data.cart_items.length <= 0) {
            this.toastr.error("You have no items in your cart!", "Empty cart!", {
                positionClass: 'toast-bottom-right'
            });
            return false;
        }
        console.log('formCheckout', value)
        if (!(value && value.paymentType)) {
            this.toastr.error("Please a payment method in order to proceed", "Error", {
                positionClass: 'toast-bottom-right'
            });
            return false;
        }

        requestPayload = {
            ...requestPayload,
            billing_address: {
                id: this.newBillingAddress ? '' : value.billing_id,
                firstName: this.noShippingCharge ? (this.currentUser && this.currentUser.first_name) ? this.currentUser.first_name : 'Anonder' : value.firstName,
                lastName: this.noShippingCharge ? (this.currentUser && this.currentUser.last_name) ? this.currentUser.last_name : 'Bazar' : value.lastName,
                address: this.noShippingCharge ? 'Urban Rose, Suite-3B, House-61, Road-24, Gulshan-1' : value.address,
                country: value.country,
                phone: this.noShippingCharge ? (this.currentUser && this.currentUser.phone) ? this.currentUser.phone : '+8801958083908' : value.phone,
                postCode: this.noShippingCharge ? '1212' : value.postCode,
                upazila_id: this.noShippingCharge ? '6561' : value.upazila_id,
                zila_id: this.noShippingCharge ? AppSettings.DHAKA_ZILA_ID : value.zila_id,
                division_id: this.noShippingCharge ? '68' : value.division_id
            },
            shipping_address: {
                id: this.newShippingAddress ? '' : value.shipping_id,
                firstName: this.noShippingCharge ? (this.currentUser && this.currentUser.first_name) ? this.currentUser.first_name : 'Anonder' : value.shippingFirstName,
                lastName: this.noShippingCharge ? (this.currentUser && this.currentUser.last_name) ? this.currentUser.last_name : 'Bazar' : value.shippingAddress,
                address: this.noShippingCharge ? 'Urban Rose, Suite-3B, House-61, Road-24, Gulshan-1' : value.shippingAddress,
                country: value.shipping_country,
                phone: this.noShippingCharge ? (this.currentUser && this.currentUser.phone) ? this.currentUser.phone : '+8801958083908' : value.shippingPhone,
                postCode: this.noShippingCharge ? '1212' : value.shippingPostCode,
                upazila_id: this.noShippingCharge ? '6561' : value.shipping_upazila_id,
                zila_id: this.noShippingCharge ? AppSettings.DHAKA_ZILA_ID : value.shipping_zila_id,
                division_id: this.noShippingCharge ? '68' : value.shipping_division_id
            },
            paymentType: value.paymentType,
            is_copy: this.isCopy,
        };


        this.loaderService.showLoader();
        this.orderService.placeOrder(requestPayload).subscribe(result => {
            this.loaderService.hideLoader();
            // this.store.dispatch(new fromStore.LoadCart());
            if (result && result.bkashURL) {
                window.location.href = result.bkashURL;
            } else {
                this.toastr.error("Problem in placing your order.", "Problem", {
                    positionClass: 'toast-bottom-right'
                });
            }
        }, (error) => {
            this.loaderService.hideLoader();
            console.log('bKash place order ', error);
            if (error && error.error) {
                this.toastr.error(error.error, "Problem", {
                    positionClass: 'toast-bottom-right'
                });
            } else {
                this.toastr.error("Problem in placing your order.", "Problem", {
                    positionClass: 'toast-bottom-right'
                });
            }
        });
    }

    //Method for division change
    divisionChange($event, type) {
        var divisionId = $event.target.value;
        if (type == 'shipping') {
            this.updateGrandTotal();
            this.areaService.getAllZilaByDivisionId(divisionId).subscribe(result => {
                this.shippingZilaSearchOptions = result.sort((a, b) => a.name.localeCompare(b.name));
                this.shippingUpazilaSearchOptions = [];
            });
        } else {
            this.areaService.getAllZilaByDivisionId(divisionId).subscribe(result => {
                this.zilaSearchOptions = result.sort((a, b) => a.name.localeCompare(b.name));
                this.upazilaSearchOptions = [];
            });
        }
    }

    // Method for zila change
    zilaChange($event, type) {
        var zilaId = $event.target.value;
        if (type == 'shipping') {
            this.areaService.getAllUpazilaByZilaId(zilaId).subscribe(result => {
                this.shippingUpazilaSearchOptions = result.sort((a, b) => a.name.localeCompare(b.name));
            });
            this.updateGrandTotal(true, zilaId);
        } else {
            this.areaService.getAllUpazilaByZilaId(zilaId).subscribe(result => {
                this.upazilaSearchOptions = result.sort((a, b) => a.name.localeCompare(b.name));
            });
        }
    }

    //Method for showing delivery section
    showDelivarySection() {
        this.isDelivery = true;
        this.isPickup = false;
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
            // console.log('formValue==>', formValue);

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
            return formValue.shippingAddress + ', ' +
                (division ? division.name : '') + ', ' +
                (shipping_upazila ? shipping_upazila.name : '') + ', ' +
                (shipping_zila ? shipping_zila.name : '');
        } else {
            let division = this.divisionSearchOptions.find(x => x.id == formValue.division_id);
            let shipping_upazila = this.upazilaSearchOptions.find(x => x.id == formValue.upazila_id);
            let shipping_zila = this.zilaSearchOptions.find(x => x.id == formValue.zila_id);
            return formValue.address + ', ' +
                (division ? division.name : '') + ', ' +
                (shipping_upazila ? shipping_upazila.name : '') + ', ' +
                (shipping_zila ? shipping_zila.name : '');
        }
    }

    //Method for proceed to pay
    processToPay(modalContent) {
        if(!this.isAllowedToProcessToPay){
            this.wrongCartItemsModalRef = this.modalService.show(modalContent);
            return false;
        }
        // console.log('--------------------processToPay----------------------', this.isCopy, this.cartData, this.checkoutForm);

        // console.log('this.isCopy==>', this.isCopy);
        // console.log('this.cartData==>', this.cartData);
        // console.log('this.checkoutForm==>', this.checkoutForm);

        if (!this.noShippingCharge && this.isCopy) {
            // console.log('call copyAll');
            this.copyAll();
        }

        // if (this.checkoutForm.invalid) {
        //     this.showFormError = true;
        //     this.toastr.error("Edit or Re-input your address information correctly and update your address information.", "Please!", {
        //         positionClass: 'toast-top-right'
        //     });
        //     window.scroll(0, 0);
        //     return false;
        // }

        // if (!this.noShippingCharge && this.isCopy) {
        //     this.copyAll();
        // }

        if (this.cartData && (typeof this.cartData.data === 'undefined' || this.cartData.data.cart_items.length <= 0)) {
            this.toastr.error("You have no items in your cart!", "Empty cart!", {
                positionClass: 'toast-bottom-right'
            });
            window.scroll(0, 0);
            return false;
        }
        if (this.checkoutForm.invalid && !this.noShippingCharge) {
            this.showFormError = true;
            this.toastr.error("Both shipping and billing address is required!", "Sorry!", {
                positionClass: 'toast-bottom-right'
            });
            window.scroll(0, 0);
            return false;
        }
        window.scroll(0, 0);
        this.showPayment = true
    }

    changeCartItemQuantity(cartItem, action) {

        this.updateCartItem(cartItem, action);
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

    private addPageTitle() {
        if (this.cartData) {
            this.title.setTitle('Checkout ' + this.cartData.data.total_quantity + ' item(s) - Anonderbazar');
        } else {
            this.title.setTitle('Checkout - Anonderbazar');
        }
    }

    noBKashWalletAction(event: any) {
        event.preventDefault();
        this.bKashWalletModalRef.hide();
        this.router.navigate(["/profile/bkash-accounts"]);
    }

    onRemoved(file: FileHolder) {
        if(this.ImageFile.length > 0){
            let imagePath = this.ImageFile[this.storeImageFileName.findIndex(e => e.name === file.file.name)];


            let formData = new FormData();
            formData.append('oldImagePath', `${imagePath.split(this.IMAGE_ENDPOINT)[1]}`);

            this.designImagesService.deleteImage(formData)
                .subscribe(data => {
                    this.ImageFile.splice(this.storeImageFileName.findIndex(e => e.name === file.file.name), 1);
                    this.storeImageFileName.splice(this.storeImageFileName.findIndex(e => e.name === file.file.name), 1);
                    if(this.ImageFile.length <= 0){
                        this.showImageMissingValidation = true;
                    }
                    this.toastr.success("Successfully deleted image", "Success!", {});

                }, error => {
                    console.log("Error occurred: ", error);
                    this.toastr.error("Error occurred while deleting image", "Error!", {});
                })
        }
    }

    onBeforeUpload = (metadata: UploadMetadata) => {
        let formData = new FormData();
        formData.append('image', metadata.file, metadata.file.name);

        this.designImagesService.insertImage(formData)
            .subscribe(data => {
                this.ImageFile.push(this.IMAGE_ENDPOINT + data.path);
                this.storeImageFileName.push(metadata.file);
                this.showImageMissingValidation = false;
                this.toastr.success("Successfully uploaded image", "Success!", {});
                }, error => {
                console.log("Error occurred: ", error);
                this.toastr.error("Unstable Internet connection while uploading image", "Error!", {});
            })
        return metadata;
    };

    showOfflineForm(flag) {
        this.isShowOfflineForm = flag;
    }
}
