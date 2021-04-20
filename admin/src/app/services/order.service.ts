import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {environment} from "../../environments/environment";

@Injectable({
    providedIn: 'root'
})
export class OrderService {

    private EndPoint = `${environment.API_ENDPOINT}/order`;

    constructor(private http: HttpClient ) {
    }

    getAllOrdersGrid(data, page: number = 1, limit: number = 25): Observable<any> {
        let url = `${this.EndPoint}/allOrders?&page=${page}&limit=${limit}&created_at= ${data.date}`;
        if (data.status) {
            url += `&status=${data.status}`;
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
}
