import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {environment} from "../../environments/environment";

@Injectable({
    providedIn: 'root'
})
export class WarehouseService {

    private EndPoint = `${environment.API_ENDPOINT}/warehouse`;
    private EndPoint3 = `${environment.API_ENDPOINT}/warehouses`;
    private EndPointAUTH = `${environment.API_ENDPOINT}/auth`;
    private EndPoint2 = `${environment.API_ENDPOINT}/product`;

    constructor(private http: HttpClient) {
    }

    getAll(page: number, limit: number): Observable<any> {
        return this.http.get(this.EndPoint + '?where={"deletedAt":null}');
    }

    getAllIndex(page: number, limit: number, warehouseId?: number, warehouseName?: string): Observable<any> {
        let url = `${this.EndPoint}/getAll?page=${page}&limit=${limit}&warehouse_id=${warehouseId}`;

        if (warehouseName) {
            url += `&warehouseName=${warehouseName}`;
        }
        return this.http.get(url);
    }

    getById(id): Observable<any> {
        // get users from api
        return this.http.get(this.EndPoint + '/' + id);
    }

    getallproductbywarehouseid(id): Observable<any> {
        return this.http.get(this.EndPoint2 + `?where={"warehouse_id":"${id}","deletedAt":null}`);
    }

    insert(data): Observable<any> {
        return this.http.post(this.EndPoint3 + '/create-custom', data);
    }

    signup(warehouseData): Observable<any> {
        return this.http.post(this.EndPointAUTH + '/warehouseSignup', warehouseData);
    }

    delete(id): Observable<any> {
        // get users from api
        return this.http.delete(`${this.EndPoint}/${id}`);
    }

    update(id: number, data: any) {
        return this.http.put(this.EndPoint + '/update-custom/' + id, data);
    }

    updateUserStatus(id: number, status: any) {
        return this.http.put(this.EndPoint + '/updateUserStatus/' + id, status);
    }
}
