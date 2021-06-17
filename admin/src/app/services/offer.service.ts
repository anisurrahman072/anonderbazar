import {Injectable} from '@angular/core';
import {environment} from "../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs/Observable";

@Injectable({
    providedIn: 'root'
})
export class OfferService {
    private EndPoint = `${environment.API_ENDPOINT}/offer`;

    constructor(private http: HttpClient) {
    }

    getAllOptions(offerSelectionType): Observable<any> {
        return this.http.get(`${this.EndPoint}/getAllOptions?offerSelectionType=${offerSelectionType}`);
    }

    offerInsert(data): Observable<any> {
        return this.http.post(this.EndPoint + '/offerInsert', data)
            .map(response => response);
    }

    allRegularOffer(specialOfferLimit = 10, specialOfferPage = 1): Observable<any> {
      return  this.http
          .get(`${this.EndPoint}/allRegularOffer?limit=${specialOfferLimit}&page=${specialOfferPage}`)
          .map(response => response);
    }

    /**method called to delete a regular offer*/
    delete(id): Observable<any> {
        return this.http.delete(`${this.EndPoint}/${id}`)
            .map(response => response);
    }

    /** Method called to get a regular offer data by its id for editing purpose*/
    getRegularOfferById(id): Observable<any> {
        return this.http.get(`${this.EndPoint}/getRegularOfferById?id=${id}`).map(response => response);
    }

    getRelatedOfferProducts(id, page= 1, limit = 20): Observable<any> {
        const skip = (page - 1) * limit;
        return this.http.get(`${this.EndPoint}/getRelatedOfferProducts?id=${id}&page=${page}&skip=${skip}&limit=${limit}`)
            .map(response => response);
    }

    removeProductFromOffer(productId, offerId): Observable<any> {
        return this.http.delete(`${this.EndPoint}/removeProductFromOffer?productId=${productId}&offerId=${offerId}`)
    }

    updateOffer(data): Observable<any> {
        return this.http.post(`${this.EndPoint}/updateOffer`, data);
    }
}
