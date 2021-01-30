import {Injectable} from '@angular/core';
import 'rxjs/add/operator/map';
import {Observable} from 'rxjs';
import {AuthService} from './auth.service';
import {HttpClient} from '@angular/common/http';
import {environment} from "../../environments/environment";


@Injectable({
    providedIn: 'root'
})
export class BrandService {

    private EndPoint = `${environment.API_ENDPOINT}/brand`;
    private EndPoint2 = `${environment.API_ENDPOINT}/brands`;

    constructor(private http: HttpClient,
                private authenticationService: AuthService) {
    }

    getAll(): Observable<any> {
        return this.http.get(this.EndPoint + '?where={"deletedAt":null}');
    }

    getAllBrands(page: number, limit: number, searchTerm: string, warehouseId: number,
                 sortName: string, sortCode: string, sortSlug: string): Observable<any> {

        return this.http.get(`${this.EndPoint2
            }?page=${page
            }&limit=${limit
            }&search_term=${searchTerm
            }&warehouse_id=${warehouseId
            }&sortName=${sortName
            }&sortCode=${sortCode
            }&sortSlug=${sortSlug}`
        );
    }

    getAllByWarehouseId(id): Observable<any> {
        return this.http.get(`${this.EndPoint}?where={"deletedAt":null,"warehouse_id":${id}}`);
    }


    getById(id): Observable<any> {
        return this.http.get(this.EndPoint + '/' + id);
    }

    insert(formData): Observable<any> {
        return this.http.post(this.EndPoint, formData);
    }


    delete(id): Observable<any> {
        // get users from api
        return this.http.delete(`${this.EndPoint}/${id}`);
    }

    update(id: number, data: any) {
        return this.http.put(`${this.EndPoint}/${id}`, data);
    }
}
