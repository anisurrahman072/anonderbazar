import {Injectable} from '@angular/core';
import 'rxjs/add/operator/map';
import {Observable} from 'rxjs/Observable';
import {HttpClient} from '@angular/common/http';
import {AppSettings} from '../config/app.config';
import {Offer} from "../models";

@Injectable()
export class OfferService {

    private EndPoint = `${AppSettings.API_ENDPOINT}/offer`;

    constructor(private http: HttpClient) {
    }

    getWebRegularOffers(): Observable<any> {
        return this.http.get(`${this.EndPoint}/getWebRegularOffers`);
    }

    getWebRegularOfferById(id): Observable<any> {
        return this.http.get(`${this.EndPoint}/getWebRegularOfferById?id=${id}`);
    }

    getRegularOfferStore(): Observable<any> {
        return this.http.get(`${this.EndPoint}/getRegularOfferStore`);
    }

}
