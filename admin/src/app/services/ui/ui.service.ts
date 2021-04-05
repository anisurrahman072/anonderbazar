import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {AuthService} from '../auth.service';
import {distinctUntilChanged} from "rxjs/operators";

@Injectable({
    providedIn: 'root'
})
export class UIService {
    private sidebarIsCollapsed = new BehaviorSubject<boolean>(false);
    currentSidebarIsCollapsed = this.sidebarIsCollapsed.asObservable();

    private selectedWarehouseInfo = new BehaviorSubject<any>(null);
    currentSelectedWarehouseInfo = this.selectedWarehouseInfo.asObservable()
        .pipe(distinctUntilChanged((prev, next) => {
            let tmpPrev = prev, tmpNext = next;
            if (prev === null || isNaN(prev) || prev === undefined || prev === 0) {
                tmpPrev = !!prev;
            }
            if (next === null || isNaN(next) || next === undefined || next === 0) {
                tmpNext = !!next;
            }
            return tmpNext == tmpPrev;
        }));

    private loginInfo = new BehaviorSubject<any>(null);
    currentSelectedLoginInfo = this.loginInfo.asObservable();

    constructor(private authService: AuthService) {
    }

    selectedWarehouseUpdate(message: any) {
        this.authService.setCurrentWarehouse(message);
        this.selectedWarehouseInfo.next(message);
    }

    loginInfoUpdate(message: any) {
        this.loginInfo.next(message);
    }

    sidebarIsCollapsedChange(value: boolean) {
        this.sidebarIsCollapsed.next(value);
    }
}
