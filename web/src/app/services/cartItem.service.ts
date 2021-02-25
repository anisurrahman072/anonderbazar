import {Injectable} from '@angular/core';
import 'rxjs/add/operator/map';
import {Observable} from 'rxjs/Observable';
import {AppSettings} from '../config/app.config';
import {HttpClient} from '@angular/common/http';

@Injectable()
export class CartItemService {

    private EndPoint = `${AppSettings.API_ENDPOINT}/cartItem`;

    constructor(private http: HttpClient) {
    }

    insert(data): Observable<any> {
        return this.http.post(this.EndPoint, data)
            .map((response) => response);
    }

    delete(id): Observable<any> {
        return this.http.delete(`${this.EndPoint}/${id}`)
            .map((response) => response);
    }

    update(id: number, data: any) {
        return this.http.put(this.EndPoint + '/' + id, data)
            .map((response) => response);
    }
}
