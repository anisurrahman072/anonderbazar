import {ActionReducerMap, createFeatureSelector, createSelector} from '@ngrx/store'
import * as fromCart from './cart.reducer';
import * as fromFavouriteProduct from './favourite-product.reducer';
import * as fromCompare from './compare.reducer';
import * as fromCurrentUser from './current-user.reducer';


export interface HomeState {
    cart: fromCart.CartState,
    favouriteProduct: fromFavouriteProduct.FavouriteProductState,
    compare: fromCompare.CompareState,
    currentUser: fromCurrentUser.CurrentUserState
}

export const reducers: ActionReducerMap<HomeState> = {
    currentUser: fromCurrentUser.reducer,
    cart: fromCart.reducer,
    favouriteProduct: fromFavouriteProduct.reducer,
    compare: fromCompare.reducer
};

export const getHomeState = createFeatureSelector<HomeState>('home');


//syncStore state
export const getSyncStoreState = createSelector(getHomeState, (state: HomeState) => state.currentUser);
export const getSyncStore = createSelector(getSyncStoreState, fromCurrentUser.getCurrentUserLoading);


//currentUser state

export const getCurrentUserState = createSelector(getHomeState, (state: HomeState) => state.currentUser);

export const getCurrentUser = createSelector(getCurrentUserState, fromCurrentUser.getCurrentUser);
export const getCurrentUserLoaded = createSelector(getCurrentUserState, fromCurrentUser.getCurrentUserLoaded);
export const getCurrentUserLoading = createSelector(getCurrentUserState, fromCurrentUser.getCurrentUserLoading);


//cart state
export const getCartState = createSelector(getHomeState, (state: HomeState) => state.cart);

export const getCart = createSelector(getCartState, fromCart.getCart);
export const getCartLoaded = createSelector(getCartState, fromCart.getCartLoaded);
export const getCartLoading = createSelector(getCartState, fromCart.getCartLoading);

//compare state

export const getCompareState = createSelector(getHomeState, (state: HomeState) => state.compare);

export const getCompare = createSelector(getCompareState, fromCompare.getCompare);
export const getCompareLoaded = createSelector(getCompareState, fromCompare.getCompareLoaded);
export const getCompareLoading = createSelector(getCompareState, fromCompare.getCompareLoading);


//Favourite Product state
export const getFavouriteProductState = createSelector(getHomeState, (state: HomeState) => state.favouriteProduct);

export const getFavouriteProduct = createSelector(getFavouriteProductState, fromFavouriteProduct.getFavouriteProduct);
export const getFavouriteProductLoaded = createSelector(getFavouriteProductState, fromFavouriteProduct.getFavouriteProductLoaded);
export const getFavouriteProductLoading = createSelector(getFavouriteProductState, fromFavouriteProduct.getFavouriteProductLoading);


