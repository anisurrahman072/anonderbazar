import {Injectable} from '@angular/core';
import 'rxjs/add/operator/map';
import {BehaviorSubject} from "rxjs/BehaviorSubject";


@Injectable()
export class UIService {
    
    private sidebarShowInfo = new BehaviorSubject<boolean>(false);
    currentsidebarShowInfo = this.sidebarShowInfo.asObservable();
    
    constructor() {
    }
    
    showSidebar(message: boolean) {
        this.sidebarShowInfo.next(message)
    }
    
}