import {Injectable} from '@angular/core';
import 'rxjs/add/operator/map';
import {Observable} from 'rxjs/Observable';
import {AppSettings} from '../config/app.config';
import {HttpClient} from '@angular/common/http';
import {catchError} from "rxjs/operators";
import {User} from "../models";

@Injectable()
export class UserService {

    private EndPoint = `${AppSettings.API_ENDPOINT}/user`;

    constructor(private http: HttpClient) {
    }

    getAllCraftsman(): Observable<any> {
        return this.http.get(`${this.EndPoint}?where={"deletedAt":null,"group_id":6}`)
            .map((response) => response);
    }

    getById(id: number): Observable<any> {
      return this.http.get<User>(`${this.EndPoint}/${id}`)
             .pipe(catchError((error: any) => Observable.throw(error.json())));
    }

    getAuthUser(): Observable<any> {
        return this.http.get<User>(`${this.EndPoint}/getAuthUser`)
            .pipe(catchError((error: any) => Observable.throw(error.json())));
    }

    getByIdForDashBoard(id: number): Observable<any> {
        return this.http.get<User>(`${this.EndPoint}/getUserWithDashboardData/${id}`)
            .pipe(catchError((error: any) => Observable.throw(error.json())));
    }

    update(id: number, data: any) {
        return this.http.put(this.EndPoint + '/' + id, data)
            .map((response) => response);
    }

    insert(data): Observable<any> {
        return this.http.post(this.EndPoint, data)
            .map((response) => response);
    }

    delete(id): Observable<any> {
        return this.http.delete(`${this.EndPoint}/${id}`)
            .map((response) => response);
    }

    checkUsername(username: any): Observable<any> {
        return this.http.get(`${this.EndPoint}?where={"deletedAt":null,"username":"${username}"}`)
            .map((response) => response);
    }

    checkEmail(email: any): Observable<any> {
        return this.http.get(`${this.EndPoint}?where={"deletedAt":null,"email":"${email}"}`)
            .map((response) => response);
    }

    checkPhone(phone: any): Observable<any> {
        return this.http.get(`${this.EndPoint}?where={"deletedAt":null,"phone":"${phone}"}`)
            .map((response) => response);
    }

    checkEmailPhone(email: any, phone: any): Observable<any> {
        return this.http.get(`${this.EndPoint}?where={"deletedAt":null}&searchTermPhone=${phone}&searchTermEmail=${email}`).map((response) => response)
            ;
    }

    updatepassword(id: number, data: any) {
        return this.http.put(this.EndPoint + '/updatepassword/' + id, data)
            ;
    }
}
