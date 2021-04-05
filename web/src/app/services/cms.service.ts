import {Injectable} from '@angular/core';
import 'rxjs/add/operator/map';
import {Observable} from 'rxjs/Observable';
import {AuthService} from './auth.service';
import {HttpClient} from '@angular/common/http';
import {AppSettings} from '../config/app.config';

@Injectable()
export class CmsService {
    private EndPoint = `${AppSettings.API_ENDPOINT}/cms`;

    constructor(private http: HttpClient) {
    }

    getByIds(ids: number[]): Observable<any> {
        const url = `${this.EndPoint}/byIds?ids=${JSON.stringify(ids)}&populate=false`;
        return this.http.get(url).map(response => response);
    }

    getById(id): Observable<any> {
        return this.http.get(this.EndPoint + '/' + id + '?&populate=false').map(response => response);
    }

    insert(data): Observable<any> {
        return this.http.post(this.EndPoint, data).map(response => response);
    }


    update(id: number, data: any) {
        return this.http
            .put(`${this.EndPoint}/${id}`, data)
            .map(response => response);
    }

    getBySectionName(pageName: String, sectionName: String): Observable<any> {
        console.log(this.EndPoint + `?where={"page":"${pageName}","section":"${sectionName}","deletedAt":null}&populate=false`);
        return this.http
            .get(
                this.EndPoint + `?where={"page":"${pageName}","section":"${sectionName}","deletedAt":null}&populate=false`
            )
            .map(response => response[0]);
    }

    getBySubSectionName(pageName: String, sectionName: String, subSectionName: any): Observable<any> {

        return this.http.get(this.EndPoint + `?where={"page":"${pageName}","section":"${sectionName}","sub_section":"${subSectionName}","deletedAt":null}&populate=false`)
            .map(response => response);
    }

    getRecentPost(pageName: String, limit: number, column: String, orderby: String): Observable<any> {

        return this.http.get(this.EndPoint + `?where={"page":"${pageName}","deletedAt":null}&limit=${limit}&sort=${column}%20${orderby}&populate=false`)
            .map(response => response);
    }
}
