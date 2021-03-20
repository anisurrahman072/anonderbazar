import {Injectable} from '@angular/core';
import 'rxjs/add/operator/map';
import {CartItem} from '../../models';
import {LocalStorageService} from "../local-storage.service";

@Injectable()
export class LocalCartItemService {
    public token: string;

    constructor(private localStorageService: LocalStorageService) {
    }

    getAllCartItem(): CartItem[] {
        const cartItem = this.localStorageService.getCartItem();
        if (cartItem) {
            return JSON.parse(cartItem);
        } else {
            return [];
        }
    }

    getTotalQuantity() {
        let quantity = 0;
        const cartItem = this.getAllCartItem();
        for (let i = 0; i < cartItem.length; i++) {
            quantity = quantity + cartItem[i].product_quantity;
        }
        return quantity;
    }

}
