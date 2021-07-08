import {Component, Input, OnInit} from '@angular/core';
import {AppSettings} from "../../../../../config/app.config";
import {CartItemService} from "../../../../../services";
import * as fromStore from "../../../../../state-management";
import {Store} from "@ngrx/store";
import {NgProgress} from "@ngx-progressbar/core";
import {NotificationsService} from "angular2-notifications";


@Component({
    selector: '[home-cart-item]',
    templateUrl: './cart-item.component.html',
    styleUrls: ['./cart-item.component.scss']
})
export class CartItemComponent implements OnInit {
    IMAGE_ENDPOINT = AppSettings.IMAGE_ENDPOINT;
    cartItem_quantity: any;
    @Input('home-cart-item') cartItem;

    constructor(private store: Store<fromStore.HomeState>,
                private cartItemService: CartItemService,
                public progress: NgProgress,
                private _notify: NotificationsService) {

    }

    ngOnInit() {
        this.cartItem_quantity = this.cartItem.product_quantity;
    }

    ngOnDestroy(): void {
    }


    removeCartItem(id) {
        this.progress.start('mainLoader');
        this.cartItemService.delete(id).subscribe(result => {
            this.store.dispatch(new fromStore.LoadCart());
            this._notify.error('Remove from cart succeeded');
            this.progress.complete('mainLoader');

        });
    }

    increaseProduct_quantity() {
        if (this.cartItem_quantity < this.cartItem.product_id.quantity) {
            this.cartItem_quantity += 1;
        }
    }

    decreaseProduct_quantity() {
        if (this.cartItem_quantity > 1) {
            this.cartItem_quantity -= 1;
        }
    }

    quantityCheck() {
        setTimeout(() => {
            this.cartItem_quantity = this.cartItem_quantity > this.cartItem.product_id.quantity ? this.cartItem.product_id.quantity : this.cartItem_quantity < 1 ? 1 : this.cartItem_quantity;
        }, 1000)
    }


}
