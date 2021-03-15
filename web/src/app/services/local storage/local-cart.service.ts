import {Injectable} from '@angular/core';
import 'rxjs/add/operator/map';
import {Cart} from '../../models';
import {LocalStorageService} from "../local-storage.service";

@Injectable()
export class LocalCartService {

    public token: string;

    constructor(private localStorageService: LocalStorageService) {
    }


    setFullCart(cart: Cart): boolean {
        this.localStorageService.setFullCart(cart);
        return true;
    }

    addToCart(localCart: Cart) {
    }

}
