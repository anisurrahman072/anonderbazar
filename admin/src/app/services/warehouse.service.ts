import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {AuthService} from './auth.service';
import {HttpClient} from '@angular/common/http';
import {environment} from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class WarehouseService {

  private EndPoint = `${environment.API_ENDPOINT}/warehouse`;
  private EndPointAUTH = `${environment.API_ENDPOINT}/auth`;
  private EndPoint2 = `${environment.API_ENDPOINT}/product`;

  constructor(private http: HttpClient,
              private authenticationService: AuthService) {
  }

  getAll(page: number, limit: number): Observable<any> {
    return this.http.get(this.EndPoint + '?where={"deletedAt":null}')
      ;
  }
  getAllIndex(page: number, limit: number, warehouseId?: number): Observable<any> {
    return this.http.get(this.EndPoint + '/getAll?page='+page+'&limit='+limit+`${warehouseId?'&warehouse_id='+warehouseId:''}&where={"deletedAt":null}`)
      ;
  }
  getById(id): Observable<any> {
    // get users from api
    return this.http.get(this.EndPoint + '/' + id);
  }

  getallproductbywarehouseid(id): Observable<any>{
    return this.http.get(this.EndPoint2+ `?where={"warehouse_id":"${id}","deletedAt":null}`);
  }

  insert(data): Observable<any> {
    return this.http.post(this.EndPoint, data);
  }

  signup(warehouseData): Observable<any> {
    return this.http.post(this.EndPointAUTH + '/warehouseSignup', warehouseData);
  }

  delete(id): Observable<any> {
    // get users from api
    return this.http.delete(`${this.EndPoint}/${id}`);
  }

  update(id: number, data: any) {
    return this.http.put(this.EndPoint + '/' + id, data);
  }
}
