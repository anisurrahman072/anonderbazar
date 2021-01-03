import * as fromCart from "../actions/cart.action";
import {Cart} from "../../models";
import {CompareState} from "./compare.reducer";


export interface CartState {
    data: Cart;
    loaded: boolean,
    loading: boolean,
}

export const initialState: CartState = {
    data: null,
    loaded: false,
    loading: false
};

export function reducer(state = initialState, action: any): CartState {
    switch (action.type) {
        case fromCart.LOAD_CART: {
            return <CartState>{
                ...state,
                loading: true,
            }
        }
        case fromCart.LOAD_CART_SUCCESS: {
            
            const data = action.payload;
            return {
                ...state,
                loading: false,
                loaded: true,
                data
            }
        }
        case fromCart.LOAD_CART_FAIL: {
            return <CartState>{
                ...state,
                loading: false,
                loaded: false,
            }
        }
        default: {
            return state;
        }
        
        
    }
    
    
}

export const getCartLoading = (state: CartState) => state.loading;
export const getCartLoaded = (state: CartState) => state.loaded;
export const getCart = (state: CartState) => state.data;

