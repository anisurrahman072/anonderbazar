import { Injectable } from '@angular/core';
import {environment} from "../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs/Observable";

@Injectable({
  providedIn: 'root'
})
export class InvestorService {

  private EndPoint = `${environment.API_ENDPOINT}/investor`;

  constructor(private http: HttpClient ) { }

  getAllInvestor(page: number = 1, limit: number = 20, status: string): Observable<any>{
    return this.http.get(`${this.EndPoint}/getAllInvestor?page=${page}&limit=${limit}&status=${status}`);
  }

  updateInvestorStatus(data: any): Observable<any>{
    return this.http.put(`${this.EndPoint}/updateInvestorStatus`, data);
  }
}
