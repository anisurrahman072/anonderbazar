import {Injectable} from "@angular/core";
import {Observable} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {environment} from "../../environments/environment";

@Injectable({
    providedIn: 'root'
})
export class SuborderItemService {

    private EndPoint = `${environment.API_ENDPOINT}/suborderItem`;

    private EndPoint1 = `${
        environment.API_ENDPOINT
    }/suborderItem/getSuborderItems`;

    constructor(
        private http: HttpClient
    ) {
    }

    getSuborderItems(
        warehouseId: string,
        status: number,
        date: string,
        sortPrice: String
    ): Observable<any> {
        let url;
        if (warehouseId == null || warehouseId == "") {
            url = `${this.EndPoint1}?status=${status}&date=${date}&sortPrice=${sortPrice}`;
        } else {
            url = `${this.EndPoint1}?warehouse_id=${warehouseId}&status=${status}&date=${date}&sortPrice=${sortPrice}`;
        }
        return this.http.get(url)
    }

    allOrderItemsByOrderIds(orderIds: number[]) {
        const url = `${this.EndPoint}/getByOrderIds?order_ids=${JSON.stringify(orderIds)}`;
        return this.http.get(url)
    }

    allSubOrderItemsBySubOrderIds(orderIds: number[]) {
        const url = `${this.EndPoint}/getBySubOrderIds?sub_order_ids=${JSON.stringify(orderIds)}`;
        return this.http.get(url)
    }

    getById(id): Observable<any> {
        return this.http.get(this.EndPoint + "/" + id);
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
