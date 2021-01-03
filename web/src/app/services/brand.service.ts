import {Injectable} from '@angular/core';
import {Http, Headers, RequestOptions, Response} from '@angular/http';

import 'rxjs/add/operator/map';


import {Observable} from 'rxjs/Observable';
import {AuthService} from './auth.service';
import {AppSettings} from '../config/app.config';
import {HttpClient} from '@angular/common/http';

@Injectable()
export class BrandService {

  private EndPoint = `${AppSettings.API_ENDPOINT}/brand`;

  constructor(private http: HttpClient,
              private authenticationService: AuthService) {
  }

  getAll(): Observable<any> {
    return this.http.get(this.EndPoint + '?where={"deletedAt":null}')
      .map((response) => response);
  }

  getAllByWarehouseId(id): Observable<any> {
    return this.http.get(`${this.EndPoint}?where={"deletedAt":null,"warehouse_id":${id}}`)
      .map((response) => response);
  }


  getById(id): Observable<any> {

    return this.http.get(this.EndPoint + '/' + id)
      .map((response) => response);
  }

  insert(data): Observable<any> {
    return this.http.post(this.EndPoint, data)
      .map((response) => response);
  }


  delete(id): Observable<any> {
    // get users from api
    return this.http.delete(`${this.EndPoint}/${id}`)
      .map((response) => response);
  }

  update(id: number, data: any) {
    return this.http.put(`${this.EndPoint}/${id}`, data)
      .map((response) => response);
  }

  shopByBrand(categoryId){
    let data = {
      category_id: categoryId
    };
    return this.http.post(`${AppSettings.API_ENDPOINT}/brands/shopbybrand`, data)
        .map((response) => response);
  }
}
