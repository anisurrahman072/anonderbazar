import {Injectable} from '@angular/core';
import 'rxjs/add/operator/map';
import {Observable} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {environment} from "../../environments/environment";

@Injectable({
    providedIn: 'root'
})
export class BrandService {

    private EndPoint = `${environment.API_ENDPOINT}/brand`;
    private EndPoint2 = `${environment.API_ENDPOINT}/brands`;

    constructor(private http: HttpClient) {
    }

    getAll(): Observable<any> {
        return this.http.get(this.EndPoint + '?where={"deletedAt":null}');
    }

    getAllBrands(
        page: number,
        limit: number,
        searchTerm: string,
        warehouseId: number,
        sortKey: string,
        sortValue: string
    ): Observable<any> {

        return this.http.get(`${this.EndPoint2
            }?page=${page
            }&limit=${limit
            }&search_term=${searchTerm
            }&warehouse_id=${warehouseId
            }&sortKey=${sortKey
            }&sortValue=${sortValue}`
        );
    }

    getById(id): Observable<any> {
        return this.http.get(this.EndPoint + '/' + id);
    }

    insert(formData): Observable<any> {
        return this.http.post(this.EndPoint, formData);
    }

    delete(id): Observable<any> {
        return this.http.delete(`${this.EndPoint}/${id}`);
    }

    update(id: number, data: any) {
        return this.http.put(`${this.EndPoint}/${id}`, data);
    }

    checkBrandNameUniqueNess(brandName: string, id: number = 0): Observable<any> {
        return this.http.post(`${this.EndPoint}/unique-check-name/${encodeURIComponent(brandName)}`, {ignore_id: id});
    }
}
