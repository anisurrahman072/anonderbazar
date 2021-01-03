import {Injectable} from '@angular/core';
import 'rxjs/add/operator/map';
import {BehaviorSubject} from "rxjs/BehaviorSubject";


@Injectable()
export class LoginModalService{

    private loginModalInfo= new BehaviorSubject<boolean>(false);
    currentLoginModalinfo = this.loginModalInfo.asObservable();

    private loggedInUserInfo = new BehaviorSubject<boolean>(false);
    currentLoggedInUserInfo = this.loggedInUserInfo.asObservable();
 
    constructor() { }

    showLoginModal(message: boolean) {
        this.loginModalInfo.next(message)
    }  
    userLoggedIn(message: boolean) {
        this.loggedInUserInfo.next(message);
    }
}