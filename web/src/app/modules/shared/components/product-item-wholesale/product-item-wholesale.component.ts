import {Component, Input, OnInit} from '@angular/core';
import {AppSettings} from "../../../../config/app.config";
import {Router} from "@angular/router";
import {FavouriteProduct, Product} from "../../../../models";
import * as fromStore from "../../../../state-management/index";
import {Store} from "@ngrx/store";
import {Observable} from "rxjs/Observable";
import {AuthService, CartItemService, FavouriteProductService} from "../../../../services";
import {NotificationsService} from "angular2-notifications";
import {LoginModalService} from "../../../../services/ui/loginModal.service";
import {CompareService} from "../../../../services/compare.service";
import { NgProgress } from '@ngx-progressbar/core';
import { ToastrService } from 'ngx-toastr';

@Component({
    selector: 'app-product-item-wholesale',
    templateUrl: './product-item-wholesale.component.html',
    styleUrls: ['./product-item-wholesale.component.scss']
})
export class ProductItemWholeSaleComponent implements OnInit {
    IMAGE_ENDPOINT = AppSettings.IMAGE_ENDPOINT;
    @Input() dataProductWholeSale;
    product: Product;
    compare$: Observable<any>;
    favourites$: Observable<FavouriteProduct>;
    isDisplay: boolean;
    cart$: Observable<any>;
    cartId: any;
    cartTotalprice: any;
    cartTotalquantity: any;

    constructor(private router: Router, private store: Store<fromStore.HomeState>,
                private favouriteProductService: FavouriteProductService,
                private authService: AuthService,
                private loginModalService: LoginModalService,
                private cartItemService: CartItemService,
                public _progress: NgProgress,
                private toastr: ToastrService,
                private compareService: CompareService,
                private _notify: NotificationsService) {
                    this.isDisplay = false;
    }

    ngOnInit() {
        this.compare$ = this.store.select<any>(fromStore.getCompare);
        this.favourites$ = this.store.select<any>(fromStore.getFavouriteProduct);
        this.product = this.dataProductWholeSale;
        this.cart$ = this.store.select<any>(fromStore.getCart);
        this.cart$.subscribe(result => {
            if (result) {
                this.cartId = result.data.id;
                this.cartTotalprice = result.data.total_price;
                this.cartTotalquantity = result.data.total_quantity;
            }
        });
    }
  //Method for add to cart

    addToCart(product: any, callback?) {
        for (let i = 0; i < this.product.product_variants.length; i++) {
            let v = this.product.product_variants[i];
            if(v.quantity > 0){
                this.router.navigate([`/product-details/${product.id}`]);
                return false;
            }
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
                        this.toastr.success("Product Successfully Added To cart: " + product.name + " - ???" + product_total_price, 'Note');

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
    erroralert() {
        this._notify.error('compare list is full, delete first!!!');
    }
      //Method for direct buy

    buyNow(product){
        this.addToCart(product, ()=>{
            this.router.navigate([`/checkout`]);
        });
    }
}
