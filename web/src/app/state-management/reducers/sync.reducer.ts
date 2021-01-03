import {HomeState} from "./index";
import {ActionReducer, MetaReducer} from "@ngrx/store";
import {localStorageSync, rehydrateApplicationState} from "ngrx-store-localstorage";
import * as fromSync from "../actions/sync.action";


export function debug(reducer: ActionReducer<any>): ActionReducer<any> {
    return function (state, action) {
        return reducer(state, action);
    }
}


export function localStorageSyncReducer(reducer: ActionReducer<any>): ActionReducer<any> {
    return (state: HomeState, action: any) => {
        const keys = ['home'];
        switch (action.type) {
            case fromSync.SYNC_STORAGE: {
                const rehydratedState = rehydrateApplicationState([action.payload], localStorage, k => k, false);
                return {...state, ...rehydratedState};
            }
            default: {
                return localStorageSync({
                    keys,
                    rehydrate: false
                })
                (reducer)(state, action);
            }
            
        }
    }
}

export function universalMetaReducer(actionReducer) {
    return function (state, action) {
        if (action.type === 'REHYDRATE') {
            return actionReducer(action.state, action);
        }
        
        return actionReducer(state, action);
    }
}


export const metaReducers: Array<MetaReducer<any, any>> = [localStorageSyncReducer];


