import {Injectable} from '@angular/core';
import {Observable, of} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {environment} from "../../environments/environment";

@Injectable({
    providedIn: 'root'
})
export class AreaService {

    private EndPoint = `${environment.API_ENDPOINT}/area`;

    constructor(private http: HttpClient) {
    }

    getById(id): Observable<any> {
        return this.http.get(this.EndPoint + '/' + id);
    }

    insert(data): Observable<any> {
        return this.http.post(this.EndPoint, data);
    }

    delete(id): Observable<any> {
        return this.http.delete(`${this.EndPoint}/${id}`);
    }

    update(id: number, data: any) {
        return this.http.put(`${this.EndPoint}/${id}`, data);
    }

    getMinistryDepartmentById(id): Observable<any> {
        return this.http.get(`${this.EndPoint}/${id}`);
    }

    getAllDirectorate(): Observable<any> {
        return this.http.get(`${this.EndPoint}?where={"deletedAt":null,"type_id":3}`);
    }

    getAllDivision(): Observable<any> {
        return this.http.get(`${this.EndPoint}?where={"deletedAt":null,"type_id":4}`);
    }

    getAllZilaByDivisionId(id): Observable<any> {
        /*console.log('getAllZilaByDivisionId', id);*/
        if(!id || id === 'undefined'){
            return of([]);
        }
        return this.http.get(`${this.EndPoint}?where={"deletedAt":null,"parent_id":${id}}`);
    }

    getAllUpazilaByZilaId(id): Observable<any> {
        /*console.log('getAllUpazilaByZilaId', id);*/
        if(!id || id === 'undefined'){
            return of([]);
        }
        return this.http.get(`${this.EndPoint}?where={"deletedAt":null,"parent_id":${id}}`);
    }

}
