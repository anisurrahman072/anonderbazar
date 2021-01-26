import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {AuthService} from './auth.service';
import {HttpClient} from '@angular/common/http';
import {environment} from "../../environments/environment";

@Injectable({
    providedIn: 'root'
})
export class PaymentAddressService {

    private EndPoint = `${environment.API_ENDPOINT}/paymentaddress`;

    constructor(private http: HttpClient,
                private authenticationService: AuthService) {
    }

    getAll(): Observable<any> {
        return this.http.get(this.EndPoint + '?where={"deletedAt":null}')
            ;
    }

    getAllByWarehouseId(id): Observable<any> {
        return this.http.get(`${this.EndPoint}?where={"deletedAt":null,"warehouse_id":${id}}`)
            ;
    }

    getpaymentaddress(user_id:number): Observable<any> {
        return this.http.get(`${this.EndPoint}?where={"deletedAt":null,"user_id":${user_id}}`)
            .map((response) => response);
    }

    getById(id): Observable<any> {
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
        return this.http.put(`${this.EndPoint}/${id}`, data)
            ;
    }

    getByOrderId(id): Observable<any> {
        return this.http.get(this.EndPoint + '/?order_id=' + id)
            ;
    }
}
