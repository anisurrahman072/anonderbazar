import * as fromOffer from "../actions/offer.action"
import {Offer} from "../../models";

export interface OfferState {
    data: Offer;
    loaded: boolean,
    loading: boolean
}

export const initialState: OfferState = {
    data: null,
    loaded: false,
    loading: false
}

export function reducer(state = initialState, action: any): OfferState {
    switch (action.type) {
        case fromOffer.LOAD_OFFER: {
            return <OfferState> {
                ...state,
                loading: true
            }
        }
        case fromOffer.LOAD_OFFER_SUCCESS: {
            const data = action.payload;
            return {
                ...state,
                loading: false,
                loaded: true,
                data
            }
        }
        case fromOffer.LOAD_OFFER_FAIL: {
            return <OfferState> {
                ...state,
                loading: false,
                loaded: false
            }
        }
        default: {
            return state;
        }
    }
}

export const getOfferLoading = (state: OfferState) => state.loading
export const getOfferLoaded = (state: OfferState) => state.loaded
export const getOffer = (state: OfferState) => state.data
