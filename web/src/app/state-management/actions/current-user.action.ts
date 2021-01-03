import {Action} from "@ngrx/store";
import {User} from "../../models";

//load Cart
export const Load_CURRENT_USER = '[Home] Load CURRENT_USER';
export const LOAD_CURRENT_USER_FAIL = '[Home] Load CURRENT_USER fail';
export const LOAD_CURRENT_USER_SUCCESS = '[Home] Load CURRENT_USER Success';

export class LoadCurrentUser implements Action {
    readonly type = Load_CURRENT_USER;

}

export class LoadCurrentUserFail implements Action {
    readonly type = LOAD_CURRENT_USER_FAIL;

    constructor(public payload: any) {
    }

}

export class LoadCurrentUserSuccess implements Action {
    readonly type = LOAD_CURRENT_USER_SUCCESS;

    constructor(public payload: User) {
    }

}

//action types
export type CurrentUserAction = LoadCurrentUser | LoadCurrentUserFail | LoadCurrentUserSuccess;


