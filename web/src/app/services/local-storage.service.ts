import {Injectable} from "@angular/core";
import {Cart} from "../models";

@Injectable()
export class LocalStorageService {

    getAuthToken() {
        return localStorage.getItem('token');
    }

    setAuthToken(token) {
        localStorage.setItem('token', token);
    }

    setCurrentUser(userData) {
        localStorage.setItem('currentUser', JSON.stringify({
            username: userData.username,
            token: userData.token
        }));
    }

    setBkashTokens(idToken: string, refreshToken: string) {
        localStorage.setItem('bkash_id_token', idToken);
        localStorage.setItem('bkash_refresh_token', refreshToken);
    }

    getBkashToken(): string {
        return localStorage.getItem('bkash_id_token');
    }

    clearAll() {
        localStorage.clear();
    }

    clearAllUserData() {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('token');
    }

    setFullCart(cart: Cart) {
        localStorage.setItem('cart', JSON.stringify(cart));
    }

    getCartItem() {
        return localStorage.getItem('cartItem');
    }
}
