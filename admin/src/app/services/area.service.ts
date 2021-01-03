import {Injectable} from '@angular/core';
import {Http, Headers, RequestOptions, Response} from '@angular/http';




import {Observable} from 'rxjs';
import {AuthService} from './auth.service';
import {HttpClient} from '@angular/common/http';
import {environment} from "../../environments/environment";

@Injectable()
export class AreaService {

  private EndPoint = `${environment.API_ENDPOINT}/area`;

  constructor(private http: HttpClient,
              private authenticationService: AuthService) {
  }

  getAll(): Observable<any> {
    return this.http.get(this.EndPoint + '?where={"deletedAt":null}')
      ;
  }

  getById(id): Observable<any> {

    return this.http.get(this.EndPoint + '/' + id)
      ;
  }

  insert(data): Observable<any> {
    return this.http.post(this.EndPoint, data)
      ;
  }


  delete(id): Observable<any> {
    // get users from api
    return this.http.delete(`${this.EndPoint}/${id}`)
      ;
  }

  update(id: number, data: any) {
    return this.http.put(`${this.EndPoint}/${id}`, data)
      ;
  }

  getAllMinistry(): Observable<any> {
    return this.http.get(this.EndPoint + '?where={"deletedAt":null,"type_id":1}')
      ;
  }

  getMinistryById(id): Observable<any> {
    return this.http.get(`${this.EndPoint}/${id}`)
      ;
  }

  getAllMinistryDepartment(): Observable<any> {
    return this.http.get(`${this.EndPoint}?where={"deletedAt":null,"type_id":2}`)
      ;
  }

  getMinistryDepartmentById(id): Observable<any> {
    return this.http.get(`${this.EndPoint}/${id}`)
      ;
  }

  getAllDirectorate(): Observable<any> {
    return this.http.get(`${this.EndPoint}?where={"deletedAt":null,"type_id":3}`)
      ;
  }

  getDirectorateById(id): Observable<any> {
    return this.http.get(`${this.EndPoint}/${id}`)
      ;
  }

  getAllDivision(): Observable<any> {
    return this.http.get(`${this.EndPoint}?where={"deletedAt":null,"type_id":4}`)
      ;
  }

  getDivisionById(id): Observable<any> {
    return this.http.get(`${this.EndPoint}/${id}`)
      ;
  }

  getAllZila(): Observable<any> {
    return this.http.get(`${this.EndPoint}?where={"deletedAt":null,"type_id":5}`)
      ;
  }

  getZilaById(id): Observable<any> {
    return this.http.get(`${this.EndPoint}/${id}`)
      ;
  }

  getAllZilaByDivisionId(id): Observable<any> {
    return this.http.get(`${this.EndPoint}?where={"deletedAt":null,"parent_id":${id}}`)
      ;
  }

  getAllUpazila(): Observable<any> {
    return this.http.get(`${this.EndPoint}?where={"deletedAt":null,"type_id":6}`)
      ;
  }

  getUpazilaById(id): Observable<any> {
    return this.http.get(`${this.EndPoint}/${id}`)
      ;
  }

  getAllUpazilaByZilaId(id): Observable<any> {
    return this.http.get(`${this.EndPoint}?where={"deletedAt":null,"parent_id":${id}}`)
      ;
  }


}
