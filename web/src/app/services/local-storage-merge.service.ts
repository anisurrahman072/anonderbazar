import {Injectable} from '@angular/core';
import 'rxjs/add/operator/map';
import {HttpClient} from "@angular/common/http";
import {environment} from "../../environments/environment";
import {Observable} from 'rxjs/Observable';
import {AppSettings} from '../config/app.config';

@Injectable()
export class LocalStorageMergeService {
    constructor(private http: HttpClient) {
    }

    mergeLocal(payLoad: any): Observable<any> {

        return this.http.post(AppSettings.API_ENDPOINT + '/Cart/merge', payLoad)
            .map((response) => response); 
    }
}


