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

    /**method called to delete a group*/
    deleteGroup(id): Observable<any> {
        return this.http.delete(`${this.EndPoint}/deleteGroup?id=${id}`)
            .map(response => response);
    }

    /** Method called to get all the available permissions to create a group */
    getAllGroupsPermissions(): Observable<any> {
        return this.http.get(`${this.EndPoint}/getAllGroupsPermissions`);
    }

    /** Method called to create a new Group */
    groupInsert(data): Observable<any> {
        return this.http.post(`${this.EndPoint}/groupInsert`, data);
    }
}
