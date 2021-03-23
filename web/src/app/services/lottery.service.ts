import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import {AppSettings} from "../config/app.config";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs/Observable";

@Injectable()
export class LotteryService {
  private EndPoint = `${AppSettings.API_ENDPOINT}/CouponLotteryDraw`;
  constructor(private http: HttpClient) { }

  takeDraw(): Observable<any> {
    return this.http.get(this.EndPoint+'/makeDraw')
        .map((response) => response);
  }
  getAll(): Observable<any> {
    return this.http.get(this.EndPoint+'/getAllWinner')
        .map((response) => response);
  }
}
