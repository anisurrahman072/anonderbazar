import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {AuthService} from './auth.service';
import {HttpClient} from '@angular/common/http';
import {environment} from "../../environments/environment";

@Injectable({
    providedIn: 'root'
})
export class OrderService {

    private EndPoint = `${environment.API_ENDPOINT}/order`;

    constructor(private http: HttpClient,
                private authenticationService: AuthService) {
    }

    getAllOrders(data): Observable<any> {
        return this.http.get(`${this.EndPoint}/getAllOrder?deletedAt=null&created_at= ${data.date}`);
    }

    getAllOrdersForFilter(data): Observable<any> {
        let url = `${this.EndPoint}/getAllOrder?deletedAt=null&created_at= ${data.date}`;
        if (data.status) {
            url += `&status=${data.status}`
        }
        return this.http.get(url);
    }

    getAll(): Observable<any> {
        return this.http.get(this.EndPoint + '?where={"deletedAt":null}');
    }

    getAllByWarehouseId(id): Observable<any> {
        return this.http.get(`${this.EndPoint}?where={"deletedAt":null,"warehouse_id":${id}}`);
    }

    getById(id): Observable<any> {
        return this.http.get(this.EndPoint + '/' + id);
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
        return this.http.put(`${this.EndPoint}/${id}`, data);
    }
}
