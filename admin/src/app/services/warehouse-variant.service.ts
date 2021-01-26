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
        return this.http.get(this.EndPoint + '?where={"deletedAt":null}')
            ;
    }

    getById(id): Observable<any> {

        return this.http.get(this.EndPoint + '/' + id)
            ;
    }

    getAllVariantByWarehouseId(id): Observable<any> {
        return this.http.get(`${this.EndPoint}?where={"deletedAt":null,"warehouse_id":${id}}`)
            ;
    }

    getAllVariantByProductId(id): Observable<any> {
        return this.http.get(`${this.EndPoint}?where={"deletedAt":null,"warehouse_id":${id}}`)
            ;
    }

    insert(data): Observable<any> {
        return this.http.post(this.EndPoint, data)
            ;
    }

    update(id: number, data: any) {
        return this.http.put(this.EndPoint + '/' + id, data)
            ;
    }

    delete(id): Observable<any> {
        return this.http.delete(`${this.EndPoint}/${id}`)
            ;
    }


    getAllWarehouseVariantBy_VariantId_And_WarehouseId(variantId: string, warehouseId: number) {
        return this.http.get(`${this.EndPoint
        }?where={"deletedAt":null,"warehouse_id":${warehouseId
        },"variant_id":${variantId}}`)
            ;
    }

    getAllVariant(warehouseId:number) {
        return this.http.get(`${this.EndPoint}?where={"deletedAt":null,"warehouse_id":${warehouseId}}`);
    }
    getAllWarehouseVariant(page: number, warehouseId: number, limit: number,
                    emailSearchValue: string,
                    searchTermName: string,
                    searchTermPhone: string,
                    gender: string,
                    categoryId: number,
                    subcategoryId: number,
                    sortName: string,
                    sortPrice: String): Observable<any> {


        return this.http.get(`${this.EndPoint2
            }?page=${page
            }&limit=${limit
            }&warehouse_id=${warehouseId
            }&searchTermEmail=${emailSearchValue
            }&searchTermName=${searchTermName
            }&searchTermPhone=${searchTermPhone
            }&gender=${gender
            }&category_id=${categoryId
            }&subcategory_id=${subcategoryId
            }&sortName=${sortName
            }&sortPrice=${sortPrice}`
        )
    }


}
