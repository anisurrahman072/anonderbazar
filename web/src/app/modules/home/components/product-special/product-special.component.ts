import {AppSettings} from "../../../../config/app.config";
import {Component, OnInit} from "@angular/core";
import {ActivatedRoute} from "@angular/router";
import {Subscription} from "rxjs/Subscription";
import {Store} from "@ngrx/store";
import {Observable} from "rxjs/Observable";
import {AlertsService} from "@jaspero/ng2-alerts";
import {NgProgress} from "@ngx-progressbar/core";
import {NotificationsService} from "angular2-notifications";
import {ToastrService} from "ngx-toastr";
import {FavouriteProduct, Product} from "../../../../models";
import {
    AuthService,
    CartItemService,
    CartItemVariantService,
    CartService,
    CategoryProductService,
    CmsService,
    ProductService,
    ProductVariantService
} from "../../../../services";
import * as fromStore from "../../../../state-management";
import {LoginModalService} from "../../../../services/ui/loginModal.service";
import {GLOBAL_CONFIGS} from "../../../../../environments/global_config";


@Component({
    selector: "home-product-special",
    templateUrl: "./product-special.component.html",
    styleUrls: ["./product-special.component.scss"]
})
export class ProductSpecialComponent implements OnInit {
    data: Product;
    IMAGE_ENDPOINT = AppSettings.IMAGE_ENDPOINT;
    IMAGE_EXT = GLOBAL_CONFIGS.productImageExtension;

    private sub: Subscription;
    private sub1: Subscription;
    id: any;
    cart$: Observable<any>;
    cartId: any;
    cartTotalprice: any;
    cartTotalquantity: any;
    currentUser: Observable<any>;
    product_quantity: any = 1;
    addTofavouriteLoading$: Observable<boolean>;
    tag: any;
    compare$: Observable<any>;
    favourites$: Observable<FavouriteProduct>;
    promoCategories: any[];
    counter: any;
    clock: any;

    constructor(
        private route: ActivatedRoute,
        private _notify: NotificationsService,
        private _alert: AlertsService,
        public _progress: NgProgress,
        private cmsService: CmsService,
        private store: Store<fromStore.HomeState>,
        private productVariantService: ProductVariantService,
        private productService: ProductService,
        private cartService: CartService,
        private authService: AuthService,
        private cartItemService: CartItemService,
        private loginModalService: LoginModalService,
        private categoryProductService: CategoryProductService,
        private cartItemVariantService: CartItemVariantService,
        private toastr: ToastrService,
    ) {
    }

    //Event method for getting all the data for the page
    ngOnInit() {
        this.compare$ = this.store.select<any>(fromStore.getCompare);
        this.favourites$ = this.store.select<any>(fromStore.getFavouriteProduct);

        this.addTofavouriteLoading$ = this.store.select<any>(
            fromStore.getFavouriteProductLoading
        );

        this.sub1 = this.addTofavouriteLoading$.subscribe(res => {
            if (res) {
                this._progress.start("mainLoader");
            } else {
                this._progress.complete("mainLoader");
            }
        });

        this.cart$ = this.store.select<any>(fromStore.getCart);
        this.cart$.subscribe(result => {
            if (result) {
                this.cartId = result.id;
                this.cartTotalprice = result.total_price;
                this.cartTotalquantity = result.total_quantity;
            }
        });
        this.getPromoCategoey();

    }

    //Event method for getting all promo category
    private getPromoCategoey() {
        this.cmsService
            .getBySubSectionName('POST', 'HOME', 'CATEGORY')
            .subscribe(result => {
                this.promoCategories = result;
                this.promoCategories.forEach(element => {
                    this.categoryProductService.getById(element.data_value[0].category_id).subscribe(category => {
                        element.data_value[0].category_id = category;
                    });

                });
            });

    }

    ngOnDestroy(): void {
        this.sub ? this.sub.unsubscribe() : "";
        this.sub1 ? this.sub1.unsubscribe() : "";
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
            this.toastr.success("add to Whishlist succeeded", 'Note');
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

}
