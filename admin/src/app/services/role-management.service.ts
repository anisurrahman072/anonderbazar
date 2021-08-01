import {Injectable} from '@angular/core';
import 'rxjs/add/operator/map';
import {Observable} from 'rxjs/Observable';
import {environment} from '../../environments/environment';
import {HttpClient} from '@angular/common/http';

@Injectable({
    providedIn: 'root'
})
export class RoleManagementService {
    private EndPoint = `${environment.API_ENDPOINT}/role-management`;

    constructor(private http: HttpClient) {
    }

    getAllGroups(groupsLimit = 10, groupsPage = 1): Observable<any> {
        return this.http
            .get(`${this.EndPoint}/getAllGroups?limit=${groupsLimit}&page=${groupsPage}`)
            .map(response => response);
    }
}
