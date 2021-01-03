import {Injectable} from '@angular/core';


import 'rxjs/add/operator/map';


import {Observable} from 'rxjs/Observable';
import {AuthService} from './auth.service';
import {AppSettings} from '../config/app.config';
import {HttpClient} from '@angular/common/http';

@Injectable()
export class AreaService {

  private EndPoint = `${AppSettings.API_ENDPOINT}/area`;

  constructor(private http: HttpClient,
              private authenticationService: AuthService) {
  }

  getAll(): Observable<any> {
    return this.http.get(this.EndPoint + '?where={"deletedAt":null}')
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

  getAllMinistry(): Observable<any> {
    return this.http.get(this.EndPoint + '?where={"deletedAt":null,"type_id":1}')
      .map((response) => response);
  }

  getMinistryById(id): Observable<any> {
    return this.http.get(`${this.EndPoint}/${id}`)
      .map((response) => response);
  }

  getAllMinistryDepartment(): Observable<any> {
    return this.http.get(`${this.EndPoint}?where={"deletedAt":null,"type_id":2}`)
      .map((response) => response);
  }

  getMinistryDepartmentById(id): Observable<any> {
    return this.http.get(`${this.EndPoint}/${id}`)
      .map((response) => response);
  }

  getAllDirectorate(): Observable<any> {
    return this.http.get(`${this.EndPoint}?where={"deletedAt":null,"type_id":3}`)
      .map((response) => response);
  }

  getDirectorateById(id): Observable<any> {
    return this.http.get(`${this.EndPoint}/${id}`)
      .map((response) => response);
  }

  getAllDivision(): Observable<any> {
    return this.http.get(`${this.EndPoint}?where={"deletedAt":null,"type_id":4}`)
      .map((response) => response);
  }

  getDivisionById(id): Observable<any> {
    return this.http.get(`${this.EndPoint}/${id}`)
      .map((response) => response);
  }

  getAllZila(): Observable<any> {
    return this.http.get(`${this.EndPoint}?where={"deletedAt":null,"type_id":5}`)
      .map((response) => response);
  }

  getZilaById(id): Observable<any> {
    return this.http.get(`${this.EndPoint}/${id}`)
      .map((response) => response);
  }

  getAllZilaByDivisionId(id): Observable<any> {
    return this.http.get(`${this.EndPoint}?where={"deletedAt":null,"parent_id":${id}}`)
      .map((response) => response);
  }

  getAllUpazila(): Observable<any> {
    return this.http.get(`${this.EndPoint}?where={"deletedAt":null,"type_id":6}`)
      .map((response) => response);
  }

  getUpazilaById(id): Observable<any> {
    return this.http.get(`${this.EndPoint}/${id}`)
      .map((response) => response);
  }

  getAllUpazilaByZilaId(id): Observable<any> {
    return this.http.get(`${this.EndPoint}?where={"deletedAt":null,"parent_id":${id}}`)
      .map((response) => response);
  }


}
