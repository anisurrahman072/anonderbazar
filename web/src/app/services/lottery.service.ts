import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import {AppSettings} from "../config/app.config";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs/Observable";

@Injectable()
export class LotteryService {
  private EndPoint = `${AppSettings.API_ENDPOINT}/CouponLotteryDraw`;
  private EndPoint2 = `${AppSettings.API_ENDPOINT}/CouponLotteryCashback`;
  constructor(private http: HttpClient) { }

  makeDraw(): Observable<any> {
    return this.http.get(this.EndPoint+'/makeDraw?code=CL50')
        .map((response) => response);
  }
  getAllWinners(): Observable<any> {
    return this.http.get(this.EndPoint+'/getAllWinner?code=CL50')
        .map((response) => response);
  }

  getCashbackByUserId(user_id: any): Observable<any> {
    return this.http.get(`${this.EndPoint2}?where={"deletedAt":null,"user_id":${user_id}}`)
        .map((response) => response);
  }
}
