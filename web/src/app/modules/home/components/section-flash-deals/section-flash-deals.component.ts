import {Component, Input, OnInit} from '@angular/core';
import {Observable} from "rxjs/Observable";
import * as fromStore from "../../../../state-management/index";
import {CmsService} from '../../../../services';
import {AppSettings} from "../../../../config/app.config";
import {FavouriteProduct, Product} from '../../../../models';
import {Router} from '@angular/router';
import {Store} from '@ngrx/store';
import {AuthService, CartItemService, FavouriteProductService} from '../../../../services';
import {LoginModalService} from '../../../../services/ui/loginModal.service';
import {CompareService} from '../../../../services/compare.service';
import {NotificationsService} from 'angular2-notifications';
import {NgProgress} from '@ngx-progressbar/core';
import {ToastrService} from 'ngx-toastr';

@Component({
    selector: 'app-flash-deals',
    templateUrl: './section-flash-deals.component.html',
    styleUrls: ['./section-flash-deals.component.scss']
})
export class FlashDealsComponent implements OnInit {
    @Input() dataProductList: Observable<any>;
    product: Product;
    compare$: Observable<any>;
    favourites$: Observable<FavouriteProduct>;
    isDisplay: boolean;
    cart$: Observable<any>;
    cartId: any;

    private IMAGE_ENDPOINT = AppSettings.IMAGE_ENDPOINT;

    constructor(private cmsService: CmsService,
                private router: Router,
                private store: Store<fromStore.HomeState>,
                private favouriteProductService: FavouriteProductService,
                private authService: AuthService,
                private loginModalService: LoginModalService,
                private compareService: CompareService,
                private _notify: NotificationsService,
                public _progress: NgProgress,
                private cartItemService: CartItemService,
                private toastr: ToastrService) {
        this.isDisplay = false;
    }

    //Event method for getting all the data for the page
    ngOnInit() {
    }

    //Method for add to cart
    addToCart(product: any, callback?) {
        for (let i = 0; i < this.product.product_variants.length; i++) {
            let v = this.product.product_variants[i];
            if (v.quantity > 0) {
                this.router.navigate([`/product-details/${product.id}`]);
                return false;
            }
        }
        if (this.authService.getCurrentUserId()) {
            this._progress.start("mainLoader");
            let product_total_price: number = this.product.promotion ? this.product.promo_price : this.product.price;
            const cartItemData = {
                cart_id: this.cartId,
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

                        if (callback) {
                            callback();
                        }
                    },
                    error => {
                        this._progress.complete("mainLoader");
                        if(error && error.error){
                            this._notify.error("Oooops! Product was not added to the cart.", error.error);
                        } else {
                            this._notify.error("Oooops! Product was not added to the cart.");
                        }

                    }
                );
        } else {
            this.toastr.success("warning", "Please Login First");
            this.loginModalService.showLoginModal(true);
        }
    }

    //Method for add to buy now
    buyNow(product) {
        this.addToCart(product, () => {
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

    //Method for add to compare
    addToCompare(product: Product) {

        let userId = this.authService.getCurrentUserId();
        if (userId) {

            this.store.dispatch(new fromStore.AddToCompare(product));
            this.compareService.addToCompare(product);
            this._notify.success('add to compare succeeded');
        } else {
            this._notify.create("warning", "Please Login First");

            this.loginModalService.showLoginModal(true)

        }
    }

    //Method called in error
    erroralert() {
        this._notify.error('compare list is full, delete first!!!');
    }
}
