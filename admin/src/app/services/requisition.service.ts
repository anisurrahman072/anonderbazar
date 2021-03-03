import {Injectable} from "@angular/core";
import {Observable} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {environment} from "../../environments/environment";

@Injectable({
    providedIn: 'root'
})
export class RequisitionService {
    private EndPoint = `${environment.API_ENDPOINT}/prstatus`;
    private EndPoint2 = `${environment.API_ENDPOINT}/suborders`;

    constructor(
        private http: HttpClient
    ) {
    }

    getAll(): Observable<any> {
        return this.http.get(this.EndPoint + '?where={"deletedAt":null}');
    }

    getAllByOrderId(id): Observable<any> {
        return this.http.get(
            `${this.EndPoint}?where={"deletedAt":null,"product_order_id":${id}}`
        );
    }

    getById(id): Observable<any> {
        return this.http.get(this.EndPoint + "/" + id);
    }

    insert(data): Observable<any> {
        return this.http.post(this.EndPoint, data);
    }

    insertMass(data): Observable<any> {
        return this.http.post(this.EndPoint + '/massInsert', {
            dataToInsert: data
        });
    }

    delete(id): Observable<any> {
        // get users from api
        return this.http.delete(`${this.EndPoint}/${id}`);
    }

    update(id: number, data: any) {
        return this.http.put(`${this.EndPoint}/${id}`, data);
    }
}
