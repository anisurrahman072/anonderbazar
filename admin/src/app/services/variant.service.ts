import {Injectable} from '@angular/core';
import {Http, Headers, RequestOptions, Response} from '@angular/http';




import {Observable} from 'rxjs';
import {AuthService} from './auth.service';
import {HttpClient} from '@angular/common/http';
import {environment} from "../../environments/environment";

@Injectable()
export class VariantService {

  private EndPoint = `${environment.API_ENDPOINT}/variant`;
  private EndPoint2 = `${environment.API_ENDPOINT}/variants`;


  constructor(private http: HttpClient,
              private authenticationService: AuthService) {
  }

  getAll(): Observable<any> {
    // get users from api
    return this.http.get(this.EndPoint + '?where={"deletedAt":null}')
      ;
  }

  getAllVariantWithStatus(type): Observable<any> {
    // get users from api
    if(type==0){
      return this.http.get(this.EndPoint + `?where={"type":"${type}","deletedAt":null}`);
    }else{
      return this.http.get(this.EndPoint + `?where={"deletedAt":null}`);
    }
  }
  getAllvariant(page: number, limit: number,
                  searchTermName: string,
                  categoryId: number,
                  subcategoryId: number,
                  sortName: string): Observable<any> {
      
      
      return this.http.get(`${this.EndPoint2
          }?page=${page
          }&limit=${limit
          }&searchTermName=${searchTermName
          }&category_id=${categoryId
          }&subcategory_id=${subcategoryId
          }&sortName=${sortName}`
      )
  }
    getById(id): Observable<any> {
    // get users from api
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
    return this.http.put(this.EndPoint + '/' + id, data)
      ;
  }
}
