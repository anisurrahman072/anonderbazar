import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {AuthService} from './auth.service';
import {HttpClient} from '@angular/common/http';
import {environment} from "../../environments/environment";

@Injectable({
    providedIn: 'root'
})
export class ProductDesignService {

    private EndPoint = `${environment.API_ENDPOINT}/productDesign`;

    constructor(private http: HttpClient,
                private authenticationService: AuthService) {
    }

    getAll(): Observable<any> {
        return this.http.get(this.EndPoint + '?where={"deletedAt":null}')
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

    getByProductId(id) {
        return this.http.get(`${this.EndPoint}?where={"product_id": ${id}, "deletedAt":null}`)
            ;
    }
}
