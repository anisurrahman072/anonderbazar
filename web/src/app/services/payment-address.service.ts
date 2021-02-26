import {Injectable} from '@angular/core';
import 'rxjs/add/operator/map';
import {of} from 'rxjs/observable/of';
import {Observable} from 'rxjs/Observable';
import {AuthService} from './auth.service';
import {AppSettings} from '../config/app.config';
import {HttpClient} from '@angular/common/http';

@Injectable()
export class PaymentAddressService {

    private EndPoint = `${AppSettings.API_ENDPOINT}/paymentaddress`;

    constructor(private http: HttpClient,
                private authenticationService: AuthService) {
    }

    getAllByWarehouseId(id): Observable<any> {
        return this.http.get(`${this.EndPoint}?where={"deletedAt":null,"warehouse_id":${id}}`)
            .map((response) => response);
    }

    getpaymentaddress(user_id: number): Observable<any> {
        if (user_id) {
            return this.http.get(`${this.EndPoint}?where={"deletedAt":null,"user_id":${user_id}}`)
                .map((response) => response);
        }
        return of(false);
    }

    getPaymentaddressWithoutOrderid(user_id: number): Observable<any> {
        if (user_id) {
            return this.http.get(`${this.EndPoint}?where={"deletedAt":null,"order_id":null,"user_id":${user_id}}`)
                .map((response) => response);
        }
        return of(false);
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
        // get users from api
        return this.http.delete(`${this.EndPoint}/${id}`)
            .map((response) => response);
    }

    update(id: number, data: any) {
        return this.http.put(`${this.EndPoint}/${id}`, data)
            .map((response) => response);
    }

    getByOrderId(id): Observable<any> {
        return this.http.get(this.EndPoint + '/?order_id=' + id)
            .map((response) => response);
    }
}
