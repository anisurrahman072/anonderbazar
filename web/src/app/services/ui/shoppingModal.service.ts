import {Injectable} from '@angular/core';
import 'rxjs/add/operator/map';
import {BehaviorSubject} from "rxjs/BehaviorSubject";


@Injectable()
export class ShoppingModalService{

    private shoppingModalInfo= new BehaviorSubject<boolean>(false);
    currentshoppingModalinfo = this.shoppingModalInfo.asObservable(); 

    constructor() { }

    showshoppingModal(message: boolean) {
        this.shoppingModalInfo.next(message)
    }  
}