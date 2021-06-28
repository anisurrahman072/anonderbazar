import {Injectable} from '@angular/core';
import {environment} from "../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs/Observable";
import {Subject} from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class OfferService {
    private EndPoint = `${environment.API_ENDPOINT}/offer`;
    private EndPoint1 = `${environment.API_ENDPOINT}/anonderJhor`;

    private reloadOfferListSub: Subject<boolean>;
    private readonly reloadOfferListObserve: Observable<boolean>;

    constructor(private http: HttpClient) {
        this.reloadOfferListSub = new Subject<boolean>();
        this.reloadOfferListObserve = this.reloadOfferListSub.asObservable();
    }

    reloadOfferListObservable() {
        return this.reloadOfferListObserve;
    }

    reloadOfferList() {
        this.reloadOfferListSub.next(true);
    }

    getAllOptions(offerSelectionType = '', catId = '', subCatId = ''): Observable<any> {
        return this.http.get(`${this.EndPoint}/getAllOptions?offerSelectionType=${offerSelectionType}&catId=${catId}&subCatId=${subCatId}`);
    }

    offerInsert(data): Observable<any> {
        return this.http.post(this.EndPoint + '/offerInsert', data)
            .map(response => response);
    }

    allRegularOffer(specialOfferLimit = 10, specialOfferPage = 1): Observable<any> {
        return this.http
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

    getRelatedOfferProducts(id, page = 1, limit = 20): Observable<any> {
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

    getSelectedProductsInfo(data): Observable<any> {
        return this.http.get(`${this.EndPoint}/getSelectedProductsInfo?data=${data}`);
    }

    activeStatusChange(data): Observable<any> {
        return this.http.post(`${this.EndPoint}/activeStatusChange`, data);
    }

    /** AnonderJhor starts from here */
    getAnonderJhor(): Observable<any> {
        return this.http.get(`${this.EndPoint1}/getAnonderJhor`);
    }

    updateAnonderJhor(data): Observable<any> {
        return this.http.post(`${this.EndPoint1}/updateAnonderJhor`, data);
    }

    jhorActiveStatusChange(data): Observable<any> {
        return this.http.post(`${this.EndPoint1}/jhorActiveStatusChange`, data);
    }

    getAllAnonderJhorOffersData(anonderJhorOfferLimit = 10, anonderJhorOfferPage = 1): Observable<any> {
        return this.http
            .get(`${this.EndPoint1}/getAllAnonderJhorOffersData?limit=${anonderJhorOfferLimit}&page=${anonderJhorOfferPage}`)
            .map(response => response);
    }

    offerActiveStatusChange(data): Observable<any> {
        return this.http.post(`${this.EndPoint1}/offerActiveStatusChange`, data);
    }

    /** method called to delete a Anonder Jhor offer */
    deleteAnonderJhorOffer(id): Observable<any> {
        return this.http.post(`${this.EndPoint1}/deleteAnonderJhorOffer`, id)
            .map(response => response);
    }

    anonderJhorOfferInsert(data): Observable<any> {
        return this.http.post(this.EndPoint1 + '/anonderJhorOfferInsert', data)
            .map(response => response);
    }

    getAllCategories(): Observable<any> {
        return this.http.get(`${this.EndPoint1}/getAllCategories`);
    }

    getAllSubCategories(parentId): Observable<any> {
        return this.http.get(`${this.EndPoint1}/getAllSubCategories?parentId=${parentId}`);
    }

    getAllSubSubCategories(parentId): Observable<any> {
        return this.http.get(`${this.EndPoint1}/getAllSubSubCategories?parentId=${parentId}`);
    }

    getAnonderJhorOfferById(id): Observable<any> {
        return this.http.get(`${this.EndPoint1}/getAnonderJhorOfferById?id=${id}`).map(response => response);
    }

    updateAnonderJhorOffer(data): Observable<any> {
        return this.http.post(`${this.EndPoint1}/updateAnonderJhorOffer`, data);
    }
}
