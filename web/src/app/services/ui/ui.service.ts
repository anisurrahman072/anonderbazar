import {Injectable} from '@angular/core';
import 'rxjs/add/operator/map';
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {Subject} from "rxjs/Subject";
import {debounceTime} from "rxjs/operators";


@Injectable()
export class UIService {

    private tokenExpiredNotificationSubject = new Subject<string>();
    private sidebarShowInfo = new BehaviorSubject<boolean>(false);
    currentsidebarShowInfo = this.sidebarShowInfo.asObservable();
    tokenExpiredNotificationObservable = this.tokenExpiredNotificationSubject.asObservable().pipe(debounceTime(200));

    constructor() {
    }

    showSidebar(message: boolean) {
        this.sidebarShowInfo.next(message)
    }

    showTokenExpiredNotification(message: string){
        this.tokenExpiredNotificationSubject.next(message);
    }
}
