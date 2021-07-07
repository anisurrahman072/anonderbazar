import {Injectable} from "@angular/core";
import {Effect, Actions} from "@ngrx/effects";
import {catchError, map, switchMap} from "rxjs/operators";
import {of} from "rxjs/observable/of";
import * as offerActions from "../actions/offer.action";
import {OfferService} from "../../services";
import * as cartActions from "../actions/cart.action";

@Injectable()
export class OfferEffect {
    constructor(
        private actions$: Actions,
        private offerService: OfferService
    ) {
    }

    @Effect()
    loadOffer$ = this.actions$.ofType(offerActions.LOAD_OFFER)
        .switchMap(() => {
            return this.offerService.getRegularOfferStore()
                .pipe(
                    map(data => {
                        /*console.log('getRegularOfferStore-data', data);*/
                        return new offerActions.LoadOfferSuccess(data)
                    }),
                    catchError(error => of(new offerActions.LoadOfferFail(error)))
                );
        })
}
