// capitalize.pipe.ts

import {Pipe, PipeTransform} from '@angular/core';

import {FavouriteProduct, Product} from "../models";

@Pipe({name: 'isaddedtofavourite', pure: false})
export class IsAddedToFavouritePipe implements PipeTransform {
    private isFavourite: any;
    
    constructor() {
    }
    
    transform(value: FavouriteProduct[], args: number): any {
        
        this.isFavourite = value.filter(p => {
            return p.product_id === args
        });
        return this.isFavourite.length ? this.isFavourite[0] : false;
        
    }
}
