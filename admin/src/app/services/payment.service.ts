import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {environment} from "../../environments/environment";

@Injectable({
    providedIn: 'root'
})
export class PaymentService {

    private EndPoint = `${environment.API_ENDPOINT}/payment`;
    private EndPoint2 = `${environment.API_ENDPOINT}/payments`;

    constructor(private http: HttpClient) {
    }

    getAll(): Observable<any> {
        return this.http.get(this.EndPoint + '?where={"deletedAt":null}')
            ;
    }

    changeApprovalStatus(paymentId, orderId, status): Observable<any> {
        return this.http.get(this.EndPoint + `/changeApprovalStatus?paymentId=${paymentId}&status=${status}&orderId=${orderId}`);
    }

    getAllPayment(page: number,
                  limit: number,
                  nameSearchValue: string,
                  orderNumberSearchValue: string,
                  suborderNumberSearchValue: string,
                  userIdSearchValue: string,
                  transactionSearchValue: string,
                  paymentTypeSearchValue: string,
                  paymentAmountSearchValue: string,
                  dateSearchValue: string,
                  statusSearchValue: string,
                  receiver_id: number,
                  approvalStatusSearchValue:  number,
                  orderType: number,
                  sortKey: string,
                  sortValue:string): Observable<any> {

        return this.http.get(`${this.EndPoint2}?page=${page
            }&limit=${limit
            }&nameSearchValue=${nameSearchValue
            }&orderNumberSearchValue=${orderNumberSearchValue
            }&suborderNumberSearchValue=${suborderNumberSearchValue
            }&userIdSearchValue=${userIdSearchValue
            }&transactionSearchValue=${transactionSearchValue
            }&paymentTypeSearchValue=${paymentTypeSearchValue
            }&paymentAmountSearchValue=${paymentAmountSearchValue
            }&dateSearchValue=${dateSearchValue
            }&statusSearchValue=${statusSearchValue
            }&approvalStatusSearchValue=${approvalStatusSearchValue
            }&orderType=${orderType
            }&receiver_id=${receiver_id
            }&sortKey=${sortKey
            }&sortValue=${sortValue}`
        );
    }


    getAllByWarehouseId(id): Observable<any> {
        return this.http.get(`${this.EndPoint}?where={"deletedAt":null,"warehouse_id":${id}}`)
            ;
    }


    getById(id): Observable<any> {
        return this.http.get(this.EndPoint + '/' + id) ;
    }

    getByIdNoPop(id): Observable<any> {
        return this.http.get(this.EndPoint + '/' + id + '?populate=receiver_id,user_id') ;
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
