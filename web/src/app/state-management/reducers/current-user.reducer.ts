import * as fromCurrentUser from "../actions/current-user.action";
import {User} from "../../models";


export interface CurrentUserState {
    data: User;
    loaded: boolean,
    loading: boolean,
}

export const initialState: CurrentUserState = {
    data: null,
    loaded: false,
    loading: false
};

export function reducer(state = initialState, action: any): CurrentUserState {
    switch (action.type) {
        case fromCurrentUser.Load_CURRENT_USER: {
            return <CurrentUserState>{
                ...state,
                loading: true,
            }
        }
        case fromCurrentUser.LOAD_CURRENT_USER_SUCCESS: {
            const data = action.payload;
            return {
                ...state,
                loading: false,
                loaded: true,
                data
            }
        }
        case fromCurrentUser.LOAD_CURRENT_USER_FAIL: {
            return <CurrentUserState>{
                ...state,
                loading: false,
                loaded: false,
            }
        }
        default: {
            return state;
        }
        
        
    }
    
}

export const getCurrentUserLoading = (state: CurrentUserState) => state.loading;
export const getCurrentUserLoaded = (state: CurrentUserState) => state.loaded;
export const getCurrentUser = (state: CurrentUserState) => state.data;

