import {Injectable} from '@angular/core';
import 'rxjs/add/operator/map';
import {Observable} from 'rxjs/Observable';
import {environment} from '../../environments/environment';
import {HttpClient} from '@angular/common/http';
import {AuthService} from "./auth.service";


@Injectable({
    providedIn: 'root'
})
export class AdminUsersService {
    private EndPoint = `${environment.API_ENDPOINT}/admin-users`;
    private currentUser: any | boolean;

    constructor(private http: HttpClient,
                private authService: AuthService) {
        this.currentUser = this.authService.getCurrentUser();
    }

    /** Method called for getting all admin users data */
    getAllAdminUsers(
        page: number,
        warehouseId: number,
        limit: number,
        emailSearchValue: string,
        searchTermName: string,
        searchTermPhone: string,
        usernameSearchValue: string,
        sortKey: string,
        sortValue: string): Observable<any> {
        return this.http.get(`${this.EndPoint}/getAllAdminUsers?page=${page
            }&limit=${limit
            }&warehouse_id=${warehouseId
            }&searchTermEmail=${emailSearchValue
            }&searchTermName=${searchTermName
            }&searchTermPhone=${searchTermPhone
            }&searchTermUsername=${usernameSearchValue
            }&sortKey=${sortKey
            }&sortValue=${sortValue}`
        );
    }

    /** Method called for creating a new admin user */
    createAdminUser(data): Observable<any> {
        return this.http.post(`${this.EndPoint}/createAdminUser`, data);
    }

    /** Method called for all user groups */
    getAllGroups(): Observable<any> {
        return this.http.get(`${this.EndPoint}/getAllGroups`);
    }

    /** Method called for apdating an admin user */
    updateAdminUser(id: number, data: any) {
        return this.http.put(`${this.EndPoint}/updateAdminUser?id=${id}`, data);
    }

    /** Method calle for getting an admin user info in order to edit them */
    getById(id: number) {
        return this.http.get(`${this.EndPoint}/getById?id=${id}`);

    }
}
