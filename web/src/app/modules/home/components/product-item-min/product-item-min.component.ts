import {Component, Input, OnInit} from '@angular/core';
import {AppSettings} from "../../../../config/app.config";
import {Router} from "@angular/router";
import {FavouriteProduct, Product} from "../../../../models/index";
import * as fromStore from "../../../../state-management/index";
import {Store} from "@ngrx/store";
import {Observable} from "rxjs/Observable";
import {WOW} from "ngx-wow/services/wow.service";
import {AuthService, FavouriteProductService} from "../../../../services";
import {catchError, map} from "rxjs/operators";
import * as cartActions from "../../../../state-management/actions/cart.action";
import {of} from "rxjs/observable/of";
import {NotificationsService} from "angular2-notifications";
import {LoginModalService} from "../../../../services/ui/loginModal.service";
import {CompareService} from "../../../../services/compare.service";
import { DomSanitizer, SafeResourceUrl, SafeUrl } from '@angular/platform-browser';
import {ToastrService} from "ngx-toastr";

@Component({
    selector: 'app-product-item-min',
    templateUrl: './product-item-min.component.html',
    styleUrls: ['./product-item-min.component.scss']
})
export class ProductItemMinComponent implements OnInit {
    IMAGE_ENDPOINT = AppSettings.IMAGE_ENDPOINT;
    @Input() dataProduct;
    @Input() imgHeight:string;
    product: Product;
    compare$: Observable<any>;
    favourites$: Observable<FavouriteProduct>;


    constructor(private router: Router, private store: Store<fromStore.HomeState>,
                private favouriteProductService: FavouriteProductService,
                private authService: AuthService,
                private loginModalService: LoginModalService,
                private compareService: CompareService,
                private _notify: NotificationsService,
                private toastr: ToastrService,) {
    }
  //Event method for getting all the data for the page
    ngOnInit() {
        this.compare$ = this.store.select<any>(fromStore.getCompare);
        this.favourites$ = this.store.select<any>(fromStore.getFavouriteProduct);
        this.product = this.dataProduct; 
    }
  //Method for add to cart

    addToCart(product: any) {
        this.router.navigate([`/product-details/${product.id}`]);
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
        }
        else {
            this._notify.create("warning", "Please Login First");

            this.loginModalService.showLoginModal(true)

        }
    } 
    //Method called in error
    erroralert() {
        this._notify.error('compare list is full, delete first!!!');
    } 
}
