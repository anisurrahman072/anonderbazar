import {Injectable} from '@angular/core';
import 'rxjs/add/operator/map';
import {Observable} from 'rxjs/Observable';
import {HttpClient} from '@angular/common/http';
import {AppSettings} from '../config/app.config';

@Injectable()
export class CmsService {

    private EndPoint = `${AppSettings.API_ENDPOINT}/cms`;
    private EndPoint2 = `${AppSettings.API_ENDPOINT}/cms2`;

    constructor(private http: HttpClient) {
    }

    getByIds(ids: number[]): Observable<any> {
        const url = `${this.EndPoint}/byIds?ids=${JSON.stringify(ids)}&populate=false`;
        return this.http.get(url);
    }

    getById(id): Observable<any> {
        return this.http.get(this.EndPoint + '/' + id + '?&populate=false');
    }

    insert(data): Observable<any> {
        return this.http.post(this.EndPoint, data);
    }

    update(id: number, data: any) {
        return this.http
            .put(`${this.EndPoint}/${id}`, data);
    }

    getByPageNSection(){
        return this.http
            .get(`${this.EndPoint2}/by-page-section`);
    }

    getBySectionName(pageName: String, sectionName: String): Observable<any> {
        return this.http
            .get(
                this.EndPoint + `?where={"page":"${pageName}","section":"${sectionName}","deletedAt":null}&populate=false`
            );
    }

    getBySubSectionName(pageName: String, sectionName: String, subSectionName: any, frontend_position?:boolean): Observable<any> {

        let _where = `?where={"page":"${pageName}","section":"${sectionName}","sub_section":"${subSectionName}","deletedAt":null}&populate=false`
        if(frontend_position){
            _where += `&sort=frontend_position%20ASC`
        }

        return this.http.get(this.EndPoint + _where);
    }

}
