import {AfterViewChecked, Component, ElementRef, OnDestroy, OnInit, TemplateRef} from "@angular/core";
import {Meta, Title} from '@angular/platform-browser';
import {ActivatedRoute, Router} from "@angular/router";
import {Subscription} from "rxjs/Subscription";
import {Store} from "@ngrx/store";
import {Observable} from "rxjs/Observable";
import {AlertsService} from "@jaspero/ng2-alerts";
import {NgProgress} from "@ngx-progressbar/core";
import {NotificationsService} from "angular2-notifications";
import {FavouriteProduct, Product} from "../../../../models";
import {AppSettings} from "../../../../config/app.config";
import {
    AuthService,
    CartItemService,
    CartItemVariantService,
    CartService,
    CraftsmanService,
    FavouriteProductService,
    ProductService,
    ProductVariantService
} from "../../../../services";
import * as fromStore from "../../../../state-management";
import {LoginModalService} from "../../../../services/ui/loginModal.service";
import {ToastrService} from "ngx-toastr";
import {PartService} from "../../../../services/part.service";
import {ChatService} from "../../../../services/chat.service";
import {BsModalRef, BsModalService} from 'ngx-bootstrap/modal';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {DesignimageService} from "../../../../services/designimage.service";
import {LoaderService} from "../../../../services/ui/loader.service";
import {GLOBAL_CONFIGS} from "../../../../../environments/global_config";

@Component({
    selector: "page-product-details",
    templateUrl: "./product-details.component.html",
    styleUrls: ["./product-details.component.scss"]
})
export class ProductDetailsComponent implements OnInit, AfterViewChecked, OnDestroy {
    couponProductModalRef: BsModalRef;
    similarProducts;
    id: any;
    data: Product;
    productVariants: any;
    private sub: Subscription;
    private sub1: Subscription;
    IMAGE_ENDPOINT = AppSettings.IMAGE_ENDPOINT;
    RESIZED_IMAGE_ENDPOINT = AppSettings.IMAGE_ORIGINAL_RESIZED_ENDPOINT;
    IMAGE_EXT = GLOBAL_CONFIGS.productImageExtension;
    discountBadgeIcon: any;
    cart$: Observable<any>;
    cartId: any;
    mainImg: string;
    cartTotalprice: any;
    cartTotalquantity: any;
    discountPercentage: any;
    currentUser: Observable<any>;
    product_quantity: any = 1;
    tempRating: any;
    addTofavouriteLoading$: Observable<boolean>;
    tag: any;
    compare$: Observable<any>;
    favourites$: Observable<FavouriteProduct>;
    availableDateLoading: boolean = false;
    allTheParts: any;
    variantCalculatedPrice: {
        warehouse_variant_id?;
        product_variant_id?;
        name?;
        price?;
        quantity?;
        variant_name?;
        variant_id?;
    }[] = [];
    variantCalculatedTotalPrice: number = 0;
    clock: any = [9, 10, 11, 12, 13, 14, 15, 16, 17];
    finalprice: any = 0.0;
    unitPrice: any = 0.0;
    counter: number;

    selectedIndex: number;
    designCombinationData: any;
    total: any;
    buffer_time: any;
    isVisible: boolean = false;
    isVisibleFab: boolean = false;
    chatForm: FormGroup;
    currentUserId: any;
    userId: any;
    recentlyViewedProducts: Observable<any>;
    primaryPicture: string;
    addToCartSuccessProduct: any;
    addToWhishlistSuccessProduct: any;
    currentUser$: Observable<any>;

    constructor(
        private route: ActivatedRoute,
        private chatService: ChatService,
        private title: Title,
        private meta: Meta,
        private _notify: NotificationsService,
        private _alert: AlertsService,
        public _progress: NgProgress,
        private store: Store<fromStore.HomeState>,
        private productVariantService: ProductVariantService,
        private productService: ProductService,
        private cartService: CartService,
        private authService: AuthService,
        private cartItemService: CartItemService,
        private loginModalService: LoginModalService,
        private cartItemVariantService: CartItemVariantService,
        private toastr: ToastrService,
        private designImageService: DesignimageService,
        private fb: FormBuilder,
        private modalService: BsModalService,
        private craftsmanService: CraftsmanService,
        private partService: PartService,
        private router: Router,
        public loaderService: LoaderService,
        private favouriteProductService: FavouriteProductService,
        private _elementRef: ElementRef
    ) {
        this.chatForm = this.fb.group({
            message: ["", Validators.required],
            files: [""]
        });
        this.discountBadgeIcon = AppSettings.IMAGE_ENDPOINT + '/images/discount-icon.svg'
    }

