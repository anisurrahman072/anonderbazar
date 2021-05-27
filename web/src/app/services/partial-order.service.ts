import { Injectable } from '@angular/core';
import {AppSettings} from "../config/app.config";
import {Observable} from "rxjs/Observable";
import {HttpClient} from "@angular/common/http";

@Injectable()
export class PartialOrderService {

  private EndPoint = `${AppSettings.API_ENDPOINT}/partial-order`;

  constructor(private http: HttpClient) { }

  makePartialPayment(orderId, data): Observable<any>{
    return this.http.post(`${this.EndPoint}/make-payment/${orderId}`,data);
  }

}
