import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {AuthService} from './auth.service';
import {HttpClient} from '@angular/common/http';
import {environment} from "../../environments/environment";

@Injectable({
    providedIn: 'root'
})
export class DesignImagesService {

    private EndPoint = `${environment.API_ENDPOINT}/designimages`;
    private EndPoint2 = `${environment.API_ENDPOINT}/image`;

    constructor(private http: HttpClient,
                private authenticationService: AuthService) {
    }

    getAll(): Observable<any> {
        return this.http.get(`${this.EndPoint}?where={"deletedAt":null}`)
    }

    getAllCombinationByProductId(productId: number): Observable<any> {
        return this.http.get(`${this.EndPoint}/getAllByProductId/${productId}`);
    }


    getById(id): Observable<any> {

        return this.http.get(this.EndPoint + '/' + id);
    }

    insert(data): Observable<any> {
        return this.http.post(this.EndPoint, data)
            ;
    }


    delete(id): Observable<any> {
        // get users from api
        return this.http.delete(`${this.EndPoint}/${id}`)

    }

    update(id: number, data: any) {
        return this.http.put(`${this.EndPoint}/${id}`, data)

    }

    updateByCombination(productId, imageData) {
        return this.http.put(`${this.EndPoint}/${productId}`, imageData)

    }


    getSingleImageByCombination(productId, combination: any) {

        return this.http.get(`${this.EndPoint}/getSingleByProductId/${productId}?combination=${combination}`)
    }

    insertImage(data): Observable<any> {
        return this.http.put(`${this.EndPoint2}/insert-image`, data);
    }

    deleteImage(data): Observable<any> {
        return this.http.put(`${this.EndPoint2}/delete-image`, data);
    }
}
