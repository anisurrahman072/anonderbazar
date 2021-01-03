import {Component, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {Router} from "@angular/router";
import {AuthService} from "../../../../services/auth.service";

import {Store} from "@ngrx/store";

import {NgProgress} from "@ngx-progressbar/core";
import * as fromStore from '../../../../state-management/index';
import {LoginModalService} from "../../../../services/ui/loginModal.service";
import {Observable} from "rxjs/Observable";
import {ModalDirective} from "ngx-bootstrap";
import { Subscription } from 'rxjs';
import { CartItemService, CartService } from '../../../../services';
import { ShoppingModalService } from '../../../../services/ui/shoppingModal.service';
import { Product } from '../../../../models';
import { NotificationsService } from 'angular2-notifications';
import { AppSettings } from '../../../../config/app.config';
import {ToastrService} from "ngx-toastr";

@Component({
    selector: 'app-shopping-cart',
    templateUrl: './shopping-cart.component.html',
    styleUrls: ['./shopping-cart.component.scss']
})

export class ShoppingCartComponent implements OnInit, OnDestroy {
    private d: Subscription;
    private currentCart: any; 
    data: Product;
    @Input('app-shopping-cart') cartItem;

    isModalShown$: Observable<boolean>;
    cartItem_quantity: any;
    grandTotal: any;
    IMAGE_ENDPOINT = AppSettings.IMAGE_ENDPOINT;


    cart$: Observable<any>;

    @ViewChild('autoShownModal') autoShownModal: ModalDirective;

    constructor(
        private fb: FormBuilder,
        private router: Router,
        private shoppingInfoService: ShoppingModalService,
        private cartItemService: CartItemService,
        private authService: AuthService,
        public progress: NgProgress,
        private _notify: NotificationsService,
        private store: Store<fromStore.HomeState>,
        private cartService: CartService,
        private toastr: ToastrService,
        public _progress: NgProgress, 
    ) { 
    }
    ngOnDestroy(): void { 
        this.d ? this.d.unsubscribe() : null;
    }
  //Method for increase product quantity in shopping cart modal

    increaseProduct_quantity() {
        if (this.cartItem_quantity < this.cartItem.product_id.quantity) {
            this.cartItem_quantity += 1;
        }
    }
  //Method for decrese product quantity in shopping cart modal
    
    decreaseProduct_quantity() {
        if (this.cartItem_quantity > 1) {
            this.cartItem_quantity -= 1;
        }
    }
  //Event method for getting all the data for the page
    ngOnInit(): void {
        this.getShoppingModalInfo(); 
        this.cart$ = this.store.select<any>(fromStore.getCart); 
        

    }
      //Method for remove from cart item
    removeCartItem(id) {
        this.progress.start('mainLoader');
        this.cartItemService.delete(id).subscribe(result => {
            this.store.dispatch(new fromStore.LoadCart());
            this._notify.error('remove from cart succeeded');
            this.progress.complete('mainLoader');
            
        });
    }
  //Method for update cart items

    updateCartItem(cartItem) { 
        this._progress.start("mainLoader");
        let data = {
            "cart_id": cartItem.cart_id,
            "product_id": cartItem.product_id.id,
            "product_quantity": cartItem.product_quantity,
            "product_total_price": cartItem.product_total_price
        };
        this.cartItemService.update(cartItem.id, data).subscribe(res => {
            this.store.dispatch(new fromStore.LoadCart());
            this._progress.complete("mainLoader");
            this.toastr.info("Cart Item updated Successfully", 'Note');

        });
    }
  //Method for change cart item quantity

    changeCartItemQuantity(cartItem, action){
        if(action == 'increase'){
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
  //Method for shoing the modal
    getShoppingModalInfo(): void {
        this.isModalShown$ = this.shoppingInfoService.currentshoppingModalinfo;
    }
    //Method for hide the modal
    hideModal(): void {
        this.autoShownModal.hide();
    } 

    onHidden(): void { 
        this.shoppingInfoService.showshoppingModal(false);
    }
}
