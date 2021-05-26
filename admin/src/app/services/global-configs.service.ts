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

  getGlobalConfig(): Observable<any>{
    return this.http.get(`${this.Endpoint}/getGlobalConfig`);
  }

  updateGlobalConfig(id: number, data: any): Observable<any>{
    return this.http.put(`${this.Endpoint}/updateGlobalConfig?id=${id}`, data);
  }

}
