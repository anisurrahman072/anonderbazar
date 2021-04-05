import {Injectable} from '@angular/core';
import 'rxjs/add/operator/map';
import {Observable} from 'rxjs/Observable';
import {AppSettings} from '../config/app.config';
import {HttpClient} from '@angular/common/http';
import {Cart} from "../models";
import {catchError} from "rxjs/operators";

@Injectable()
export class SuborderService {

    private EndPoint = `${AppSettings.API_ENDPOINT}/suborder`;

    constructor(private http: HttpClient) {
    }

    getAll(): Observable<any> {
        return this.http.get(this.EndPoint + '?where={"deletedAt":null}')
            .map((response) => response);
    }

    getById(id): Observable<any> {
        return this.http.get(this.EndPoint + '/getWithFull/' + id)
            .map((response) => response);
    }

    insert(data): Observable<any> {
        return this.http.post(this.EndPoint, data)
            .map((response) => response);
    }

    delete(id): Observable<any> {
        // get users from api
        return this.http.delete(`${this.EndPoint}/${id}`)
            .map((response) => response);
    }


    update(id: number, data: any) {
        return this.http.put(this.EndPoint + '/' + id, data)
            .map((response) => response);
    }

    getAllByWarehouseId(id): Observable<any> {
        return this.http.get(`${this.EndPoint}?where={"deletedAt":null,"warehouse_id":${id}}`)
            .map((response) => response);
    }

    getAllFeatuerProducts(): Observable<any> {
        return this.http.get(this.EndPoint + '?where={"deletedAt":null}')
            .map((response) => response);
    }

    getByCategory(id: number): Observable<any> {
        return this.http.get(`${this.EndPoint}?where={"deletedAt":null,"category_id":${id}}`)
            .map((response) => response);
    }

    getByUserId(user_id: any): Observable<any> {
        return this.http.get<Cart>(`${this.EndPoint}?user_id=${user_id}`)
            .pipe(catchError((error: any) => Observable.throw(error.json())));
    }
}
