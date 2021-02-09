import {Injectable} from '@angular/core';
import 'rxjs/add/operator/map';
import {Observable} from 'rxjs/Observable';
import {AuthService} from './auth.service';
import {HttpClient} from '@angular/common/http';
import {AppSettings} from '../config/app.config';

@Injectable()
export class CmsService {
    private EndPoint = `${AppSettings.API_ENDPOINT}/cms`;

    constructor(
        private http: HttpClient,
        private authenticationService: AuthService
    ) {
    }

    getAll(): Observable<any> {
        return this.http
            .get(this.EndPoint + '?where={"deletedAt":null}')
            .map(response => response);
    }

    getById(id): Observable<any> {
        return this.http.get(this.EndPoint + '/' + id).map(response => response);
    }

    insert(data): Observable<any> {
        return this.http.post(this.EndPoint, data).map(response => response);
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

    getByPageName(pageName: String): Observable<any> {
        return this.http
            .get(
                this.EndPoint + `?where={"page":"${pageName}","deletedAt":null}`
            )
            .map(response => response);
    }

    getBySectionName(pageName: String, sectionName: String): Observable<any> {
        return this.http
            .get(
                this.EndPoint + `?where={"page":"${pageName}","section":"${sectionName}","deletedAt":null}`
            )
            .map(response => response[0]);
    }

    /*  getBySectionName(sectionName: any): Observable<any> {
        return this.http
            .get(
                this.EndPoint + `?where={"section":"${sectionName}","deletedAt":null}`
            )
            .map(response => response);
      }
      */
    getBySubSectionName(pageName: String, sectionName: String, subSectionName: any): Observable<any> {
        return this.http.get(this.EndPoint + `?where={"page":"${pageName}","section":"${sectionName}","sub_section":"${subSectionName}","deletedAt":null}`)
            .map(response => response);
    }

    getRecentPost(pageName: String, limit: number, column: String, orderby: String): Observable<any> {
        return this.http.get(this.EndPoint + `?where={"page":"${pageName}","deletedAt":null}&limit=${limit}&sort=${column}%20${orderby}`)
            .map(response => response);
    }
}
