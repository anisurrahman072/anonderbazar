import { Injectable } from "@angular/core";

import "rxjs/add/operator/map";

import { Observable } from "rxjs/Observable";
import { AuthService } from "./auth.service";
import { AppSettings } from "../config/app.config";
import { HttpClient } from "@angular/common/http";

@Injectable()
export class CraftsmanService {
  private EndPoint = `${AppSettings.API_ENDPOINT}/user`;
  private EndPoint2 = `${AppSettings.API_ENDPOINT}/craftmanprice`;
  allCraftsmanPrice: any;

  constructor(
    private http: HttpClient,
    private authenticationService: AuthService
  ) {}

  getAll(): Observable<any> {
    // add authorization header with jwt token
    // const headers = new Headers({'Authorization': 'Bearer ' + this.authenticationService.token});
    // const options = new RequestOptions({headers: headers});

    // get craftsmans from api
    return this.http
      .get(`${this.EndPoint}?where={"deletedAt":null}`)
      .map(response => response);
  }

  getAllCraftsman() {
    return this.http
      .get(`${this.EndPoint}?where={"deletedAt":null,"group_id"6}`)
      .map(response => response);
  }

  getAllCraftsmanByWarehouseId(id: number): Observable<any> {
    return this.http
      .get(
        `${
          this.EndPoint
        }?where={"deletedAt":null,"group_id":6,"warehouse_id":${id}}`
      )
      .map(response => response);
  }

  getById(id: number) {
    return this.http.get(this.EndPoint + "/" + id).map(response => response);
  }

  update(id: number, data: any) {
    return this.http
      .put(this.EndPoint + "/" + id, data)
      .map(response => response);
  }

  insert(data): Observable<any> {
    return this.http.post(this.EndPoint, data).map(response => response);
  }
  getCraftsmanAndPriceById(id: any) {
    return this.http
      .get(`${this.EndPoint2}?where={"deletedAt":null,"design_id": ${id}}`)
      .map(response => response);
  }

  getCraftsmanByBothDesignAndCraftsmanId(
    design_id: number,
    craftman_id: number,
    part_id: number,
    product_id: number,
  ): Observable<any> { 
    return this.http
      .get(
        `${
          this.EndPoint2
        }/getCraftsmanPriceDesign?design_id=${design_id}&craftman_id=${craftman_id}&part_id=${part_id}&product_id=${product_id}`
      )
      .map(response => response);
  }

  setAllCraftsmanPrice(data: any) {
    this.allCraftsmanPrice = data;
  }

  getAllCraftsmanprice() { 

    return this.allCraftsmanPrice;
  }
  delete(id): Observable<any> {
    return this.http.delete(`${this.EndPoint}/${id}`).map(response => response);
  }
}
