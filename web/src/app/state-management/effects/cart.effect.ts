import {Injectable} from '@angular/core';
import {Effect, Actions} from '@ngrx/effects';

import {AuthService, CartService} from "../../services";
import {catchError, map, switchMap} from "rxjs/operators";
import {of} from "rxjs/observable/of";
import * as cartActions from "../actions/cart.action";

@Injectable()
export class CartEffects {
    constructor(private actions$: Actions,
                private authService: AuthService,
                private cartService: CartService) {
    }
    
    @Effect()
    loadCart$ = this.actions$.ofType(cartActions.LOAD_CART).pipe(
        switchMap(() => {
            if (this.authService.getCurrentUserId()) {
                return this.cartService
                    .getByUserId(this.authService.getCurrentUserId())
                    .pipe(
                        map(cart => new cartActions.LoadCartSuccess(cart)),
                        catchError(error => of(new cartActions.LoadCartFail(error)))
                    );
            } else {
                
                this.authService.getIpAddress() 
                return of(new cartActions.LoadCartSuccess(null));
            }
        })
    )
}
