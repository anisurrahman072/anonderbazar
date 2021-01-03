import * as fromFavouriteProduct from "../actions/favourite-product.action";
import {FavouriteProduct} from "../../models/";


export interface FavouriteProductState {
    data: FavouriteProduct[];
    loaded: boolean,
    loading: boolean,
}

export const initialState: FavouriteProductState = {
    data: [],
    loaded: false,
    loading: false
};

export function reducer(state = initialState, action: any): FavouriteProductState {
    switch (action.type) {
        case fromFavouriteProduct.LOAD_FAVOURITE_PRODUCT: {
            return <FavouriteProductState>{
                ...state,
                loading: true,
            }
        }
        case fromFavouriteProduct.ADD_TO_FAVOURITE_PRODUCT: {
            // state.data.push(action.payload);
            return <FavouriteProductState>{
                ...state,
                loading: true,
                loaded: false,
            }
        }
        case fromFavouriteProduct.LOAD_FAVOURITE_PRODUCT_SUCCESS: {
            
            state.data = action.payload;
            return <FavouriteProductState>{
                ...state,
                loading: false,
                loaded: true,
                
            }
        }
        case fromFavouriteProduct.ADD_TO_FAVOURITE_PRODUCT_SUCCESS: {
            
            let data = state.data.slice();
            
            data.push(action.payload);
            
            return <FavouriteProductState>{
                ...state,
                loading: false,
                loaded: true,
                data
                
            }
        }
        case fromFavouriteProduct.LOAD_FAVOURITE_PRODUCT_FAIL: {
            return <FavouriteProductState>{
                ...state,
                loading: false,
                loaded: false,
            }
        }
        default: {
            return <FavouriteProductState>{
                ...state
            };
        }
        
        
    }
    
    
}

export const getFavouriteProductLoading = (state: FavouriteProductState) => state.loading;
export const getFavouriteProductLoaded = (state: FavouriteProductState) => state.loaded;
export const getFavouriteProduct = (state: FavouriteProductState) => state.data;

