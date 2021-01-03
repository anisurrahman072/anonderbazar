import {Injectable} from '@angular/core';


import {Observable} from 'rxjs';
import {AuthService} from './auth.service';
import {HttpClient} from '@angular/common/http';
import {environment} from "../../environments/environment";

@Injectable()
export class CraftsmanService {
    
    private EndPoint = `${environment.API_ENDPOINT}/user`;
    private EndPoint2 = `${environment.API_ENDPOINT}/craftsmans`;
    private EndPoint3 = `${environment.API_ENDPOINT}/product`;
    
    constructor(private http: HttpClient,
                private authenticationService: AuthService) {
    }
    
    getAll(): Observable<any> {
        
        return this.http.get(`${this.EndPoint}?where={"deletedAt":null}`);
    }
    
    getAllCraftsman2(warehouseId) {
        return this.http.get(`${this.EndPoint2}?warehouse_id=${warehouseId}`);
    }
    
    getAllCraftsman(page: number, warehouseId: number, limit: number,
                    emailSearchValue: string,
                    searchTermName: string,
                    searchTermPhone: string,
                    gender: string,
                    categoryId: number,
                    subcategoryId: number,
                    sortName: string,
                    sortPrice: String): Observable<any> {
        
        
        return this.http.get(`${this.EndPoint2
            }?page=${page
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
        )
    }
    
    getAllCraftsmanByWarehouseId(warehouseId: any): Observable<any> {
        warehouseId = warehouseId || '';
        return this.http.get(`${this.EndPoint2}?warehouse_id=${warehouseId}`)
    }
    getAllCraftsmanBycraftsmanId(craftsmanId: any): Observable<any> {
        craftsmanId = craftsmanId || '';
        return this.http.get(this.EndPoint3+ `?where={"craftsman_id":"${craftsmanId}","deletedAt":null}`);
    }
    getById(id: number) {
        return this.http.get(this.EndPoint + '/' + id);
        
    }
    
    update(id: number, data: any) {
        return this.http.put(this.EndPoint + '/' + id, data)
            ;
    }
    
    insert(data): Observable<any> { 
        return this.http.post(this.EndPoint, data);
    }
    
    delete(id): Observable<any> {
        return this.http.delete(`${this.EndPoint}/${id}`);
    }
    
}
