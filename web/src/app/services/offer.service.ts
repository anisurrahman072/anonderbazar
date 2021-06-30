import {Injectable} from '@angular/core';
import 'rxjs/add/operator/map';
import {Observable} from 'rxjs/Observable';
import {HttpClient} from '@angular/common/http';
import {AppSettings} from '../config/app.config';
import {Offer} from "../models";

@Injectable()
export class OfferService {

    private EndPoint = `${AppSettings.API_ENDPOINT}/offer`;
    private EndPoint1 = `${AppSettings.API_ENDPOINT}/anonderJhor`;

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

    calculateOfferPrice(calculationType, originalPrice, discountAmount) {
        if (calculationType === 'absolute') {
            return originalPrice - discountAmount;
        } else {
            return originalPrice - (originalPrice * (discountAmount / 100.0));
        }
    }

    getAnonderJhorAndOffers(): Observable<any> {
        return this.http.get(`${this.EndPoint1}/getAnonderJhorAndOffers`);
    }

    getWebAnonderJhorOfferById(id): Observable<any> {
        return this.http.get(`${this.EndPoint1}/getWebAnonderJhorOfferById?id=${id}`);
    }

}
