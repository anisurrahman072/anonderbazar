import {Action} from "@ngrx/store";
import {Offer} from "../../models";

/**Load offer*/
export const LOAD_OFFER = '[Home] Load OFFER';
export const LOAD_OFFER_FAIL = '[Home] Load OFFER fail';
export const LOAD_OFFER_SUCCESS = '[Home] Load OFFER Success';

export class LoadOffer implements Action {
    readonly type = LOAD_OFFER;
}

export class LoadOfferFail implements Action {
    readonly type = LOAD_OFFER_FAIL;

    constructor(public payload: any) {
    }
}

export class LoadOfferSuccess implements Action {
    readonly type = LOAD_OFFER_SUCCESS;

    constructor(public payload: Offer) {
    }
}

/**action types*/
export type OfferAction = LoadOffer | LoadOfferFail | LoadOfferSuccess
