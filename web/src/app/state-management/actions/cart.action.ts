import {Action} from "@ngrx/store";
import {Cart} from "../../models";

//load Cart
export const LOAD_CART = '[Home] Load Cart';
export const LOAD_CART_FAIL = '[Home] Load Cart Fail';
export const LOAD_CART_SUCCESS = '[Home] Load Cart Success';

export class LoadCart implements Action {
    readonly type = LOAD_CART;
    
}

export class LoadCartFail implements Action {
    readonly type = LOAD_CART_FAIL;
    
    constructor(public payload: any) {
    }
    
}

export class LoadCartSuccess implements Action {
    readonly type = LOAD_CART_SUCCESS;
    
    constructor(public payload: Cart) {
    }
    
}

//action types
export type CartAction = LoadCart | LoadCartFail | LoadCartSuccess;
