import { Injectable } from '@angular/core';
import {AppSettings} from "../config/app.config";
import {Observable} from "rxjs/Rx";
import {HttpClient} from "@angular/common/http";
import {catchError} from "rxjs/operators";

@Injectable()
export class GlobalConfigService {

  private EndPoint = `${AppSettings.API_ENDPOINT}/globalConfigs`;

  constructor(private http: HttpClient) { }

  getGlobalConfig(): Observable<any>{
    return this.http.get(`${this.EndPoint}/getGlobalConfig`);
  }

}
