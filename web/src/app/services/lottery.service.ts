import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import {AppSettings} from "../config/app.config";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs/Observable";

@Injectable()
export class LotteryService {
  private EndPoint = `${AppSettings.API_ENDPOINT}/productPurchasedCouponCode`;
  constructor(private http: HttpClient) { }

  takeDraw(): Observable<any> {
    return this.http.get(this.EndPoint+'/takedraw')
        .map((response) => response);
  }
  getAll(): Observable<any> {
    return this.http.get(this.EndPoint+'/getAll')
        .map((response) => response);
  }
}
