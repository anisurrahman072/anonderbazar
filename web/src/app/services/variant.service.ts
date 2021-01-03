import {Injectable} from '@angular/core';
import {Http, Headers, RequestOptions, Response} from '@angular/http';

import 'rxjs/add/operator/map';


import {Observable} from 'rxjs/Observable';
import {AuthService} from './auth.service';
import {AppSettings} from '../config/app.config';
import {HttpClient} from '@angular/common/http';

@Injectable()
export class VariantService {

  private EndPoint = `${AppSettings.API_ENDPOINT}/variant`;


  constructor(private http: HttpClient,
              private authenticationService: AuthService) {
  }

  getAll(): Observable<any> { 
    // get users from api
    return this.http.get(this.EndPoint + '?where={"deletedAt":null}')
      .map((response) => response);


  }



  getById(id): Observable<any> { 
    // get users from api
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
    return this.http.put(this.EndPoint + '/' + id, data)
      .map((response) => response);
  }
}
