import {Injectable} from '@angular/core';
import 'rxjs/add/operator/map';
import {Observable} from 'rxjs/Observable';
import {environment} from '../../environments/environment';
import {HttpClient} from '@angular/common/http';
import {RequestOptionsArgs} from "@angular/http";

@Injectable({
    providedIn: 'root'
})
export class CmsService {
    private EndPoint = `${environment.API_ENDPOINT}/cms`;

    constructor(private http: HttpClient) {
    }

    getAllSearch(option: {
        page?: String,
        section?: String,
        subsection?: String
    } = {}, homeOfferLimit = 10, homeOfferPage = 1): Observable<any> {
        return this.http
            .get(this.EndPoint + `/getAll?where={"deletedAt":null${option.page ? ',"page":"' + option.page + '"' : ''}${option.section ? ',"section":"' + option.section + '"' : ''}${option.subsection ? ',"sub_section":"' + option.subsection + '"' : ''}}&limit=${homeOfferLimit}&page=${homeOfferPage}`)
            .map(response => response);
    }

    getBySectionName(sectionName: any): Observable<any> {
        return this.http
            .get(
                this.EndPoint + `?where={"section":"${sectionName}","deletedAt":null}`
            )
            .map(response => response);
    }

    getBySubSectionName(subSectionName: any): Observable<any> {
        return this.http
            .get(
                this.EndPoint +
                `?where={"sub_section":"${subSectionName}","deletedAt":null}`
            );
    }

    getByUserId(userID: any): Observable<any> {
        return this.http
            .get(this.EndPoint + `?where={"user_id":"${userID}","deletedAt":null}`)
            .map(response => response);
    }

    getById(id): Observable<any> {
        return this.http.get(this.EndPoint + '/' + id).map(response => response);
    }

    getByIds(ids: any) {
        return this.http.get(this.EndPoint + '/byIds?ids=' + JSON.stringify(ids)).map(response => response);
    }

    insert(data): Observable<any> {
        return this.http.post(this.EndPoint, data).map(response => response);
    }

    customInsert(data): Observable<any> {
        return this.http
            .post(this.EndPoint + '/customInsert', data)
            .map(response => response);
    }

    customPostInsert(data): Observable<any> {
        return this.http
            .post(this.EndPoint + '/customPostInsert', data)
            .map(response => response);
    }

    offerInsert(data): Observable<any> {
        return this.http
            .post(this.EndPoint + '/offerInsert', data)
            .map(response => response);
    }

    offerProductUpdate(data): Observable<any> {
        return this.http
            .post(this.EndPoint + '/offerProductUpdate', data)
            .map(response => response);
    }

    updateOffer(data): Observable<any> {
        return this.http
            .post(this.EndPoint + `/updateOffer`, data)
            .map(response => response);
    }

    customUpdate(data): Observable<any> {
        return this.http
            .post(this.EndPoint + '/customUpdate', data);
    }

    customPostUpdate(data): Observable<any> {
        // const headers = { 'Content-Type': 'multipart/form-data' };

        return this.http
            .post(this.EndPoint + '/customPostUpdate', data)
            .map(response => response);
    }

    deleteCarouselImage(id: string, data: any) {

        return this.http
            .put(this.EndPoint + '/deleteCarouselImage/' + id, data);
    }

    uploadCarouselMobileImage(id: string, data: any) {

        return this.http
            .put(this.EndPoint + '/uploadCarouselImage/' + id, data);
    }

    customDelete(data): Observable<any> {
        return this.http
            .post(this.EndPoint + '/customDelete', data)
            .map(response => response);
    }

    delete(id): Observable<any> {
        // get users from api
        return this.http.delete(`${this.EndPoint}/${id}`).map(response => response);
    }

    update(id: number, data: any) {
        return this.http
            .put(`${this.EndPoint}/${id}`, data)
            .map(response => response);
    }
}
