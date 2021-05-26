import {Injectable} from '@angular/core';
import 'rxjs/add/operator/map';
import {Observable} from 'rxjs/Observable';
import {AppSettings} from '../config/app.config';
import {HttpClient} from '@angular/common/http';
import {catchError} from "rxjs/operators";

@Injectable()
export class OrderService {

    private EndPoint = `${AppSettings.API_ENDPOINT}/order`;

    constructor(private http: HttpClient) {
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
        return this.http.delete(`${this.EndPoint}/${id}`)
            .map((response) => response);
    }

    update(id: number, data: any) {
        return this.http.put(this.EndPoint + '/' + id, data)
            .map((response) => response);
    }

    getAllByWarehouseId(id): Observable<any> {
        return this.http.get(`${this.EndPoint}?where={"deletedAt":null,"warehouse_id":${id}}`)
            .map((response) => response);
    }

    getByUserId(user_id: any): Observable<any> {
        return this.http.get(`${this.EndPoint}?where={"deletedAt":null,"user_id":${user_id}}&limit=500&sort="createdAt%20DESC"`)
            .pipe(catchError((error: any) => Observable.throw(error.json())));
    }

    placeCashOnDeliveryOrder(data): Observable<any> {
        return this.http.post(`${this.EndPoint}/placeOrderForCashOnDelivery`, data)
            .map((response) => response);
    }

    placeOrder(data): Observable<any> {
        return this.http.post(`${this.EndPoint}/placeOrder`, data)
            .map((response) => response);
    }

    placeOrderWithoutPayment(data): Observable<any>{
        return this.http.post(`${this.EndPoint}/placeOrderWithoutPayment`, data)
            .map((response) => response);
    }
}
