import { Component, OnInit } from '@angular/core';
import {LotteryService} from "../../../../services/lottery.service";
import {trigger, state, style, animate, transition} from '@angular/animations';

@Component({
  selector: 'app-lottery',
  templateUrl: './lottery.component.html',
  styleUrls: ['./lottery.component.scss'],
    animations: [
        trigger('couponChange', [
            state('in', style({
                color: 'blue'
            })),
            state('out', style({
                color: 'yellow'
            })),
            transition('in => out', [
                animate('1s')
            ]),
            transition('out => in', [
                animate('1s')
            ]),
        ]),
    ],
})
export class LotteryComponent implements OnInit {
    winners: any;
    currentCoupon: any;
    couponShow: boolean = true;
    winnerListShow: boolean = false;

  constructor(private lotteryService: LotteryService) { }

  ngOnInit() {
      this.showWinnerList();
  }

  setCurrentCoupon(){
      if(this.winners.winners.length === 0){
          // No lotteries were drawn
          this.currentCoupon = this.seperateCoupon(0);
      }
      else{
          if(this.winners.success){
              // Users will see the the last winner coupon ID
              let len = this.winners.winners.length;
              this.currentCoupon = this.seperateCoupon(this.winners.winners[len-1].coupon_id);
          }
          else{
              // All lotteries are already distributed
              this.currentCoupon = this.seperateCoupon(0);
          }
      }
  }

  seperateCoupon(coupon_id: any) {
    const couponArray = String(coupon_id).split('');
    if(couponArray.length < 5){
        let len = 5 - couponArray.length;
        for(let i = 0; i < len; i++){
            couponArray.unshift('0');
        }
    }
    return couponArray;
  }

  showWinnerList() {
    this.lotteryService.getAll()
        .subscribe((winners) => {
            this.winners = winners;
            this.setCurrentCoupon();
        });
  }

  makeDraw() {
      if(this.couponShow){
          this.lotteryService.takeDraw()
              .subscribe((winners) => {
                  this.winners = winners;
                  this.setCurrentCoupon();
              });
      }
      else {
          this.winnerListShow = false;
          this.couponShow = true;
      }
  }

  getWinners() {
      this.showWinnerList();
      this.couponShow = false;
      this.winnerListShow = true;
  }
}
