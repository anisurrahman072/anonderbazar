import {Injectable} from '@angular/core';
import {Effect, Actions} from '@ngrx/effects';

import {AuthService, FavouriteProductService} from "../../services";
import {catchError, map, switchMap} from "rxjs/operators";
import {of} from "rxjs/observable/of";
import * as compareProductActions from "../actions/compare.action";
import {CompareService} from "../../services/compare.service";

@Injectable()
export class CompareProductEffects {
    constructor(private actions$: Actions,
                private compareProductService: CompareService,) {
    }
    
    @Effect()
    loadCompare$ = this.actions$.ofType(compareProductActions.LOAD_COMPARE).pipe(
        switchMap(() => { 
            return of(new compareProductActions.LoadCompareSuccess(this.compareProductService.getAllCompare()))
            
        })
    ) 
}