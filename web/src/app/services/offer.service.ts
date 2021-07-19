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

    getWebRegularOfferById(offerId, brandId, sortData?): Observable<any> {
        let _query = `${this.EndPoint}/getWebRegularOfferById?offerId=${offerId}&brandId=${brandId}`;
        if (sortData) {
            sortData = JSON.stringify(sortData);
            _query += `&sortData=${sortData}`;
        }
        return this.http.get(_query);
    }

    getAllOfferedProducts(): Observable<any> {
        return this.http.get(`${this.EndPoint}/getAllOfferedProducts`);
    }

    getOfferedProductsBrands(offerId): Observable<any> {
        return this.http.get(`${this.EndPoint}/getOfferedProductsBrands?offerId=${offerId}`);
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

    getAnonderJhorInfo(): Observable<any> {
        return this.http.get(`${this.EndPoint1}/getAnonderJhorInfo`);
    }

    getWebAnonderJhorOfferById(id, sortData): Observable<any> {
        let _query = `${this.EndPoint1}/getWebAnonderJhorOfferById?id=${id}`;
        if (sortData) {
            sortData = JSON.stringify(sortData);
            _query += `&sortData=${sortData}`;
        }
        console.log("_query: ", _query);
        return this.http.get(_query);
    }
}
