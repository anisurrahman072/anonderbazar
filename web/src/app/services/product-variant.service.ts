import {Injectable} from '@angular/core';

import 'rxjs/add/operator/map';


import {Observable} from 'rxjs/Observable';
import {AppSettings} from '../config/app.config';
import {HttpClient} from '@angular/common/http';

@Injectable()
export class ProductVariantService {
    
    private EndPoint = `${AppSettings.API_ENDPOINT}/productvariant`;
    
    constructor(private http: HttpClient) {
    }
    
    getAll(): Observable<any> { 
        // get users from api
        return this.http.get(this.EndPoint + '?where={"deletedAt":null}')
            .map((response) => response);
    }
    
    getById(id): Observable<any> {
        
        return this.http.get(this.EndPoint + '/' + id)
            .map((response) => response);
    } 
    
    insert(data): Observable<any> {
        return this.http.post(this.EndPoint, data)
            .map((response) => response);
    }
    
    update(id: number, data: any) {
        return this.http.put(this.EndPoint + '/' + id, data)
            .map((response) => response);
    }
    
    delete(id): Observable<any> {
        return this.http.delete(`${this.EndPoint}/${id}`)
            .map((response) => response);
    }
    
    getAllVariantByProductId(id): Observable<any> {
        return this.http.get(`${this.EndPoint}/byvariant?product_id=${id}`)
            .map((response) => response);
    }
    
    
}
