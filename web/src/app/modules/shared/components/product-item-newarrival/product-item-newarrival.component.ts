import {Component, Input, OnInit} from '@angular/core';
import {Router} from "@angular/router";
import {Store} from "@ngrx/store";
import {Observable} from "rxjs/Observable";
import {ToastrService} from "ngx-toastr";
import {NgProgress} from "@ngx-progressbar/core";
import {NotificationsService} from "angular2-notifications";
import {AppSettings} from "../../../../config/app.config";
import {FavouriteProduct, Product} from "../../../../models";
import * as fromStore from "../../../../state-management/index";
import {AuthService, CartItemService, FavouriteProductService} from "../../../../services";
import {LoginModalService} from "../../../../services/ui/loginModal.service";
import {CompareService} from "../../../../services/compare.service";

@Component({
    selector: 'app-product-item-newarrival',
    templateUrl: './product-item-newarrival.component.html',
    styleUrls: ['./product-item-newarrival.component.scss']
})
export class ProductItemNewArrivalComponent implements OnInit {

    @Input() dataProductNewArrival;

    IMAGE_ENDPOINT = AppSettings.IMAGE_ENDPOINT;
    IMAGE_LIST_ENDPOINT = AppSettings.IMAGE_LIST_ENDPOINT;

    newItem: Product;
    compare$: Observable<any>;
    favourites$: Observable<FavouriteProduct>;
    isDisplay: boolean;
    discountBadgeIcon: any;
    discountPercentage: number = 0;
    product: Product;
    cart$: Observable<any>;
    cartId: any;
    cartTotalprice: any;
    cartTotalquantity: any;

    constructor(private router: Router, private store: Store<fromStore.HomeState>,
                private favouriteProductService: FavouriteProductService,
                private authService: AuthService,
                private loginModalService: LoginModalService,
                private compareService: CompareService,
                private _notify: NotificationsService,
                public _progress: NgProgress,
                private cartItemService: CartItemService,
                private toastr: ToastrService) {

        this.isDisplay = false;
        this.discountBadgeIcon = AppSettings.IMAGE_ENDPOINT + '/images/discount-icon.svg'
    }

    //Event method for getting all the data for the page
    ngOnInit() {
        this.compare$ = this.store.select<any>(fromStore.getCompare);
        this.favourites$ = this.store.select<any>(fromStore.getFavouriteProduct);
        this.newItem = this.dataProductNewArrival;
        this.cart$ = this.store.select<any>(fromStore.getCart);
        this.cart$.subscribe(result => {
            if (result) {
                this.cartId = result.data.id;
            }
        });

        this.discountPercentage = 0
        if (this.newItem.promotion) {
            this.discountPercentage = ((this.newItem.price - this.newItem.promo_price) / this.newItem.price) * 100.0
        }
    }

    //Method for add to cart
    clickToImage(event, productId) {
        this.router.navigate(['/product-details/', productId]);
    }

    //Method for add to cart
    addToCartClickHandler(event: any, product: any) {
        event.stopPropagation();
        console.log('addToCartClickHandler');
        this.addToCart(product);
    }

    //Method for add to cart

    addToCart(product: any, callback?) {
        if (product.product_variants.length > 0) {
            this.router.navigate([`/product-details/${product.id}`]);
            return false;
        }
        if (this.authService.getCurrentUserId()) {
            this._progress.start("mainLoader");
            let product_total_price: number = product.promotion ? product.promo_price : product.price;
            const cartItemData = {
                cart_id: this.cartId,
                product_id: product.id,
                product_quantity: 1,
                product_total_price: product_total_price,
            };
            this.cartItemService
                .insert(cartItemData)
                .subscribe(
                    result => {
                        this.store.dispatch(new fromStore.LoadCart());
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

    //Method for add to favourite

    addToFavourite(newItem: Product) {
        let userId = this.authService.getCurrentUserId();
        if (userId) {
            let f = {
                product_id: newItem.id,
                user_id: userId,
            };
            this.store.dispatch(new fromStore.AddToFavouriteProduct(f));
            this.toastr.success("add to Whishlist succeeded", 'Note');
        } else {
            this._notify.create("warning", "Please Login First");
            this.loginModalService.showLoginModal(true)

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

    addToCompare(newItem: Product) {

        let userId = this.authService.getCurrentUserId();
        if (userId) {

            this.store.dispatch(new fromStore.AddToCompare(newItem));
            this.compareService.addToCompare(newItem);
            this._notify.success('add to compare succeeded');
        } else {
            this._notify.create("warning", "Please Login First");

            this.loginModalService.showLoginModal(true)

        }
    }

    //Method for remove from compare

    removeFromCompare(product: Product) {
        let userId = this.authService.getCurrentUserId();
        if (userId) {
            this.store.dispatch(new fromStore.RemoveFromCompare(product));
            this.compareService.removeFromCompare(product);
            this._notify.success('remove from compare succeeded');
        } else {
            this._notify.create("warning", "Please Login First");
            this.loginModalService.showLoginModal(true)
        }
    }

    //Method for direct buy

    buyNow(product) {
        this.addToCart(product, () => {
            this.router.navigate([`/checkout`]);
        });
    }

    erroralert() {
        this._notify.error('compare list is full, delete first!!!');
    }
}
