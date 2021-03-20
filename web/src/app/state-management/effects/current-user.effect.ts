import {Injectable} from '@angular/core';
import {Effect, Actions} from '@ngrx/effects';
import {AuthService, UserService} from "../../services";
import {catchError, map, switchMap} from "rxjs/operators";
import {of} from "rxjs/observable/of";
import * as currentUserActions from "../actions/current-user.action";
import {Observable} from "rxjs/Observable";
import {Action} from "@ngrx/store";

@Injectable()
export class CurrentUserEffect {
    constructor(private actions$: Actions,
                private authService: AuthService,
                private userService: UserService) {
    }

    @Effect()
    loadCurrentUser$: Observable<Action> = this.actions$.ofType(currentUserActions.Load_CURRENT_USER).pipe(
        switchMap(() => {
            let currentUserId = this.authService.getCurrentUserId();
            if (currentUserId) {
                return this.userService.getAuthUser()
                    .pipe(
                        map(currentUser => new currentUserActions.LoadCurrentUserSuccess(currentUser)),
                        catchError(error => of(new currentUserActions.LoadCurrentUserFail(error)))
                    )
            } else {
                return of(new currentUserActions.LoadCurrentUserSuccess(null));
            }

        })
    )
}

