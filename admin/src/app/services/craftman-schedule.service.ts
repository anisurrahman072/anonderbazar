import {Injectable} from '@angular/core';
import {Http, Headers, RequestOptions, Response} from '@angular/http';




import {Observable} from 'rxjs';
import {AuthService} from './auth.service';
import {HttpClient} from '@angular/common/http';
import {environment} from "../../environments/environment";

@Injectable()
export class CraftmanScheduleService {
    
    private EndPoint = `${environment.API_ENDPOINT}/craftmanschedule`;
    
    constructor(private http: HttpClient,
                private authenticationService: AuthService) {
    }
    
    getAll(): Observable<any> {
        return this.http.get(this.EndPoint + '?where={"deletedAt":null}')
            ;
    }
    
    getAllByWarehouseId(id): Observable<any> {
        return this.http.get(`${this.EndPoint}?where={"deletedAt":null,"warehouse_id":${id}}`)
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
}
