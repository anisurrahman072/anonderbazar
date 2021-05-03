import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {AppSettings} from "../config/app.config";
import {Observable} from "rxjs/Rx";

@Injectable()
export class InvestorService {

  private EndPoint = `${AppSettings.API_ENDPOINT}/investor`;

  constructor(private http: HttpClient) { }

  registerInvestor(value: any): Observable<any>{
    return this.http.post(`${this.EndPoint}/registerInvestor`, value);
  }

}
