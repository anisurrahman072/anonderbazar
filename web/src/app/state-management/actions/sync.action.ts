import {Action} from "@ngrx/store";


//load SAtorege
export const SYNC_STORAGE = '[Store] Sync Storage';

export class SyncStorage implements Action {
    readonly type = SYNC_STORAGE;
    
    constructor(readonly payload: any) {
    }
}


//action types
export type SyncAction = SyncStorage ;
