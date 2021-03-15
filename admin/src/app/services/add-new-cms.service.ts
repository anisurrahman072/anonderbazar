import { Injectable } from '@angular/core';
import { Subject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class AddNewCmsService {

  private _userCMSDataSource = new Subject<any>();
  userCMSData$ = this._userCMSDataSource.asObservable();

  constructor() { }

  sendUserCMSData (data: any) {
    this._userCMSDataSource.next(data);
  }
}