    //Event method for getting all the data for the page
    ngOnInit() {
        this.currentUserId = this.authService.getCurrentUserId();
        if (this.currentUserId) {
            this.isVisibleFab = true;
        }
        this.currentUser$ = this.store.select<any>(fromStore.getCurrentUser);
        this.currentUser$.subscribe((currentUser) => {
            if (currentUser && currentUser.id) {
                this.currentUserId = currentUser.id;
            }
        }, (error) => {
            console.log('currentUser$', error);
        });

        this.compare$ = this.store.select<any>(fromStore.getCompare);
        this.favourites$ = this.store.select<any>(fromStore.getFavouriteProduct);

        this.addTofavouriteLoading$ = this.store.select<any>(
            fromStore.getFavouriteProductLoading
        );

        this.partService.getAllParts().subscribe(result => {
            this.allTheParts = result.data;
        });

        this.sub1 = this.addTofavouriteLoading$.subscribe(res => {
            if (res) {
                this._progress.start("mainLoader");
            } else {
                this._progress.complete("mainLoader");
            }
        });
        this.partService
            .getAllCombinationByProductId(this.route.snapshot.params["id"])
            .subscribe(res => {
                this.designCombinationData = res.data;
            });

        this.cart$ = this.store.select<any>(fromStore.getCart);
        this.cart$.subscribe(result => {
            if (result) {
                this.cartId = result.data.id;
                this.cartTotalprice = result.data.total_price;
                this.cartTotalquantity = result.data.total_quantity;
            }
        });

        this.sub = this.route.params.subscribe(params => {
            this.id = +params["id"];

            this.getProductData();
            this.getAllVariant();
        });

        this.getRecentlyViewedProducts();
    }

/*    buyCouponProduct(product) {
        if (this.currentUserId) {
            this.addProductToCart(product, () => {
                this.router.navigate([`/checkout`]);
                this.couponProductModalRef.hide();
            });
        } else {
            this.couponProductModalRef.hide();
            this.loginModalService.showLoginModal(true);
        }
    }*/

    defaultVariantSelection() {
        for (let v of this.productVariants) {
            let variant = v.warehouse_variants[0]
            this.onVariantChange(variant)
        }
    }

    //Event method for getting all recently viewed product
    private getRecentlyViewedProducts() {
        this.recentlyViewedProducts = this.productService.getAllHotProducts();
    }

    ngAfterViewChecked() {
        // this.scrollToBottom();
    }

    getProductData() {
        this.loaderService.showLoader();
        this.productService.getByIdWithDetails(this.id).subscribe(result => {
            this.loaderService.hideLoader();
            this.data = result;

            this.addPageTitleNMetaTag();

            this.discountPercentage = 0;

            if (this.data.promotion) {
                this.discountPercentage = ((this.data.price - this.data.promo_price) / this.data.price) * 100.0
            }

            if (result) {
                let allImages = [];

                this.primaryPicture = AppSettings.IMAGE_ORIGINAL_RESIZED_ENDPOINT + this.data.image + this.IMAGE_EXT;

                if (this.data.image) {
                    allImages.push({'image_path': this.data.image});
                }
                if (result.product_images) {
                    result.product_images.forEach(element => {
                        allImages.push(element);
                    });
                }
                if (this.data.id == 6016) {
                    this.product_quantity = 2;
                }
                result.product_images = allImages;

                this.buffer_time = this.data.warehouse_id.buffer_time;
                this.getProductAvailableDate(this.buffer_time);

                this.mainImg = this.data.image;
                this.tempRating = result.rating;
                if (result.tag != "undefined") {
                    this.tag = JSON.parse(result.tag);
                }
                this.updateFinalprice();
                this.getSimilarProductData(result.category_id.id, result.id);
            }
        }, (error) => {
            this._notify.error('Problem!', "Problem in loading the product");
        });
    }

    getSimilarProductData(categotyId, productId) {
        this.similarProducts = this.productService.getByCategory(
            categotyId,
            productId
        );
    }

