import * as fromCompare from "../actions/compare.action";
import {Product} from "../../models";


export interface CompareState {
    data: Product[];
    loaded: boolean,
    loading: boolean,
}

export const initialState: CompareState = {
    data: [],
    loaded: false,
    loading: false
};

export function reducer(state = initialState, action: any): CompareState {
    switch (action.type) {
        case fromCompare.LOAD_COMPARE: {
            return <CompareState>{
                ...state,
                loading: true,
            }
        }
        case fromCompare.LOAD_COMPARE_SUCCESS: {
            state.data = action.payload;
            return <CompareState>{
                ...state,
                loaded: true,
            }
        }
        case fromCompare.ADD_TO_COMPARE: {

            state.data.push(action.payload);
            return {
                ...state,
                loading: false,
                loaded: true,
            }
        }
        case fromCompare.REMOVE_FROM_COMPARE: {
            let product = action.payload;
            let selectedProduct = state.data.find(item => item.id === product.id);
            if (state.data.indexOf(selectedProduct) >= 0) {
                state.data.splice(state.data.indexOf(product), 1);
            }
            return <CompareState>{
                ...state,
                loading: false,
                loaded: false,
            }
        }

        case fromCompare.REMOVE_ALL_COMPARE: {
            state.data = [];
            return <CompareState>{
                ...state,

            }
        }
        default: {
            return <CompareState>{
                ...state
            }
        }

    }

}

export const getCompareLoading = (state: CompareState) => state.loading;
export const getCompareLoaded = (state: CompareState) => state.loaded;
export const getCompare = (state: CompareState) => state.data;

