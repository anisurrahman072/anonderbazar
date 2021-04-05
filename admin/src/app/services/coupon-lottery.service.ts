import {Injectable} from "@angular/core";
import {environment} from "../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class CouponLotteryService {
    private EndPoint1 = `${environment.API_ENDPOINT}/couponLottery`;
    private EndPoint2 = `${environment.API_ENDPOINT}/couponLotteryDraw`;

    constructor(private http: HttpClient) {
    }

    getAllLotteries(page: number, limit: number): Observable<any> {
        let skip = (page - 1) * limit;
        return this.http.get(`${this.EndPoint1}?populate=product_id&limit=${limit}&skip=${skip}`);
    }

    getAllLotteryWinnersByLottery(lotteryId): Observable<any> {
        return this.http.get(`${this.EndPoint2}/byLotteryId/${lotteryId}`);
    }
}
