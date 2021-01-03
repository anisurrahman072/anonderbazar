// capitalize.pipe.ts

import {Pipe, PipeTransform} from '@angular/core';

import {FavouriteProduct, Product} from "../models";

@Pipe({name: 'isaddedtocart', pure: false})
export class IsAddedToCartPipe implements PipeTransform {
    private isAddedInCart: any;
    
    constructor() {
    }
    
    transform(cart, args: number): any {
        if(cart){
            this.isAddedInCart = cart.data.cart_items.filter(p => {
                return p.product_id.id === args
            });
            return this.isAddedInCart.length ? this.isAddedInCart[0] : false;
        } else {
            return false;
        }

        
    }
}
