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

    cancelAgreement(bKashToken: string, agreementId: string) {
        return this.http.get(this.EndPoint + '/cancel-agreement?id_token=' + bKashToken + '&agreement_id=' + agreementId);
    }

    getAuthUserWallets() {
        return this.http.get(this.EndPoint + '/customer-wallets');
    }
}
