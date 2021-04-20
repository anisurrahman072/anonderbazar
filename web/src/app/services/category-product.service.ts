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
        return this.http.get(`${this.EndPoint}?where={"type_id":2,"deletedAt":null}`);
    }

    getById(id): Observable<any> {
        // get users from api
        if(!id){
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
        return this.http.put(this.EndPoint + '/' + id, data);
    }


    getAllClass(): Observable<any> {
        return this.http.get(`${this.EndPoint}?where={"type_id":1,"deletedAt":null,"parent_id":null}`);
    }

    getAllCategory(): Observable<any> {
        return this.http.get(`${this.EndPoint}?where={"type_id":2,"deletedAt":null,"parent_id":0}`);
    }

    getAllHomeCategory(): Observable<any> {
        return this.http.get(`${this.EndPoint}?where={"type_id":2,"deletedAt":null,"parent_id":0}&limit=6`);
    }

    getAllsubCategory(): Observable<any> {
        return this.http.get(`${this.EndPoint}?where={"type_id":2,"deletedAt":null}`);
    }


    categoryWithSubcategory(): Observable<any> {
        return this.http.get(`${this.EndPoint}?category/withProductSubcategory`);
    }

    getHomeSubcategoryByCategory(): Observable<any> {
        return this.http.get(`${this.EndPoint}?where={"type_id":2,"deletedAt":null,"parent_id":0}&limit=3`);
    }

    getSubcategoryByCategoryId(id: string): Observable<any> {
        return this.http.get(`${this.EndPoint}?where={"type_id":2,"deletedAt":null,"parent_id":${id}}`);
    }

    getSubcategoryByCategoryIds(ids: number[]): Observable<any> {

        return this.http.get(`${this.EndPoint}?where={"type_id":2,"deletedAt":null,"parent_id":[${ids}]}`);
    }
    getSubcategoryByCategoryIdsV2(category_ids: number[]): Observable<any> {

        return this.http.get(`${this.EndPoint}/withSubcategoriesforSpecific?category_ids=[${category_ids}]`);
    }
    getCategoriesWithSubcategories() {
        return this.http
            .get(`${this.EndPoint}/withsubcategories`)
            .pipe(catchError((error: any) => Observable.throw(error.json())));
    }
}
