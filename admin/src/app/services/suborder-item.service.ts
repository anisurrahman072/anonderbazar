import {Injectable} from "@angular/core";
import {Observable} from "rxjs";
import {AuthService} from "./auth.service";
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
        private http: HttpClient,
        private authenticationService: AuthService
    ) {
    }

    getAll(): Observable<any> {
        return this.http.get(this.EndPoint + '?where={"deletedAt":null}');
    }

    getSuborderItems(
        warehouseId: string,
        status: number,
        date: string,
        sortPrice: String
    ): Observable<any> {
        if (warehouseId == null || warehouseId == "") {
            return this.http.get(`${this.EndPoint1}?status=${status}&date=${date}&sortPrice=${sortPrice}`);
        } else {
            return this.http.get(`${this.EndPoint1}?warehouse_id=${warehouseId}&status=${status}&date=${date}&sortPrice=${sortPrice}`);
        }
    }


    getAllByWarehouseId(id): Observable<any> {
        return this.http.get(
            `${this.EndPoint}?where={"deletedAt":null,"warehouse_id":${id}}`
        );
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

    getBySuborderId(id): Observable<any> {
        return this.http.get(this.EndPoint + "/?product_suborder_id=" + id);
    }
}
