import {Injectable} from "@angular/core";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {AppSettings} from "../config/app.config";

@Injectable()
export class BkashService {

    private EndPoint = `${AppSettings.API_ENDPOINT}/bkash-payment`;

    constructor(private http: HttpClient) {
    }

    generateGrandToken() {
        return this.http.get(this.EndPoint + '/token-grant');
    }

    createAgreementRequest(bkashToken: string) {
        const headers = new HttpHeaders().set('id_token', bkashToken);
        return this.http.get(this.EndPoint + '/create-agreement', {headers: headers});
    }
}
