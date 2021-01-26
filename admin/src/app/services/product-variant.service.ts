import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {environment} from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class ProductVariantService {

  private EndPoint = `${environment.API_ENDPOINT}/productvariant`;

  constructor(private http: HttpClient) {
  }

  getAll(): Observable<any> {
    // get users from api
    return this.http.get(this.EndPoint + '?where={"deletedAt":null}')
      ;
  }

  getById(id): Observable<any> {
    return this.http.get(this.EndPoint + '/' + id)
      ;
  }

  getAllVariantByProductId(id): Observable<any> {
    return this.http.get(`${this.EndPoint}?where={"deletedAt":null, "product_id":${id}}`)
      ;
  }

  insert(data): Observable<any> {
    return this.http.post(this.EndPoint, data)
      ;
  }

  update(id: number, data: any) {
    return this.http.put(this.EndPoint + '/' + id, data)
      ;
  }

  delete(id): Observable<any> {
    return this.http.delete(`${this.EndPoint}/${id}`)
      ;
  }


}
