import {Injectable} from '@angular/core';
import 'rxjs/add/operator/map';
import {UserService} from '../user.service';
import {Cart} from '../../models';
import {JwtHelper} from 'angular2-jwt';
import {HttpClient} from '@angular/common/http';

@Injectable()
export class LocalCartService {

    jwtHelper: JwtHelper = new JwtHelper();
    public token: string;

    constructor(private http: HttpClient, private userService: UserService) { 
    }

    getAllCart(): Cart {
        const cart = localStorage.getItem('cart');
        if (cart) {
            return JSON.parse(cart);
        } else {
            return {total_quantity: 0, total_price: 0, cart_items: [], user_id: null};
        }
    }

    setFullCart(cart: Cart): boolean {
        localStorage.setItem('cart', JSON.stringify(cart));
        return true;
    }

    addToCart(localCart: Cart) { 
    }


    getAllCartItem() {
        const cartItem = localStorage.getItem('cartItem');
        if (cartItem) {
            return JSON.parse(cartItem);
        } else {
            return [];
        }
    }
}
