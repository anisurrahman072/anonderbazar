import {Injectable} from '@angular/core'; 

import 'rxjs/add/operator/map';
import {Observable} from 'rxjs/Observable';
import {AuthService} from './auth.service';
import {AppSettings} from '../config/app.config';
import { catchError } from 'rxjs/operators';
import {HttpClient, HttpHeaders} from '@angular/common/http';

@Injectable()
export class CategoryProductService {

  private EndPoint = `${AppSettings.API_ENDPOINT}/category`;

  constructor(private http: HttpClient,
              private authenticationService: AuthService) {
  }

  getAll(): Observable<any> { 
    // get users from api
    return this.http.get(`${this.EndPoint}?where={"type_id":2,"deletedAt":null}`)
      .map((response) => response);
  }

  getById(id): Observable<any> { 
    // get users from api
    return this.http.get(this.EndPoint + '/' + id)
      .map((response) => response);
  }

  insert(categoryType): Observable<any> { 
    return this.http.post(this.EndPoint, categoryType)
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


  getAllClass(): Observable<any> {
    return this.http.get(`${this.EndPoint}?where={"type_id":1,"deletedAt":null,"parent_id":null}`)
      .map((response) => response);
  }

  getAllCategory(): Observable<any> {
    return this.http.get(`${this.EndPoint}?where={"type_id":2,"deletedAt":null,"parent_id":0}`)
      .map((response) => response);
  }
  getAllHomeCategory(): Observable<any> {
    return this.http.get(`${this.EndPoint}?where={"type_id":2,"deletedAt":null,"parent_id":0}&limit=6`)
      .map((response) => response);
  }

  getAllsubCategory(): Observable<any> {
    return this.http.get(`${this.EndPoint}?where={"type_id":2,"deletedAt":null}`)
      .map((response) => response);
  }
 

  categoryWithSubcategory(): Observable<any> {
    return this.http.get(`${this.EndPoint}?category/withProductSubcategory`)
      .map((response) => response);
  }
  getHomeSubcategoryByCategory(): Observable<any> {
    return this.http.get(`${this.EndPoint}?where={"type_id":2,"deletedAt":null,"parent_id":0}&limit=3`)
      .map((response) => response);
  }

  getSubcategoryByCategoryId(id: string): Observable<any> {
    return this.http.get(`${this.EndPoint}?where={"type_id":2,"deletedAt":null,"parent_id":${id}}`)
      .map((response) => response);
  }
  getSubcategoryByCategoryIds(ids: number[]) : Observable<any>{
    
    return this.http.get(`${this.EndPoint}?where={"type_id":2,"deletedAt":null,"parent_id":[${ids}]}`)
      .map((response) => response);
  }

    getCategoriesWithSubcategories() {
        return this.http
            .get(`${this.EndPoint}/withsubcategories`)
            .pipe(catchError((error: any) => Observable.throw(error.json())));
    } 
}
