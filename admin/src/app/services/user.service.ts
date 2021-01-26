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
                private authService: AuthService,
                private authenticationService: AuthService) {

        this.currentUser = this.authService.getCurrentUser();
    }

    getAll(): Observable<any> {
        // get users from api
        return this.http.get(`${this.EndPoint}?where={"deletedAt":null}`);
    }

    getAllShopOwner(page: number, warehouseId: number, limit: number,
                    emailSearchValue: string,
                    searchTermName: string,
                    searchTermPhone: string,
                    gender: string,
                    categoryId: number,
                    subcategoryId: number,
                    sortName: string,
                    sortPrice: String): Observable<any> {


        return this.http.get(`${this.EndPoint
            }?group_id=4&page=${page
            }&limit=${limit
            }&warehouse_id=${warehouseId
            }&searchTermEmail=${emailSearchValue
            }&searchTermName=${searchTermName
            }&searchTermPhone=${searchTermPhone
            }&gender=${gender
            }&category_id=${categoryId
            }&subcategory_id=${subcategoryId
            }&sortName=${sortName
            }&sortPrice=${sortPrice}`
        );
    }

    getAllCustomer(page: number, warehouseId: number, limit: number,
                   emailSearchValue: string,
                   searchTermName: string,
                   searchTermPhone: string,
                   gender: string,
                   categoryId: number,
                   subcategoryId: number,
                   sortName: string,
                   sortPrice: String): Observable<any> {
        return this.http.get(`${this.EndPoint
            }?group_id=2&page=${page
            }&limit=${limit
            }&warehouse_id=${warehouseId
            }&searchTermEmail=${emailSearchValue
            }&searchTermName=${searchTermName
            }&searchTermPhone=${searchTermPhone
            }&gender=${gender
            }&category_id=${categoryId
            }&subcategory_id=${subcategoryId
            }&sortName=${sortName
            }&sortPrice=${sortPrice}`
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

    checkUsername(username: any): Observable<any> {
        return this.http.get(`${this.EndPoint}?where={"deletedAt":null}&username=${username}`);
    }

    checkEmail(email: any): Observable<any> {
        return this.http.get(`${this.EndPoint}?where={"deletedAt":null,"searchTermEmail":"${email}"}`);
    }

    checkPhone(phone: any): Observable<any> {
        return this.http.get(`${this.EndPoint}?where={"deletedAt":null,"phone":"${phone}"}`);
    }

    checkEmailPhone(email: any, phone: any): Observable<any> {
        return this.http.get(`${this.EndPoint}?where={"deletedAt":null}&searchTermPhone=${phone}&searchTermEmail=${email}`);
    }
}