    updateFinalprice() {
        if (this.data) {
            this.unitPrice = this.data.promotion ? this.data.promo_price : this.data.price;
            this.finalprice = (this.unitPrice + this.variantCalculatedTotalPrice);
        }
    }

    getAllVariant() {
        this.loaderService.showLoader();
        this.productVariantService
            .getAllVariantByProductId(this.id)
            .subscribe(result => {
                this.loaderService.hideLoader();
                if (result) {
                    this.productVariants = result;
                    this.defaultVariantSelection();
                }
            });
    }

    //Method for add to cart
    addProductToCart(product: any, callback?) {
        if (this.productVariants.length !== this.variantCalculatedPrice.length) {
            this.toastr.error('Please select all variant!', 'Note');
            return false;
        }
        if (this.authService.getCurrentUserId()) {
            this._progress.start("mainLoader");
            let product_total_price: number =
                (this.unitPrice +
                    this.variantCalculatedTotalPrice) *
                this.product_quantity;

            let variants = [];
            let data = {};
            this.variantCalculatedPrice.forEach(v => {
                variants.push({
                    warehouse_variant_id: v.warehouse_variant_id,
                    variant_id: v.variant_id,
                    product_variant_id: v.product_variant_id
                })
            });
            let qty = this.product_quantity;

            if (variants.length == 0) {
                data = {
                    cart_id: this.cartId,
                    product_id: this.data.id,
                    product_quantity: qty,
                    product_unit_price: this.unitPrice + this.variantCalculatedTotalPrice,
                    product_total_price: product_total_price,
                };
            } else {
                data = {
                    cart_id: this.cartId,
                    product_id: this.data.id,
                    product_quantity: qty,
                    product_unit_price: this.unitPrice + this.variantCalculatedTotalPrice,
                    product_total_price: product_total_price,
                    cartItemVariants: variants
                };
            }
            this.cartItemService
                .insert(data)
                .subscribe(
                    result => {
                        this.store.dispatch(new fromStore.LoadCart());

                        this.addToCartSuccessProduct = product;
                        setTimeout(() => {
                            this.addToCartSuccessProduct = undefined;
                        }, 5000);

                        this._progress.complete("mainLoader");
                        this.toastr.success("Product Successfully Added To cart: " + product.name + " - ৳" + product_total_price, 'Note');

                        if (callback) {
                            callback();
                        }
                    },
                    error => {
                        this._progress.complete("mainLoader");
                        this._notify.error("something went wrong");
                    }
                );
        } else {
            this.toastr.success("warning", "Please Login First");
            this.loginModalService.showLoginModal(true);
        }
    }

    //Method for direct buy
    buyNow(product) {
        if (this.currentUserId) {
            this.addProductToCart(product, () => {
                this.router.navigate([`/checkout`]);
            });
        } else {
            this.loginModalService.showLoginModal(true);
        }
    }

    getProductAvailableDate(buffer_time: any) {
        this.availableDateLoading = true;
    }

    ngOnDestroy(): void {
        this.sub ? this.sub.unsubscribe() : "";
        this.sub1 ? this.sub1.unsubscribe() : "";
    }

    ratingChange(newValue): void {
        /*ready for serve*/
        let userId = this.authService.getCurrentUserId();
        if (userId) {
            this._progress.start("mainLoader");
            this.productService
                .sendRating({productId: this.data.id, rating: this.tempRating})
                .subscribe(res => {
                    this._progress.complete("mainLoader");
                    this._notify.success("success", "rating...");
                });
        } else {
            this._notify.create("warning", "Please Login First");
            this.loginModalService.showLoginModal(true);

            setTimeout(() => {
                this.tempRating = this.data.rating;
            });
        }
    }

    //Method for increase product quantity in shopping cart modal
    increaseProduct_quantity() {
        if (this.product_quantity < this.data.quantity) {
            this.product_quantity += 1;
            this.getProductAvailableDate(this.buffer_time);
        } else {
            this.toastr.error('Unable to increase quantity!', 'Sorry!');
            return false;
        }
    }

    //Method for decrese product quantity in shopping cart modal
    decreaseProduct_quantity() {
        if (this.product_quantity > 1) {
            this.product_quantity -= 1;
            this.getProductAvailableDate(this.buffer_time);
        } else {
            this.toastr.error('Unable to decrease quantity!', 'Sorry!');
            return false;
        }
    }

