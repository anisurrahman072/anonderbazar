import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {AuthService} from './auth.service';
import {HttpClient} from '@angular/common/http';
import {environment} from "../../environments/environment";

@Injectable({
    providedIn: 'root'
})
export class PaymentService {

    private EndPoint = `${environment.API_ENDPOINT}/payment`;
    private EndPoint2 = `${environment.API_ENDPOINT}/payments`;

    constructor(private http: HttpClient,
                private authenticationService: AuthService) {
    }

    getAll(): Observable<any> {
        return this.http.get(this.EndPoint + '?where={"deletedAt":null}')
            ;
    }

    getAllPayment(page: number,
                  limit: number,
                  searchTerm: string,
                  orderNumberSearchValue: string,
                  suborderNumberSearchValue: string,
                  userIdSearchValue: string,
                  transactionSearchValue: string,
                  paymentTypeSearchValue: string,
                  paymentAmountSearchValue: string,
                  dateSearchValue: string,
                  statusSearchValue: string,
                  receiver_id: number,
                  sortName: string,
                  sortPrice: String): Observable<any> {
        return this.http.get(`${this.EndPoint2}?page=${page
            }&limit=${limit
            }&search_term=${searchTerm
            }&orderNumberSearchValue=${orderNumberSearchValue
            }&suborderNumberSearchValue=${suborderNumberSearchValue
            }&userIdSearchValue=${userIdSearchValue
            }&transactionSearchValue=${transactionSearchValue
            }&paymentTypeSearchValue=${paymentTypeSearchValue
            }&paymentAmountSearchValue=${paymentAmountSearchValue
            }&dateSearchValue=${dateSearchValue
            }&statusSearchValue=${statusSearchValue
            }&receiver_id=${receiver_id
            }&sortName=${sortName
            }&sortPrice=${sortPrice}`
        )
            ;
    }


    getAllByWarehouseId(id): Observable<any> {
        return this.http.get(`${this.EndPoint}?where={"deletedAt":null,"warehouse_id":${id}}`)
            ;
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
