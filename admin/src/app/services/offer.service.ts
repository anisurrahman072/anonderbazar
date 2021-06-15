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
}
