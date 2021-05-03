import { Injectable } from '@angular/core';
import {Observable} from "rxjs/Observable";
import {HttpClient} from "@angular/common/http";
import {environment} from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class GlobalConfigsService {

  private Endpoint = `${environment.API_ENDPOINT}/globalConfigs`;

  constructor(private http: HttpClient) { }

  getShippingCharge(): Observable<any>{
    return this.http.get(`${this.Endpoint}/getShippingCharge`);
  }

  updateShippingCharge(id: number, data: any): Observable<any>{
    data = {...data, id};
    return this.http.put(`${this.Endpoint}/updateShippingCharge`, data);
  }

}
