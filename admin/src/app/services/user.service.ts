import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {AuthService} from './auth.service';
import {HttpClient} from '@angular/common/http';
import {environment} from "../../environments/environment";

@Injectable({
    providedIn: 'root'
})
export class UserService {

    private EndPoint = `${environment.API_ENDPOINT}/user`;
    private currentUser: any | boolean;

    constructor(private http: HttpClient,
                private authService: AuthService) {

        this.currentUser = this.authService.getCurrentUser();
    }

    getAllShopOwner(
        page: number,
        warehouseId: number,
        limit: number,
        emailSearchValue: string,
        searchTermName: string,
        searchTermPhone: string,
        usernameSearchValue: string,
        sortKey: string,
        sortValue: string): Observable<any> {


        return this.http.get(`${this.EndPoint
            }/all-shop-users?page=${page
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

    getAllCustomer(
        page: number,
        warehouseId: number,
        limit: number,
        emailSearchValue: string,
        searchTermName: string,
        searchTermPhone: string,
        usernameSearchValue: string,
        sortKey: string,
        sortValue: string): Observable<any> {

        return this.http.get(`${this.EndPoint
            }/all-customers?page=${page
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

    getAllCraftsman(): Observable<any> {

        let dd = this.currentUser.warehouse ? this.currentUser.warehouse.id ? `"warehouse_id":${this.currentUser.warehouse.id}}` : `` : ``;
        return this.http.get(`${this.EndPoint}?where={"deletedAt":null,"group_id":6,` + dd);
    }

    getAllCraftsmanByWarehouseId(id: number): Observable<any> {
        return this.http.get(`${this.EndPoint}?where={"deletedAt":null,"group_id":6,"warehouse_id":${id}}`);
    }

    getById(id: number) {
        return this.http.get(this.EndPoint + '/' + id);
    }

    update(id: number, data: any) {
        return this.http.put(this.EndPoint + '/' + id, data);
    }

    updatepassword(id: number, data: any) {
        return this.http.put(this.EndPoint + '/updatepassword/' + id, data);
    }

    insert(data): Observable<any> {
        return this.http.post(this.EndPoint, data);
    }

    delete(id): Observable<any> {
        return this.http.delete(`${this.EndPoint}/${id}`);
    }

    checkUsername(username: string, excludeId: number = 0): Observable<any> {
        return this.http.post(`${this.EndPoint}/checkUsername`, {username, exclude_id: excludeId});
    }

    checkEmail(email: string, excludeId: number = 0): Observable<any> {
        return this.http.post(`${this.EndPoint}/checkEmail`, {email: email, exclude_id: excludeId});
    }

    checkPhone(phone: string, excludeId: number = 0): Observable<any> {
        return this.http.post(`${this.EndPoint}/checkPhone`, {phone, exclude_id: excludeId});
    }

    checkEmailPhone(email: string, phone: string): Observable<any> {
        return this.http.get(`${this.EndPoint}?where={"deletedAt":null}&searchTermPhone=${phone}&searchTermEmail=${email}`);
    }
}
