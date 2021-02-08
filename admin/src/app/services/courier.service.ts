import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { HttpClient } from '@angular/common/http';
import {environment} from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class CourierService {

  private EndPoint1 = `${environment.API_ENDPOINT}/courier`;
  private EndPoint2 = `${environment.API_ENDPOINT}/couriers`;
  private EndPoint3 = `${environment.API_ENDPOINT}/suborder`;
  private EndPoint4 = `${environment.API_ENDPOINT}/courierlist`;
  private EndPoint5 = `${environment.API_ENDPOINT}/courierlists`;
  private EndPoint6 = `${environment.API_ENDPOINT}/order`;

  constructor(private http: HttpClient,
    private authenticationService: AuthService) { }

  getAllCouriers(warehouse_id: number, page: number, limit: number): Observable<any> {
    return this.http.get(`${this.EndPoint5}?warehouse_id=${warehouse_id}&status=${status}&page=${page}&limit=${limit}`);
  }

  getAllOrderCouriers(page: number, limit: number): Observable<any> {
    return this.http.get(`${this.EndPoint5}/courierorder?status=${status}&page=${page}&limit=${limit}`);
  }

  getAllSubOrder(warehouse_id: number): Observable<any> {
    return this.http.get(`${this.EndPoint3}/getSuborder?warehouse_id=${warehouse_id}&courier_status=0&status=2`);
  }
  getAllOrder(): Observable<any> {
    return this.http.get(`${this.EndPoint6}/getAllOrder?courier_status=0&status=2`);
  }
  getAllCourier(): any {
    return this.http.get(`${this.EndPoint1
      }?where={"deletedAt":null}`);
  }
  getById(id): Observable<any> {
    return this.http.get(this.EndPoint5 + '/findone/' + id);
  }
  getCourierById(id): Observable<any> {
    return this.http.get(
      `${this.EndPoint1}?where={"deletedAt":null,"id":${id}}`
    );
  }
  insert(data): Observable<any> {
    return this.http.post(this.EndPoint4, data);
  }

  insertOrder(data): Observable<any> {
    return this.http.post(this.EndPoint4+'/courierordercreate', data);
  }

  insertCourier(data): Observable<any> {
    return this.http.post(this.EndPoint1, data);
  }
  update($event: any, id: number, oldStatus: number): any {
    return this.http.put(`${this.EndPoint4}/${id}`, { status: $event });
  }
  updatecourierlistorder($event: any, id: number, oldStatus: number): any {
    return this.http.put(`${this.EndPoint4}/updatecourierlistorder/${id}`, { status: $event });
  }
  updateSuborder($event: any, id: number): any {
    return this.http.put(`${this.EndPoint4}/updateSuborder/${id}`, { status: $event });
  }
  updateCourierList(id: number, formData: FormData): any {
    return this.http.put(`${this.EndPoint4}/updateCourier/${id}`, formData);
  }
  updateCourier(id: number, formData: FormData): any {
    return this.http.put(`${this.EndPoint1}/${id}`, formData);
  }
  delete(id): Observable<any> {
    return this.http.delete(`${this.EndPoint1}/${id}`);
  }
  deleteCourierList(id): Observable<any> {
    return this.http.delete(`${this.EndPoint4}/${id}`);
  }
  deleteCourierOrderList(id): Observable<any> {
    return this.http.delete(`${this.EndPoint4}/destroyOrder/${id}`);
  }
}
