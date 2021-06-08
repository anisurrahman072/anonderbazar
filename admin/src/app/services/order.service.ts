import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {environment} from "../../environments/environment";

@Injectable({
    providedIn: 'root'
})
export class OrderService {

    private EndPoint = `${environment.API_ENDPOINT}/order`;
    private EndPoint2 = `${environment.API_ENDPOINT}/missingOrder`;

    constructor(private http: HttpClient ) {
    }

    getAllOrdersGrid(data, page: number = 1, limit: number = 25): Observable<any> {
        let url = `${this.EndPoint}/allOrders?&page=${page}&limit=${limit}&created_at= ${data.date}`;
        if (data.status) {
            url += `&status=${data.status}`;
        }
        if (data.payment_status) {
            url += `&payment_status=${data.payment_status}`;
        }
        if (data.order_type) {
            url += `&order_type=${data.order_type}`;
        }
        if (data.payment_type) {
            url += `&payment_type=${data.payment_type}`;
        }
        if(data.customerName){
            url += `&customerName=${data.customerName}`;
        }
        if(data.orderNumber){
            url += `&orderNumber=${data.orderNumber}`;
        }
        return this.http.get(url);
    }

    getAll(): Observable<any> {
        return this.http.get(this.EndPoint + '?where={"deletedAt":null}');
    }

    getById(id): Observable<any> {
        return this.http.get(this.EndPoint + '/' + id );
    }

    customOrder(data): Observable<any> {
        return this.http.post(this.EndPoint + '/customOrder', data);
    }

    insert(data): Observable<any> {
        return this.http.post(this.EndPoint, data);
    }

    delete(id): Observable<any> {
        // get users from api
        return this.http.delete(`${this.EndPoint}/${id}`);
    }

    update(id: number, data: any) {
        return this.http.put(`${this.EndPoint}/update?id=${id}`, data);
    }

    updatePaymentStatus(id: number, data: any) {
        return this.http.put(`${this.EndPoint}/updatePaymentStatus?id=${id}`, data);
    }

    findSSLTransaction(data): Observable<any>{
        return this.http.post(`${this.EndPoint2}/findSSLTransaction`, data);
    }

    generateMissingOrders(data): Observable<any>{
        return this.http.post(`${this.EndPoint2}/generateMissingOrders`, data);
    }

    getCancelledOrder(page: number = 1, limit: number = 20, status: number): Observable<any>{
        let _url = `${this.EndPoint}/getCancelledOrder?page=${page}&limit=${limit}`;
        if(status == 0 || status == 1){
            _url += `&status=${status}`;
        }
        return this.http.get(_url);
    }

    refundCancelOrder(orderId, status): Observable<any>{
        return this.http.put(`${this.EndPoint}/refundCancelOrder/${orderId}`, {status});
    }
}
