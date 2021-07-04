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

    getRelatedOfferIndividualProducts(id, page = 1, limit = 20): Observable<any> {
        const skip = (page - 1) * limit;
        return this.http.get(`${this.EndPoint}/getRelatedOfferIndividualProducts?id=${id}&page=${page}&skip=${skip}&limit=${limit}`)
            .map(response => response);
    }

    removeProductFromOffer(productId, offerId): Observable<any> {
        return this.http.delete(`${this.EndPoint}/removeProductFromOffer?productId=${productId}&offerId=${offerId}`)
    }

    removeIndividualProductFromOffer(productId, offerId): Observable<any> {
        return this.http.delete(`${this.EndPoint}/removeIndividualProductFromOffer?productId=${productId}&offerId=${offerId}`)
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

    generateOfferExcelById(offer_type, offer_id): Observable<any> {
        return this.http.get(`${this.EndPoint1}/generateOfferExcelById?offer_type=${offer_type}&offer_id=${offer_id}`);
    }


    /** CSV generator for offers */

    downloadFile(data: any, header: any, fileName?: any, offer_id?: any, offerName?: any, offer_calculation_type?: any, offer_discount_amount?: any, offer_start_date?: any, offer_end_date?: any, selection_type?: any) {
        const csv = this.ConvertToCSV(data, header, fileName, offer_id, offerName, offer_calculation_type, offer_discount_amount, offer_start_date, offer_end_date, selection_type);

        const a = document.createElement('a');
        const blob = new Blob(["\ufeff", csv], {type: 'text/csv;charset=utf-8;'});
        const url = window.URL.createObjectURL(blob);

        a.href = url;
        if (fileName) {

        }
        if (fileName) {
            a.download = `${fileName}.csv`;
        } else {
            a.download = `orders.csv`;
        }
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
    }

    ConvertToCSV(objArray, headerList, fileName?: any, offer_id?: any, offerName?: any, offer_calculation_type?: any, offer_discount_amount?: any, offer_start_date?: any, offer_end_date?: any, selection_type?: any) {

        let tmpHeaderList = [...headerList];

        let array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;

        let str = '\r\n';
        str += ` ,Offer Name , ${offerName}, , Offer id , ${offer_id}\r\n`;
        str += ` ,offer_calculation_type , ${offer_calculation_type}, ,offer_start_date , ${offer_start_date}\r\n`;
        str += ` ,offer_discount_amount, ${offer_discount_amount}, , offer_end_date , ${offer_end_date}\r\n`;
        if (offerName === 'Regular offer') {
            str += ` ,selection_type, ${selection_type}\r\n`;
        }
        str += '\r\n';
        str += '\r\n';


        let row = 'S.No, ';
        for (let index in tmpHeaderList) {
            row += tmpHeaderList[index] + ', ';
        }
        row = row.slice(0, -1);
        str += row + '\r\n';
        for (let i = 0; i < array.length; i++) {
            let line = (i + 1) + '';

            for (let index in tmpHeaderList) {
                let head = tmpHeaderList[index];
                if (head === 'Transactions') {
                    let len = array[i][head].length;
                    if (len === 0) {
                        line += ', No transaction found'
                    } else {
                        if (len > 0) line += ', '

                        for (let ind = 0; ind < len; ind++) {
                            line += `[`;
                            for (let key in array[i][head][ind]) {
                                line += key + ':';
                                line += array[i][head][ind][key] + ' / ';
                            }
                            line = line.substr(0, line.split('').length - 3);
                            line += "] ";
                        }
                    }
                } else
                    line += ',' + array[i][head];
            }
            str += line + '\r\n';
        }
        return str;
    }
}
