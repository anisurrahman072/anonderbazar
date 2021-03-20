import {Injectable} from '@angular/core';
import 'rxjs/add/operator/map';
import {Observable} from 'rxjs/Observable';
import {AppSettings} from '../config/app.config';
import {HttpClient} from '@angular/common/http';
import {catchError} from "rxjs/operators";
import {Product} from "../models";

@Injectable()
export class FavouriteProductService {

    private EndPoint = `${AppSettings.API_ENDPOINT}/favouriteproduct`;

    constructor(private http: HttpClient) {
    }

    getById(id): Observable<any> {
        return this.http.get(this.EndPoint + '/' + id)
            .pipe(catchError((error: any) => Observable.throw(error.json())));
    }

    getByUserId(user_id: any): Observable<any> {
        return this.http.get(`${this.EndPoint}/byuser?user_id=${user_id}`)
            .pipe(catchError((error: any) => Observable.throw(error.json())));
    }

    getByAuthUser(): Observable<any> {
        return this.http.get(`${this.EndPoint}/byAuthUser?populate=true`)
            .pipe(catchError((error: any) => Observable.throw(error.json())));
    }

    getByAuthUserNoPopulate(): Observable<any> {
        return this.http.get(`${this.EndPoint}/byAuthUser?populate=false`)
            .pipe(catchError((error: any) => Observable.throw(error.json())));
    }

    deleteAllByUserId(user_id: any): Observable<any> {
        return this.http.post(`${this.EndPoint}/byuser?user_id=${user_id}`, {})
            .pipe(catchError((error: any) => Observable.throw(error.json())));
    }

    getByUserIdWithNoPopulate(user_id: any): Observable<any> {
        return this.http.get<Product[]>(`${this.EndPoint}?where={"user_id":${user_id}}&populate=false`)
            .pipe(catchError((error: any) => Observable.throw(error.json())));
    }

    insert(data): Observable<any> {
        return this.http.post(this.EndPoint, data)
            .pipe(catchError((error: any) => Observable.throw(error.json())));
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


}
