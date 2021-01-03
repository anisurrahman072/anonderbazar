import { LocalCartService } from './local-cart.service';
import { Cart } from '../../models/cart';
import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import { UserService } from '../user.service';
import { CartItem } from '../../models';
import { JwtHelper } from 'angular2-jwt';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class LocalCartItemService {
  jwtHelper: JwtHelper = new JwtHelper();
  public token: string;

  constructor(
    private http: HttpClient,
    private userService: UserService,
    private localCartService: LocalCartService
  ) {}

  getAllCartItem(): CartItem[] {
    const cartItem = localStorage.getItem('cartItem');
    if (cartItem) {
      return JSON.parse(cartItem);
    } else {
      return [];
    }
  }

  setFullCartItem(cartItem: CartItem[]): boolean {
    localStorage.setItem('cartItem', JSON.stringify(cartItem));
    return true;
  }

  addToCartItem(localCartItem: CartItem) {
    const cart: CartItem[] = this.getAllCartItem();
    cart.push(localCartItem);
    this.setFullCartItem(cart);
  }

  getTotalPrice() {
    let totalPrice = 0;
    const cartItem = this.getAllCartItem();
    for (let i = 0; i < cartItem.length; i++) {
      totalPrice = totalPrice + cartItem[i].product_total_price;
    }

    return totalPrice;
  }

  getTotalQuantity() {
    let quantity = 0;
    const cartItem = this.getAllCartItem();
    for (let i = 0; i < cartItem.length; i++) {
      quantity = quantity + cartItem[i].product_quantity;
    }
    return quantity;
  }

  removeAllCartItem() {
    localStorage.removeItem('cartItem');
  }

  removeCartItemByIndex(index: number) {
    const localCartItem = this.getAllCartItem();
    localCartItem.splice(index, 1);
    this.setFullCartItem(localCartItem);
  }
  updateCartItemByIndex(index: number, payload) {
    const localCartItem = this.getAllCartItem();

    let tempCartItem = localCartItem[index];
    tempCartItem = { ...tempCartItem, ...payload };

    localCartItem[index] = tempCartItem; 
    this.setFullCartItem(localCartItem);
    const cartPayload: Cart = {
      user_id: undefined,
      total_quantity: this.getTotalQuantity(),
      total_price: this.getTotalPrice(),
      cart_items: localCartItem
    };
    this.localCartService.setFullCart(cartPayload);
  }

  removeFromCartItem(cartItem: CartItem) {
    const localCartItem = this.getAllCartItem();
    if (localCartItem) { 
      if (localCartItem.indexOf(cartItem) >= 0) {
        localCartItem.splice(localCartItem.indexOf(cartItem), 1);
        this.setFullCartItem(localCartItem);
      }
    }
  }
}
