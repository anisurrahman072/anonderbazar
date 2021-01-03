import { Injectable } from "@angular/core";
import { Http, Headers, RequestOptions, Response } from "@angular/http";

import { Observable } from "rxjs";
import { AuthService } from "./auth.service";

import { HttpClient } from "@angular/common/http";
import {environment} from "../../environments/environment";

@Injectable({
  providedIn: "root"
})
export class CourierPriceService {
  
  private EndPoint1 = `${environment.API_ENDPOINT}/courierprice`;
  private EndPoint2 = `${environment.API_ENDPOINT}/courierprices`;

  constructor(
    private http: HttpClient,
    private authenticationService: AuthService
  ) {}

  getAllCourierPrices(page: number, limit: number): any {
    return this.http.get(`${this.EndPoint2}?where={"deletedAt":null}&page=${page}&limit=${limit}`);
  }

  getById(id): any {
    return this.http.get(this.EndPoint2 + "/findOne/" + id);
  }
  insert(formData: FormData): any {
    return this.http.post(this.EndPoint1 + "/create", formData);
  }
  update(id: number, data: FormData): any {
    return this.http.put(this.EndPoint1 + "/update/" + id, data);
  }

  getAllCourierPricesByCourierId(id): Observable<any> {
    return this.http.get(
      `${this.EndPoint1}?where={"deletedAt":null,"courier_id":${id}}`
    );
  }

  delete(id: any): any {
    return this.http.delete(`${this.EndPoint1}/${id}`);
  }
}
