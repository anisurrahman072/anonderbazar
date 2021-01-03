import {Injectable} from '@angular/core';
import {Http, Headers, RequestOptions, Response} from '@angular/http';




import {Observable} from 'rxjs';
import {AuthService} from './auth.service';
import {HttpClient} from '@angular/common/http';
import {environment} from "../../environments/environment";

@Injectable()
export class PartService {
    
    private EndPoint = `${environment.API_ENDPOINT}/part`;
    private EndPoint2 = `${environment.API_ENDPOINT}/parts`;
    
    constructor(private http: HttpClient,
                private authenticationService: AuthService) {
    }
    
    getAll(): Observable<any> {
        return this.http.get(this.EndPoint + '?where={"deletedAt":null}')
            ;
    }
    
    getAllCategory() {
        return this.http.get(`${this.EndPoint2
            }?where={"type_id":2,"parent_id":0,"deletedAt":null}`);
    }
    
    getAllParts(page: number,
                   limit: number,
                   searchTerm: string,
                   typeId:string,
                   categoryId: number,
                   subcategoryId: number,
                   sortName: string,
                   sortPrice: String): Observable<any> {
        return this.http.get(`${this.EndPoint2}?page=${page
            }&limit=${limit
            }&search_term=${searchTerm
            }&typeId=${typeId
            }&category_id=${categoryId
            }&subcategory_id=${subcategoryId
            }&sortName=${sortName
            }&sortPrice=${sortPrice}`
        )
            ;
    }
    
    getById(id): Observable<any> {
        
        return this.http.get(this.EndPoint + '/' + id)
            ;
    }
    
    insert(data): Observable<any> {
        return this.http.post(this.EndPoint, data)
            ;
    }
    
    
    delete(id): Observable<any> {
        // get users from api
        return this.http.delete(`${this.EndPoint}/${id}`)
            ;
    }
    
    update(id: number, data: any) {
        return this.http.put(`${this.EndPoint}/${id}`, data)
            ;
    }
    
    getPartBySubcategoryId(id: string) {
        return this.http.get(`${this.EndPoint}?where={"subcategory_id":${id},"deletedAt":null}`)
            ;
    }
}
