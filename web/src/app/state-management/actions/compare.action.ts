import {Action} from "@ngrx/store";
import {Product} from "../../models";

//load Cart
export const LOAD_COMPARE = '[Home] Load Compare';
export const LOAD_COMPARE_SUCCESS = '[Home] Load Compare Success';
export const ADD_TO_COMPARE = '[Home] Add To Compare';
export const REMOVE_FROM_COMPARE = '[Home] Remove From Compare';
export const REMOVE_ALL_COMPARE = '[Home] Remove All Compare';

export class LoadCompare implements Action {
    readonly type = LOAD_COMPARE;
    
}

export class LoadCompareSuccess implements Action {
    readonly type = LOAD_COMPARE_SUCCESS;
    
    constructor(public payload: Product[]) {
    }
}

export class AddToCompare implements Action {
    readonly type = ADD_TO_COMPARE;
    
    constructor(public payload: Product) {
    }
    
}

export class RemoveFromCompare implements Action {
    readonly type = REMOVE_FROM_COMPARE;
    
    constructor(public payload: Product) {
    }
    
}

export class RemoveAllCompare implements Action {
    readonly type = REMOVE_ALL_COMPARE;
    
}

//action types
export type CompareAction = LoadCompare | LoadCompareSuccess | AddToCompare | RemoveFromCompare | RemoveAllCompare;
