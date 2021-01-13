import {Component, Directive, Input, OnInit} from '@angular/core';
import {AppSettings} from "../../../../config/app.config";
import {Router} from "@angular/router";
import {FavouriteProduct, Product} from "../../../../models/index";
import * as fromStore from "../../../../state-management/index";
import {Store} from "@ngrx/store";
import {Observable} from "rxjs/Observable";
import {WOW} from "ngx-wow/services/wow.service";
import {AuthService, CartItemService, FavouriteProductService} from "../../../../services";
import {catchError, map} from "rxjs/operators";
import * as cartActions from "../../../../state-management/actions/cart.action";
import {of} from "rxjs/observable/of";
import {NotificationsService} from "angular2-notifications";
import {LoginModalService} from "../../../../services/ui/loginModal.service";
import {CompareService} from "../../../../services/compare.service";
import {ToastrService} from "ngx-toastr";
import {NgProgress} from "@ngx-progressbar/core";


@Component({
    selector: 'app-product-item-feedback',
    templateUrl: './product-item-feedback.component.html',
    styleUrls: ['./product-item-feedback.component.scss']
})
export class ProductItemFeedbackComponent implements OnInit {
    IMAGE_ENDPOINT = AppSettings.IMAGE_ENDPOINT;
    @Input() dataProductFeedback;
    product: Product;
    compare$: Observable<any>;
    favourites$: Observable<FavouriteProduct>;
    isDisplay: boolean;
    cart$: Observable<any>;
    cartId: any;
    discountBadgeIcon: any;
    constructor(private router: Router, private store: Store<fromStore.HomeState>,
                private favouriteProductService: FavouriteProductService,
                private authService: AuthService,
                private loginModalService: LoginModalService,
                private compareService: CompareService,
                private _notify: NotificationsService,
                private toastr: ToastrService,
                public _progress: NgProgress,
                private cartItemService: CartItemService,) {
                    this.isDisplay = false;
        this.discountBadgeIcon = AppSettings.IMAGE_ENDPOINT + '/images/discount-icon.svg'
    }
  //Event method for getting all the data for the page
    ngOnInit() {
        this.compare$ = this.store.select<any>(fromStore.getCompare);
        this.favourites$ = this.store.select<any>(fromStore.getFavouriteProduct);
        this.product = this.dataProductFeedback;
        this.cart$ = this.store.select<any>(fromStore.getCart);
        this.cart$.subscribe(result => {
            if (result) {
                this.cartId = result.data.id;
            }
        });
    }


    //Method for add to cart
    clickToImage(event, productId) {
        this.router.navigate(['/product-details/', productId]);
    }
  //Method for add to cart

    addToCart(product: any, callback?) {
        if (this.product.product_variants.length > 0) {
            this.router.navigate([`/product-details/${product.id}`]);
            return false;
        }
        if (this.authService.getCurrentUserId()) {
            this._progress.start("mainLoader");
            let product_total_price: number =  this.product.promotion ? this.product.promo_price : this.product.price;
            const cartItemData={
                cart_id:  this.cartId,
                product_id: this.product.id,
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

                        if(callback){
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

    buyNow(product){
        this.addToCart(product, ()=>{
            this.router.navigate([`/checkout`]);
        });
    }

  //Method for add to favourite

    addToFavourite(product: Product) {

        let userId = this.authService.getCurrentUserId();
        if (userId) {
            let f = {
                product_id: product.id,
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

    addToCompare(product: Product) {

        let userId = this.authService.getCurrentUserId();
        if (userId) {

            this.store.dispatch(new fromStore.AddToCompare(product));
            this.compareService.addToCompare(product);
            this._notify.success('add to compare succeeded');
        }
        else {
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
        }
        else {
            this._notify.create("warning", "Please Login First");
            this.loginModalService.showLoginModal(true)
        }
    }
    erroralert() {
        this._notify.error('compare list is full, delete first!!!');
    }
}
