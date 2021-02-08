import {Injectable} from '@angular/core';
import 'rxjs/add/operator/map';
import {Observable} from 'rxjs/Observable';
import {AuthService} from './auth.service';
import {environment} from '../../environments/environment';
import {HttpClient} from '@angular/common/http';

@Injectable({
    providedIn: 'root'
})
export class CmsService {
    private EndPoint = `${environment.API_ENDPOINT}/cms`;

    constructor(private http: HttpClient,
                private authenticationService: AuthService) {
    }

    getAll(): Observable<any> {
        return this.http
            .get(this.EndPoint + '?where={"deletedAt":null}')
            .map(response => response);
    }

    getAllSearch(option: {
        page?: String;
        section?: String;
        subsection?: String;
    } = {}): Observable<any> {
        return this.http
            .get(
                this.EndPoint +
                `?where={"deletedAt":null
      ${option.page ? ',"page":"' + option.page + '"' : ''}
      ${option.section ? ',"section":"' + option.section + '"' : ''}
      ${option.subsection ? ',"sub_section":"' + option.subsection + '"' : ''}
  
      }`
            )
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
            )
            .map(response => response);
    }

    getByUserId(userID: any): Observable<any> {
        return this.http
            .get(this.EndPoint + `?where={"user_id":"${userID}","deletedAt":null}`)
            .map(response => response);
    }

    getValueById(id): Observable<any> {
        return this.http
            .get(`${this.EndPoint}?where={"deletedAt":null, "id":${id}}`)
            .map(response => response);
    }

    getById(id): Observable<any> {
        return this.http.get(this.EndPoint + '/' + id).map(response => response);
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
            .post(this.EndPoint + '/customUpdate', data) //, {headers: headers})
            .map(response => response);
    }

    customPostUpdate(data): Observable<any> {
        return this.http
            .post(this.EndPoint + '/customPostUpdate', data)
            .map(response => response);
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
