import {Injectable} from '@angular/core';
import 'rxjs/add/operator/map';
import {Observable} from 'rxjs/Observable';
import {AppSettings} from '../config/app.config';
import {catchError} from 'rxjs/operators';
import {HttpClient} from '@angular/common/http';
import {of} from "rxjs/observable/of";

@Injectable()
export class CategoryProductService {

    private EndPoint = `${AppSettings.API_ENDPOINT}/category`;

    constructor(private http: HttpClient) {
    }

    getAll(): Observable<any> {
        // get users from api
        return this.http.get(`${this.EndPoint}?where={"type_id":2,"deletedAt":null}`)
            .map((response) => response);
    }

    getById(id): Observable<any> {
        // get users from api
        if (!id) {
            return of(null);
        }
        return this.http.get(this.EndPoint + '/' + id);
    }

    insert(categoryType): Observable<any> {
        return this.http.post(this.EndPoint, categoryType);
    }


    delete(id): Observable<any> {
        // get users from api
        return this.http.delete(`${this.EndPoint}/${id}`);
    }

    update(id: number, data: any) {
        return this.http.put(this.EndPoint + '/' + id, data)
            .map((response) => response);
    }


    getAllClass(): Observable<any> {
        return this.http.get(`${this.EndPoint}?where={"type_id":1,"deletedAt":null,"parent_id":null}`)
            .map((response) => response);
    }

    getAllCategory(): Observable<any> {
        return this.http.get(`${this.EndPoint}?where={"type_id":2,"deletedAt":null,"parent_id":0}`)
            .map((response) => response);
    }

    getAllHomeCategory(): Observable<any> {
        return this.http.get(`${this.EndPoint}?where={"type_id":2,"deletedAt":null,"parent_id":0}&limit=6`)
            .map((response) => response);
    }

    getAllsubCategory(): Observable<any> {
        return this.http.get(`${this.EndPoint}?where={"type_id":2,"deletedAt":null}`)
            .map((response) => response);
    }


    categoryWithSubcategory(): Observable<any> {
        return this.http.get(`${this.EndPoint}?category/withProductSubcategory`)
            .map((response) => response);
    }

    getHomeSubcategoryByCategory(): Observable<any> {
        return this.http.get(`${this.EndPoint}?where={"type_id":2,"deletedAt":null,"parent_id":0}&limit=3`)
            .map((response) => response);
    }

    getSubcategoryByCategoryId(id: string): Observable<any> {
        return this.http.get(`${this.EndPoint}?where={"type_id":2,"deletedAt":null,"parent_id":${id}}`)
            .map((response) => response);
    }

    getSubcategoryByCategoryIds(ids: number[]): Observable<any> {

        return this.http.get(`${this.EndPoint}?where={"type_id":2,"deletedAt":null,"parent_id":[${ids}]}`)
            .map((response) => response);
    }

    getCategoriesWithSubcategories() {
        return this.http
            .get(`${this.EndPoint}/withSubcategories`)
            .pipe(catchError((error: any) => Observable.throw(error.json())));
    }

    getAllCategories() {
        return this.http
            .get(`${this.EndPoint}/all-categories-v2`)
            .pipe(catchError((error: any) => Observable.throw(error.json())));
    }

    getCategoriesWithSubcategoriesV2() {
        return this.http
            .get(`${this.EndPoint}/with-subcategories-v2`)
            .pipe(catchError((error: any) => Observable.throw(error.json())));
    }
}
