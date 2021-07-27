import {Injectable} from '@angular/core';
import {environment} from "../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs/Observable";

@Injectable({
    providedIn: 'root'
})
export class ImageService {

    private Endpoint = `${environment.API_ENDPOINT}/image`;

    constructor(private http: HttpClient) {
    }

    insertImage(data): Observable<any> {
        return this.http.put(`${this.Endpoint}/insert-image`, data);
    }

    deleteImage(data): Observable<any> {
        return this.http.put(`${this.Endpoint}/delete-image`, data);
    }
}
