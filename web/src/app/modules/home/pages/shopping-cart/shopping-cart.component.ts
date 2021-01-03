import {Component, OnInit} from '@angular/core';
import {Store} from "@ngrx/store";
import {ActivatedRoute, Router} from "@angular/router";
import {AppSettings} from "../../../../config/app.config";

import * as fromStore from "../../../../state-management";
import {AuthService, CartItemService, CartService} from "../../../../services";
import {Observable} from "rxjs/Observable";
import {Cart} from "../../../../models";


@Component({
    selector: 'page-shopping-cart',
    templateUrl: './shopping-cart.component.html',
    styleUrls: ['./shopping-cart.component.scss']
})
export class ShoppingCartComponent implements OnInit {
    IMAGE_ENDPOINT = AppSettings.IMAGE_ENDPOINT;
    cart$: Observable<Cart>;
    cart_id: any;
    user_id: any;
    sub: any;
    data: any;
    
    constructor(private store: Store<fromStore.HomeState>,
                private route: ActivatedRoute,
                private router: Router,
                private cartService: CartService,
                private cartItemService: CartItemService,
                private authservice: AuthService) {
    }
    // init the component
    ngOnInit() {
        // Getting current user id
        this.user_id = this.authservice.getCurrentUserId(); 
        this.cart$ = this.store.select<any>(fromStore.getCart);
    }    
}
