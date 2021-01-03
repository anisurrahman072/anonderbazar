import {Injectable} from '@angular/core';
import {Effect, Actions} from '@ngrx/effects';

import {AuthService, FavouriteProductService} from "../../services";
import {catchError, map, switchMap} from "rxjs/operators";
import {of} from "rxjs/observable/of";
import * as favouriteProductActions from "../actions/favourite-product.action";
import {ToastrService} from "ngx-toastr";

@Injectable()
export class FavouriteProductEffects {
    constructor(private actions$: Actions,
                private authService: AuthService,
                private favouriteProductService: FavouriteProductService,
                private toastr: ToastrService,) {
    }
    
    @Effect()
    loadFavouriteProduct$ = this.actions$.ofType(favouriteProductActions.LOAD_FAVOURITE_PRODUCT).pipe(
        switchMap(() => {
            if (this.authService.getCurrentUserId()) {
                return this.favouriteProductService
                    .getByUserIdWithNoPopulate(this.authService.getCurrentUserId())
                    .pipe(
                        map(result => new favouriteProductActions.LoadFavouriteProductSuccess(result)),
                        catchError(error => of(new favouriteProductActions.LoadFavouriteProductFail(error)))
                    );
            } else {
                return of(new favouriteProductActions.LoadFavouriteProductSuccess([]));
            }
        })
    )
    
    @Effect()
    addFavouriteProduct$ = this.actions$.ofType(favouriteProductActions.ADD_TO_FAVOURITE_PRODUCT).pipe(
        switchMap((action: any) => {
            
            return this.favouriteProductService
                .insert(action.payload)
                .pipe(
                    map(result => new favouriteProductActions.AddToFavouriteProductSuccess(result)),
                    catchError(error => of(new favouriteProductActions.LoadFavouriteProductFail(error)))
                );
            
        })
    )
}
