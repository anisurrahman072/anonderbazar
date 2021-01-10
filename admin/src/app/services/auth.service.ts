import {Injectable} from '@angular/core';
import {Observable, of} from 'rxjs';

import {JwtHelperService} from '@auth0/angular-jwt';

import {HttpClient} from "@angular/common/http";
import {ActivatedRoute, Router} from "@angular/router";
import {AccessControl} from "../auth/core/guard/AccessControl.guard";
import {environment} from "../../environments/environment";

@Injectable()
export class AuthService {
    jwtHelper: JwtHelperService = new JwtHelperService();
    public token: string;


    constructor(private http: HttpClient) {
    }

    login(username: string, password: string): Observable<any> {
        return this.http.post(environment.API_ENDPOINT + '/auth/dashboardlogin', {
            username: username,
            password: password
        })
            ;
    }

    logout(): void {
        // clear token remove user from local storage to log user out
        this.token = null;
        localStorage.removeItem('currentUser');
        localStorage.removeItem('token');
        localStorage.removeItem('currentWarehouse');
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

    getCurrentUser() {
        const token = localStorage.getItem('token');
        if (token) {
            const jwtPayload = this.jwtHelper.decodeToken(token);
            return jwtPayload;
        } else {
            return false;
        }

    }

    getCurrentUserInfo() {
        const token = localStorage.getItem('token');
        if (token) {
            const jwtPayload = this.jwtHelper.decodeToken(token);
            return jwtPayload.userInfo;
        } else {
            return false;
        }

    }

    getCurrentUserAccessName() {
        const token = localStorage.getItem('token');
        if (token) {
            const jwtPayload = this.jwtHelper.decodeToken(token);
            return jwtPayload.group_id;
        } else {
            return false;
        }
    }

    getCurrentUserAccessNameAsync(): Observable<any> {
        const token = localStorage.getItem('token');
        if (token) {
            const jwtPayload = this.jwtHelper.decodeToken(token);
            return of(jwtPayload.group_id);
        } else {
            return of(false);
        }
    }

    setCurrentWarehouse(message: any) {
        localStorage.setItem('currentWarehouse', message);

    }

    getCurrentWarehouse() {
        let dd = localStorage.getItem('currentWarehouse');
        return dd ? parseInt(dd) : null;
    }

    loginSuccess(result) {

        localStorage.setItem('currentUser', JSON.stringify({username: result.username, token: result.token}));
        localStorage.setItem('token', result.token);
        localStorage.setItem('accessControlList', result.accessControlList);
    }


    getAccessControlList(): any[] {
        const accessControlList = localStorage.getItem('accessControlList');
        if (accessControlList) {

            const jwtPayload = this.jwtHelper.decodeToken(accessControlList);
            return jwtPayload.list;
        } else {
            return [];
        }


    }


}
