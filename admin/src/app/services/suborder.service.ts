import {Injectable} from "@angular/core";
import {Observable} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {environment} from "../../environments/environment";
import {share} from "rxjs/operators";

@Injectable({
    providedIn: 'root'
})
export class SuborderService {

    subOrderObservable1: Observable<any>;
    subOrderObservable2: Observable<any>;

    private EndPoint = `${environment.API_ENDPOINT}/suborder`;
    private EndPoint2 = `${environment.API_ENDPOINT}/suborders`;

    constructor(
        private http: HttpClient
    ) {
    }

    getSuborder(
        warehouseId: string,
        status: number,
        sortPrice: String
    ): Observable<any> {

        let url;
        if (warehouseId == null || warehouseId == "") {
            url = `${this.EndPoint + "/getSuborder"}?status=${status}&sortPrice=${sortPrice}`;
            if (this.subOrderObservable1) {
                return this.subOrderObservable1;
            }
            this.subOrderObservable1 = this.http.get(url).pipe(share());
            return this.subOrderObservable1;
        }

        url = `${this.EndPoint + "/getSuborder"}?warehouse_id=${warehouseId}&status=${status}&sortPrice=${sortPrice}`;

        if (this.subOrderObservable2) {
            return this.subOrderObservable2;
        }
        this.subOrderObservable2 = this.http.get(url).pipe(share());
        return this.subOrderObservable2;
    }

    getSuborderWithDate(
        warehouseId: string,
        status: number,
        date: string,
        sortPrice: string
    ): Observable<any> {
        return this.http.get(
            `${this.EndPoint +
            "/getSuborderWithDate"}?warehouse_id=${warehouseId}&status=${status}&date=${date}&sortPrice=${sortPrice}`
        );
    }

    getAllsuborder(
        warehouseId: number,
        page: number,
        limit: number,
        suborderNumberSearchValue: number,
        suborderIdValue: string,
        quantitySearchValue: string,
        totalPriceSearchValue: string,
        dateSearchValue: any,
        statusSearchValue: string,
        sortKey: string,
        sortValue: string
    ): Observable<any> {
        return this.http.get(
            `${
                this.EndPoint2
            }?warehouse_id=${warehouseId}&page=${page}&limit=${limit}&suborderNumberSearchValue=${suborderNumberSearchValue}&suborderIdValue=${suborderIdValue}&quantitySearchValue=${quantitySearchValue}&totalPriceSearchValue=${totalPriceSearchValue}&dateSearchValue=${dateSearchValue}&statusSearchValue=${statusSearchValue}&sortKey=${sortKey}&sortValue=${sortValue}`
        );
    }


    getAllSuborderWithPR(
        warehouseId: number,
        page: number,
        limit: number,
        suborderNumberSearchValue: number,
        suborderIdValue: string,
        quantitySearchValue: string,
        totalPriceSearchValue: string,
        dateSearchValue: any,
        statusSearchValue: string,
        sortKey: string,
        sortValue: string
    ): Observable<any> {

        return this.http.get(
            `${
                this.EndPoint2
            }/forCsv?PR_status=0&warehouse_id=${warehouseId}&page=${page}&limit=${limit}&suborderNumberSearchValue=${suborderNumberSearchValue}&suborderIdValue=${suborderIdValue}&quantitySearchValue=${quantitySearchValue}&totalPriceSearchValue=${totalPriceSearchValue}&dateSearchValue=${dateSearchValue}&statusSearchValue=${statusSearchValue}&sortKey=${sortKey}&sortValue=${sortValue}`
        );

    }

    getAllByOrderId(id): Observable<any> {
        return this.http.get(
            `${this.EndPoint}?where={"deletedAt":null,"product_order_id":${id}}`
        );
    }

    getById(id): Observable<any> {
        return this.http.get(this.EndPoint + "/getWithFull/" + id);
    }

    insert(data): Observable<any> {
        return this.http.post(this.EndPoint, data);
    }

    delete(id): Observable<any> {
        return this.http.delete(`${this.EndPoint}/${id}`);
    }

    update(id: number, data: any) {
        return this.http.put(`${this.EndPoint}/${id}`, data);
    }

    massUpdatePrStatus(ids: any[], status) {
        return this.http.post(`${this.EndPoint2}/massPrStatusUpdate`, {
            ids: ids,
            status: status
        });
    }

    updateByOrderId(id: number, data: any) {
        return this.http.put(`${this.EndPoint}/updatebyorderid/${id}`, data);
    }
}
