import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import {AppSettings} from '../config/app.config';
import {JwtHelper} from 'angular2-jwt';
import {HttpClient} from "@angular/common/http";
import {UserService} from "./user.service";
import {catchError} from "rxjs/operators";
import {of} from "rxjs/observable/of";

@Injectable()
export class AuthService {
    private EndPoint = `${AppSettings.API_ENDPOINT}/auth`;
    public token: string;

    constructor(private http: HttpClient, private jwtHelper: JwtHelper, private userService: UserService) {
    }

    login(username: string, password: string): Observable<any> {
        return this.http.post(AppSettings.API_ENDPOINT + '/auth/customerLogin', {
                username: username,
                password: password
            })
            .map((response) => response);
    }

    logout(): void {
        // clear token remove user from local storage to log user out
        this.token = null;
        localStorage.removeItem('currentUser');
        localStorage.removeItem('token');
    }

    clearLocalStorege(): void {
        // clear token remove user from local storage to log user out
        this.token = null;
        localStorage.clear();
    }


    getToken() {
        const token = localStorage.getItem('token');
        if (token) {
            return token;
        }
        return false;
    }


    isTokenExpired(){
        const token = this.getToken();
        if (token) {
            return this.jwtHelper.isTokenExpired(token);
        } else {
            return true;
        }
    }
    getCurrentUserId() {
        const token = this.getToken();
        if (token) {
            const jwtPayload = this.jwtHelper.decodeToken(token);
            return jwtPayload.id;
        } else {
            return false;
        }
    }

    getCurrentUser(): Observable<any> {
        const token = this.getToken();
        if (token) {
            const jwtPayload = this.jwtHelper.decodeToken(token);

            return this.userService.getById(jwtPayload.id);

        } else {
            return of();
        }

    }

    //Get IP Adress using http://freegeoip.net/json/?callback
    getIpAddress(): Observable<any> {
        return this.http
            .get('http://freegeoip.net/json/?callback')
            .pipe(catchError((error: any) => Observable.throw(error.json())));
    }

    setCurrentIpAddress(ip: string) {
        localStorage.setItem('ip', ip);
    }

    getCurrentIpAddress() {
        const ip = localStorage.getItem('ip');
        if (ip) {
            return ip
        } else {
            return false;
        }
    }

    signUp(data): Observable<any> {
        return this.http
            .post(AppSettings.API_ENDPOINT + '/auth/signup', data)
            .map(response => response);
    }
    usernameUnique(data): Observable<any> {
        return this.http
            .post(AppSettings.API_ENDPOINT + '/auth/usernameUnique', data)
            .map(response => response);
    }

    forgetPassword(data: any): Observable<any> {
        return this.http.put(`${this.EndPoint}/forgetPassword`, data).map((response) => response);
    }
}
