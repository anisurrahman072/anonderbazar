import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AuthService } from '../auth.service';

@Injectable()
export class UIService {
  private sidebarIsCollapsed = new BehaviorSubject<boolean>(false);
  currentSidebarIsCollapsed = this.sidebarIsCollapsed.asObservable();

  private selectedWarehouseInfo = new BehaviorSubject<any>(null);
  currentSelectedWarehouseInfo = this.selectedWarehouseInfo.asObservable();

  private loginInfo = new BehaviorSubject<any>(null);
  currentSelectedLoginInfo = this.loginInfo.asObservable();

  constructor(private authService: AuthService) {}

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
