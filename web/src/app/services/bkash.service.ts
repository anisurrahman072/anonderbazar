import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {AppSettings} from "../config/app.config";

@Injectable()
export class BkashService {

    private EndPoint = `${AppSettings.API_ENDPOINT}/bkash-payment`;

    constructor(private http: HttpClient) {
    }

    generateGrandToken() {
        return this.http.get(this.EndPoint + '/token-grant');
    }

    createAgreementRequest(bkashToken: string, bKashWalletNoToAdd: string) {
        return this.http.get(this.EndPoint + '/create-agreement?id_token=' + bkashToken + '&wallet_no=' + bKashWalletNoToAdd);
    }
}
