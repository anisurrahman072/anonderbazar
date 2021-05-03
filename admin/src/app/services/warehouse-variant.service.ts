import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {environment} from "../../environments/environment";

@Injectable({
    providedIn: 'root'
})
export class WarehouseVariantService {

    private EndPoint = `${environment.API_ENDPOINT}/warehousevariant`;
    private EndPoint2 = `${environment.API_ENDPOINT}/warehousevariants`;

    constructor(private http: HttpClient) {
    }

    getAll(): Observable<any> {
        // get users from api
        return this.http.get(this.EndPoint + '?where={"deletedAt":null}');
    }

    getById(id): Observable<any> {

        return this.http.get(this.EndPoint + '/' + id);
    }

    insert(data): Observable<any> {
        return this.http.post(this.EndPoint, data);
    }

    update(id: number, data: any) {
        return this.http.put(this.EndPoint + '/' + id, data);
    }

    delete(id): Observable<any> {
        return this.http.delete(`${this.EndPoint}/${id}`);
    }

    getAllWarehouseVariantBy_VariantId_And_WarehouseId(variantId: string, currentUser: any) {
        let _where = `"deletedAt":null,"variant_id":${variantId}`;
        if(currentUser.group_id === "owner"){
            _where += `,"warehouse_id":${currentUser.warehouse.id}`;
        }
        return this.http.get(`${this.EndPoint}?where={${_where}}`);
    }

    getAllWarehouseVariant(
        page: number,
        warehouseId: number,
        limit: number,
        searchTermName: string,
        sortKey: string,
        sortValue: string
    ): Observable<any> {

        return this.http.get(`${this.EndPoint2
            }?page=${page
            }&limit=${limit
            }&warehouse_id=${warehouseId
            }&searchTermName=${searchTermName
            }&sortKey=${sortKey
            }&sortValue=${sortValue}`
        )
    }


}
