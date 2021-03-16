import { Injectable } from '@angular/core';
import { Subject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class CmsFeatureFooterService {

  private _cmsLayoutDataSource = new Subject<any>()
  cmsLayoutData$ = this._cmsLayoutDataSource.asObservable();

  constructor() { }

  sendCMSLayoutData(data: any) {
    this._cmsLayoutDataSource.next(data);
  }
}
