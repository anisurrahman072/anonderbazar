import {Injectable} from '@angular/core';
import 'rxjs/add/operator/map';
import {catchError} from "rxjs/operators";
import {Observable} from 'rxjs/Observable';
import {AppSettings} from '../config/app.config';
import {HttpClient} from '@angular/common/http';
import {Cart} from "../models";

@Injectable()
export class CartService {

    private EndPoint = `${AppSettings.API_ENDPOINT}/cart`;

    constructor(private http: HttpClient) {
    }

    getByUserId(user_id: any): Observable<any> {
        return this.http.get<Cart>(`${this.EndPoint}/findwithcartItems?user_id=${user_id}`)
            .pipe(catchError((error: any) => Observable.throw(error.json())));
    }

    getCourierCharges(): Observable<any> {
        return this.http.get(`${AppSettings.API_ENDPOINT}/globalConfigs?where={"deletedAt":null}`)
            .map((response) => response);
    }
}
