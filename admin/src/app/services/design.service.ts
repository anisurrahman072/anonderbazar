import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {AuthService} from './auth.service';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {environment} from "../../environments/environment";

@Injectable()
export class DesignService {
    
    private EndPoint = `${environment.API_ENDPOINT}/design`;
    private EndPoint2 = `${environment.API_ENDPOINT}/designs`;
    
    constructor(private http: HttpClient,
                private authenticationService: AuthService) {
    }
    
    getAll(): Observable<any> {
        
        return this.http.get(`${this.EndPoint}?where={"deletedAt":null}`)
            ;
    }
    getAllDesign(warehouseId:number,page: number, limit: number,
                  searchTermName: string,
                  categoryId: number,
                  subcategoryId: number,
                  sortName: string): Observable<any> {
        
        
        return this.http.get(`${this.EndPoint2
            }?warehouse_id=${warehouseId}&page=${page
            }&limit=${limit
            }&searchTermName=${searchTermName
            }&category_id=${categoryId
            }&subcategory_id=${subcategoryId
            }&sortName=${sortName}`
        )
    }

    getDesigns(
        genreId: string,
        categoryId: string,
        subcategoryId: string,
        sortName: string): Observable<any> {

        
        return this.http.get(`${this.EndPoint}?where={"genre_id":{"contains":"${genreId}"},"design_category_id":{"contains":"${categoryId}"},"design_subcategory_id":{"contains":"${subcategoryId}"},"deletedAt":null}`);
    }
    
    getById(id): Observable<any> {
        // get users from api
        return this.http.get(this.EndPoint + '/' + id)
            ;
    }
    
    insert(designCategory): Observable<any> {
        return this.http.post(this.EndPoint, designCategory)
            ;
    }
    
    
    delete(id): Observable<any> {
        // get users from api
        return this.http.delete(`${this.EndPoint}/${id}`)
            ;
    }
    
    update(id: number, data: any) {
        
        return this.http.put(this.EndPoint + '/' + id, data)
            ;
    }
    
    getAllByWarehouseId(id) {
        return this.http.get(`${this.EndPoint}?where={"warehouse_id":${id},"deletedAt":null}`)
            ;
    }
    
    getDesignByDesignSubcategoryId(id: string) {
        return this.http.get(`${this.EndPoint}?where={"deletedAt":null,"design_subcategory_id":${id}}`)
            ;
    }
    
    getDesignByGenreId(id: string) {
        return this.http.get(`${this.EndPoint}?where={"deletedAt":null,"genre_id":${id}}`)
            ;
    }
}
