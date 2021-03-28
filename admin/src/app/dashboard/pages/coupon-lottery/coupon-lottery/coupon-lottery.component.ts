import {Component, OnDestroy, OnInit} from "@angular/core";
import {CouponLotteryService} from "../../../../services/coupon-lottery.service";
import * as ___ from 'lodash';

@Component({
    selector: 'coupon-lottery',
    templateUrl: './coupon-lottery.component.html',
    styleUrls: ['./coupon-lottery.component.css']
})
export class CouponLotteryComponent implements OnInit, OnDestroy {
    selectedLotteryId: number;
    _isSpinning: boolean = false;
    lotteryTotal: number = 0;
    lotteryList: any = [];
    lotteryLimit: number = 10;
    lotteryPage: number = 1;

    isWinnerModalVisible: boolean = false;

    winnerList: any = [];
    winnerPage: number = 1;
    winnerTotal: number = 0;

    constructor(private couponLotteryService: CouponLotteryService) {

    }

    ngOnInit() {

        this.getLotteryData();

    }

    ngOnDestroy() {
    }

    getLotteryData() {
        this._isSpinning = true;
        this.couponLotteryService.getAllLotteries(this.lotteryPage, this.lotteryLimit)
            .subscribe((result) => {
                console.log('result', result);
                this.lotteryList = result;
                this.lotteryTotal = result.length;
                this._isSpinning = false;
            }, err => {
                console.log(err);
                this._isSpinning = false;
            });
    }

    getWinnerList() {
        this._isSpinning = true;
        this.couponLotteryService.getAllLotteryWinnersByLottery(this.selectedLotteryId)
            .subscribe((result) => {
                this.winnerList = this.couponCodeGenerator(result.data);
                this.winnerTotal = result.total;
                this._isSpinning = false;
            }, err => {
                console.log(err);
                this._isSpinning = false;
            });
    }

    handleOk = e => {
        this.isWinnerModalVisible = false;
    };

    handleCancel = e => {
        this.isWinnerModalVisible = false;
    };

    couponCodeGenerator(data) {
        return data.map((item) => {
            return {
                ...item,
                'coupon_code': '1' + ___.padStart(item.coupon_code, 6, '0')
            }
        }).join(',');
    }

    openWinnerModal(id) {
        this.isWinnerModalVisible = true;
        this.selectedLotteryId = id;
        this.getWinnerList();
    }
}
