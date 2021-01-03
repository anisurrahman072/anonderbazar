import {Action} from "@ngrx/store";
import {FavouriteProduct} from "../../models";


//load Cart
export const LOAD_FAVOURITE_PRODUCT = '[Home] Load Favourite Product';
export const LOAD_FAVOURITE_PRODUCT_FAIL = '[Home] Load Favourite Product Fail';
export const LOAD_FAVOURITE_PRODUCT_SUCCESS = '[Home] Load Favourite Product Success';
export const ADD_TO_FAVOURITE_PRODUCT = '[Home] Add To Favourite Product';
export const ADD_TO_FAVOURITE_PRODUCT_SUCCESS = '[Home] Add To Favourite Product Success';
export const REMOVE_FROM_FAVOURITE_PRODUCT = '[Home] Remove From Favourite Product';
export const REMOVE_ALL_FAVOURITE_PRODUCT = '[Home] Remove All Favourite Product';

export class LoadFavouriteProduct implements Action {
    readonly type = LOAD_FAVOURITE_PRODUCT;
}

export class LoadFavouriteProductSuccess implements Action {
    readonly type = LOAD_FAVOURITE_PRODUCT_SUCCESS;
    
    constructor(public payload: FavouriteProduct[]) {
    }
    
}

export class LoadFavouriteProductFail implements Action {
    readonly type = LOAD_FAVOURITE_PRODUCT_FAIL;
    
    constructor(public payload: any) {
    }
}


export class AddToFavouriteProduct implements Action {
    readonly type = ADD_TO_FAVOURITE_PRODUCT;
    
    constructor(public payload: FavouriteProduct) {
    }
    
}

export class AddToFavouriteProductSuccess implements Action {
    readonly type = ADD_TO_FAVOURITE_PRODUCT_SUCCESS;
    
    constructor(public payload: FavouriteProduct) {
    }
    
}

export class RemoveFromFavouriteProduct implements Action {
    readonly type = REMOVE_FROM_FAVOURITE_PRODUCT;
    
    constructor(public payload: FavouriteProduct) {
    }
    
}

export class RemoveAllFavouriteProduct implements Action {
    readonly type = REMOVE_ALL_FAVOURITE_PRODUCT;
    
}

//action types
export type FavouriteProductAction = LoadFavouriteProduct | LoadFavouriteProductFail | LoadFavouriteProductSuccess
    | AddToFavouriteProduct | RemoveFromFavouriteProduct | RemoveAllFavouriteProduct;