    //Method for add to favourite
    addToFavourite(product: Product) {
        let userId = this.authService.getCurrentUserId();
        if (userId) {
            let f = {
                product_id: product.id,
                user_id: userId
            };

            this.store.dispatch(new fromStore.AddToFavouriteProduct(f));
            this.addToWhishlistSuccessProduct = product;
            setTimeout(() => {
                this.addToWhishlistSuccessProduct = undefined;
            }, 5000);

        } else {
            this._notify.create("warning", "Please Login First");
            this.loginModalService.showLoginModal(true);
        }
    }

    //Method for remove from favourite
    removeFromFavourite(favouriteProduct) {
        let userId = this.authService.getCurrentUserId();
        if (userId) {
            if (favouriteProduct) {
                this.favouriteProductService.delete(favouriteProduct.id).subscribe(res => {
                    this.store.dispatch(new fromStore.LoadFavouriteProduct());
                    this.toastr.info("Product removed from wishlist successfully.", "Note");
                })
            }
        } else {
            this._notify.create("warning", "Please Login First");
            this.loginModalService.showLoginModal(true);
        }
    }

    //Method for add to compare
    addToCompare(product: Product) {
        this.store.dispatch(new fromStore.AddToCompare(product));
        this._notify.success("add to compare succeeded");
    }

    erroralert() {
        this._notify.error("compare list is full, delete first!!!");
    }

    checkSelected(variant) {

        return this.variantCalculatedPrice.find(v => v.variant_name == variant.variant_id.name && v.product_variant_id == variant.id);
    }

    onVariantChange(variant) {

        let isExist = this.variantCalculatedPrice.find(v => v.variant_name == variant.variant_id.name);
        if (isExist) {
            let index = this.variantCalculatedPrice.indexOf(isExist);
            this.variantCalculatedPrice[index] = {
                warehouse_variant_id: variant.warehouses_variant_id.id,
                product_variant_id: variant.id,
                name: variant.name,
                quantity: variant.quantity,
                variant_name: variant.variant_id.name,
                variant_id: variant.variant_id.id
            }
        } else {
            this.variantCalculatedPrice.push({
                warehouse_variant_id: variant.warehouses_variant_id.id,
                product_variant_id: variant.id,
                name: variant.name,
                quantity: variant.quantity,
                variant_name: variant.variant_id.name,
                variant_id: variant.variant_id.id
            });
        }

        this.variantCalculatedTotalPrice = 0;
        this.variantCalculatedPrice.map(vp => {
            this.variantCalculatedTotalPrice += vp.quantity
        });
        console.log('this.variantCalculatedPrice', this.variantCalculatedPrice)
        this.updateFinalprice();
    }


    showCouponProductModal(template: TemplateRef<any>) {
        this.couponProductModalRef = this.modalService.show(template, Object.assign({}, {class: 'term-condition-modal modal-lg'}));
        document.getElementById('scroll').scrollIntoView({ behavior: 'smooth', block: 'end' });
/*        setTimeout(() => {
            this.scrollToBottom();
        }, 2000);*/
    }

    //Method for scroll to bottom
    scrollToBottom(): void {
        try {
            const domElem = this._elementRef.nativeElement.querySelector('#coupon-term-cond-modal-body');
            domElem.scrollTop = domElem.scrollHeight;
        } catch (err) {
            console.log(err);
        }
    }

    private addPageTitleNMetaTag() {
        this.title.setTitle(this.data.name);
        this.meta.addTag({
            property: 'og:title',
            content: this.data.name
        });

        this.meta.addTag({
            property: 'og:description',
            content: this.data.product_details
        });
        this.meta.addTag({
            property: 'og:image',
            content: this.IMAGE_ENDPOINT + this.data.image
        });

        this.meta.addTag({
            property: 'og:url',
            content: AppSettings.FRONTEND_ENDPOINT + '/product-details/127'
        });

        this.meta.addTag({
            name: 'twitter:title',
            content: this.data.name
        });

        this.meta.addTag({
            name: 'twitter:description',
            content: this.data.product_details
        });
        this.meta.addTag({
            name: 'twitter:image',
            content: this.IMAGE_ENDPOINT + this.data.image
        });

    }
}
