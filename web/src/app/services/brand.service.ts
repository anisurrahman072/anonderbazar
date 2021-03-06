import {Injectable} from '@angular/core';
import 'rxjs/add/operator/map';
import {Observable} from 'rxjs/Observable';
import {AppSettings} from '../config/app.config';
import {HttpClient} from '@angular/common/http';

@Injectable()
export class BrandService {

    private EndPoint = `${AppSettings.API_ENDPOINT}/brand`;

    constructor(private http: HttpClient) {
    }

    getAll(frontEndPosition?: any): Observable<any> {
        return this.http.get(this.EndPoint + `/getAll`);
    }

    getAllByWarehouseId(id): Observable<any> {
        return this.http.get(`${this.EndPoint}?where={"deletedAt":null,"warehouse_id":${id}}`);
    }

    getById(id): Observable<any> {
        return this.http.get(this.EndPoint + '/' + id);
    }

    shopByBrand(categoryId) {
        let data = {
            category_id: categoryId
        };
        return this.http.post(`${AppSettings.API_ENDPOINT}/brands/shopbybrand`, data);
    }

    brandsByCategories() {
        return this.http.get(`${AppSettings.API_ENDPOINT}/brands/by-categories`);
    }
}
