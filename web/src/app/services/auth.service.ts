import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import {AppSettings} from '../config/app.config';
import {JwtHelper} from 'angular2-jwt';
import {HttpClient, HttpErrorResponse} from "@angular/common/http";
import {UserService} from "./user.service";
import {catchError} from "rxjs/operators";
import {Cart} from "../models";
import {of} from "rxjs/observable/of";

@Injectable()
export class AuthService {
    jwtHelper: JwtHelper = new JwtHelper();
    public token: string;
    
    constructor(private http: HttpClient, private userService: UserService) { 
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
    
    
    getCurrentUserId() {
        const token = localStorage.getItem('token');
        if (token) {
            const jwtPayload = this.jwtHelper.decodeToken(token);
            return jwtPayload.id;
        } else {
            return false;
        }
        
    }
    
    getCurrentUser(): Observable<any> {
        const token = localStorage.getItem('token');
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
}
