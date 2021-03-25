import { Component, OnInit } from '@angular/core';
import {LotteryService} from "../../../../services/lottery.service";
import {trigger, state, style, animate, transition, stagger} from '@angular/animations';
import {NotificationsService} from "angular2-notifications";

@Component({
    selector: 'app-lottery',
    templateUrl: './lottery.component.html',
    styleUrls: ['./lottery.component.scss'],
    animations: [
        trigger(
            'myAnimation',
            [
                transition(
                    ':leave', [
                        style({ transform: 'translateY(0)', opacity: 1 }),
                        animate('500ms', style({ transform: 'translateY(-50%)', 'opacity': 0 }))
                    ]
                ),
                transition(
                    ':enter', [
                        style({ transform: 'translateY(50%)', opacity: 0 }),
                        animate('1000ms', style({ transform: 'translateY(0)', 'opacity': 1 }))
                    ]
                )
            ]
        )
    ]
})
export class LotteryComponent implements OnInit {
    data = null;

    couponShow: boolean = false;
    winnerListShow: boolean = false;
    notStarted: boolean = false;
    completed: boolean = false;
    suggestion: boolean = false;

    currentWinner: any;
    winnerShow: boolean = false;

    p;
    digit1 = null;
    digit2 = null;
    digit3 = null;
    digit4 = null;
    digit5 = null;
    digit6 = null;
    digit7 = null;
    animateDigit1 = true;
    animateDigit2 = true;
    animateDigit3 = true;
    animateDigit4 = true;
    animateDigit5 = true;
    animateDigit6 = true;
    animateDigit7 = true;
    delay = 0;

    constructor(private lotteryService: LotteryService,
                private _notify: NotificationsService) { }

    ngOnInit() {
        this.lotteryService.getAllWinners()
            .subscribe(data => {
                this.data = data;
                if(data.code === 'notStarted'){
                    this.notStarted = true;
                    this._notify.info(`${data.message}`);
                }
                else if(data.code === 'completed'){
                    this.couponShow = false;
                    this.notStarted = false;
                    this.completed = true;
                    this._notify.info(`${data.message}`);
                }
                else{
                    this.notStarted = false;
                    this.couponShow = true;
                    console.log('first', this.data);
                    this.setCurrentCoupon();
                }
            });
    }

    setCurrentCoupon(){
        let len = this.data.data.length;
        this.separateCoupon(this.data.data[len-1].product_purchased_coupon_code_id);
    }

    separateCoupon(coupon_id: any) {
        const couponArray = String(coupon_id).split('');
        if(couponArray.length < 7){
            let len = 7 - couponArray.length;
            for(let i = 0; i < len; i++){
                couponArray.unshift('0');
            }
        }
        this.animateDigit1 = false;
        this.animateDigit2 = false;
        this.animateDigit3 = false;
        this.animateDigit4 = false;
        this.animateDigit5 = false;
        this.animateDigit6 = false;
        this.animateDigit7 = false;

        setTimeout(() => {
            this.animateDigit1 = true;
            this.animateDigit2 = true;
            this.animateDigit3 = true;
            this.animateDigit4 = true;
            this.animateDigit5 = true;
            this.animateDigit6 = true;
            this.animateDigit7 = true;

            let newArr = [parseInt(couponArray[0]), parseInt(couponArray[1]), parseInt(couponArray[2]),
                parseInt(couponArray[3]), parseInt(couponArray[4]), parseInt(couponArray[5]), parseInt(couponArray[6])];
            for(let i = 1; i <= 10; i++){
                setTimeout(() => {
                    if(this.digit1 !== newArr[0]){
                        if(this.digit1 === 9){
                            this.digit1 = 0;
                        }
                        else {
                            ++this.digit1;
                        }
                    }

                    if(this.digit2 !== newArr[1]){
                        if(this.digit2 === 9){
                            this.digit2 = 0;
                        }
                        else {
                            ++this.digit2;
                        }
                    }

                    if(this.digit3 !== newArr[2]){
                        if(this.digit3 === 9){
                            this.digit3 = 0;
                        }
                        else {
                            ++this.digit3;
                        }
                    }

                    if(this.digit4 !== newArr[3]){
                        if(this.digit4 === 9){
                            this.digit4 = 0;
                        }
                        else {
                            ++this.digit4;
                        }
                    }

                    if(this.digit5 !== newArr[4]){
                        if(this.digit5 === 9){
                            this.digit5 = 0;
                        }
                        else {
                            ++this.digit5;
                        }
                    }

                    if(this.digit6 !== newArr[5]){
                        if(this.digit6 === 9){
                            this.digit6 = 0;
                        }
                        else {
                            ++this.digit6;
                        }
                    }

                    if(this.digit7 !== newArr[6]){
                        if(this.digit7 === 9){
                            this.digit7 = 0;
                        }
                        else {
                            ++this.digit7;
                        }
                    }
                }, 100*i);
            }
        }, this.delay);
        this.delay = 500;
    }

    makeDraw() {
        this.suggestion = false;
        if(this.winnerListShow || this.notStarted){
            console.log('annn', this.data);
            if(this.data.code === 'completed'){
                this.couponShow = false;
                this.winnerListShow = false;
                this.completed = true;
                this.notStarted = false;
                this._notify.info(`${this.data.message}`);
            }
            else{
                /** running */
                this.winnerListShow = false;
                this.notStarted = false;
                this.couponShow = true;
                if(this.data.data && this.data.data.length > 0){
                    this.delay = 0;
                    this.setCurrentCoupon();
                }
                else{
                    this.suggestion = true;
                }
            }
        }
        else if(this.couponShow) {
            this.lotteryService.makeDraw()
                .subscribe((couponData) => {
                    if(couponData.success){
                        this._notify.success(`${couponData.message}`);
                        this.lotteryService.getAllWinners()
                            .subscribe((data) => {
                                this.data = data;
                                this.winnerShow = false;
                                this.notStarted = false;
                                this.winnerListShow = false;
                                this.couponShow = true;

                                this.separateCoupon(couponData.data);
                                setTimeout(() => {
                                    let len = data.data.length;
                                    this.currentWinner = data.data[len-1];
                                    this.winnerShow = true;
                                    this.notStarted = false;
                                    this.couponShow = false;
                                    this.winnerListShow = false;
                                    this.completed = false;
                                }, 4000);
                                setTimeout(() => {
                                    this.winnerShow = false;
                                    this.couponShow = true;
                                }, 5000);
                            })
                    }
                    else if(couponData.code === 'completed') {
                        this.notStarted = false;
                        this.couponShow = false;
                        this.completed = true;
                        this._notify.info(`${couponData.message}`);
                    }
                    else {
                        this._notify.info(`${couponData.message}`);
                    }
                })
        }
    }

    getWinners() {
        this.lotteryService.getAllWinners()
            .subscribe(data => {
                if(data.code === 'notStarted'){
                    this.couponShow = false;
                    this.completed = false;
                    this.winnerListShow = false;
                    this.notStarted = true;
                }
                else{
                    this.notStarted = false;
                    this.couponShow = false;
                    this.completed = false;
                    this.winnerListShow = true;
                    this.data = data;
                }
            });
    }

    onPageChange(event) {
        window.scroll(0, 0);
        this.p = event
    }
}
