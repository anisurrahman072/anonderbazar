import { Component, OnInit } from '@angular/core';
import {LotteryService} from "../../../../services/lottery.service";
import {trigger, state, style, animate, transition} from '@angular/animations';
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
                    ':enter', [
                        style({ transform: 'translateY(100%)', opacity: 0 }),
                        animate('2000ms', style({ transform: 'translateY(0)', 'opacity': 1 }))
                    ]
                ),
                transition(
                    ':leave', [
                        style({ transform: 'translateY(0%)', opacity: 1 }),
                        animate('1000ms', style({ transform: 'translateY(-100%)', 'opacity': 0 }))
                    ]
                )
            ]
        )
    ]
})
export class LotteryComponent implements OnInit {
    winners: any;
    currentCoupon: any;
    couponShow: boolean = false;
    winnerListShow: boolean = false;
    notStarted: boolean = false;
    completed: boolean = false;
    suggestion: boolean = false;
    currentWinner: any;
    winnerShow: boolean = false;

  constructor(private lotteryService: LotteryService,
              private _notify: NotificationsService) { }

  ngOnInit() {
      /** completed */
      this.lotteryService.getAllWinners()
          .subscribe(data => {
             if(data.code === 'notStarted'){
                 this.notStarted = true;
             }
             else if(data.code === 'completed'){
                 this.couponShow = false;
                 this.notStarted = false;
                 this.completed = true;
             }
             else{
                 this.notStarted = false;
                 this.couponShow = true;
                 this.winners = data.data;
                 this.setCurrentCoupon();
             }
          });
  }

  setCurrentCoupon(){
      /** completed */
      if(this.winners.length === 0 ){
          this._notify.error(`Winner List is empty!`);
          this.currentCoupon = this.separateCoupon(0);
      }
      else{
          /** Users will see the the last winner coupon ID */
          let len = this.winners.length;
          this._notify.success(`Last winner coupon is: ${this.winners[len-1].product_purchased_coupon_code_id}`);
          this.currentCoupon = this.separateCoupon(this.winners[len-1].product_purchased_coupon_code_id);
      }
  }

  separateCoupon(coupon_id: any) {
      /** completed */
    const couponArray = String(coupon_id).split('');
    if(couponArray.length < 5){
        let len = 5 - couponArray.length;
        for(let i = 0; i < len; i++){
            couponArray.unshift('0');
        }
    }
    return couponArray;
  }

  makeDraw() {
      this.suggestion = false;
      if(this.winnerListShow || this.notStarted){
          this.lotteryService.getAllWinners()
              .subscribe(data => {
                  if(data.code === 'completed'){
                      this.couponShow = false;
                      this.winnerListShow = false;
                      this.completed = true;
                      this.notStarted = false;
                  }
                  else{
                      this.winnerListShow = false;
                      this.notStarted = false;
                      this.couponShow = true;
                      if(data.data && data.data.length > 0){
                          this.winners = data.data;
                          this.setCurrentCoupon();
                      }
                      else{
                          this.suggestion = true;
                      }
                  }
              });
      }
      /** Jodi touhid vai bolen je "Lottery not stared" theke direct lottery draw hoe jabe  thaole thik uporer jei line a this.suggestion = true likhco sekhane makeDraw() ar API call korbe */
      else if(this.couponShow) {
          this.lotteryService.makeDraw()
              .subscribe((couponData) => {
                  if(couponData.success){
                      this.lotteryService.getAllWinners()
                          .subscribe((data) => {
                              this.winnerShow = false;
                              this.notStarted = false;
                              this.winnerListShow = false;
                              this.couponShow = true;
                              this.currentCoupon = null;
                              this.currentCoupon = this.separateCoupon(couponData.data);
                              setTimeout(() => {
                                  let len = data.data.length;
                                  this.currentWinner = data.data[len-1];
                                  this.winnerShow = true;
                                  this.notStarted = false;
                                  this.couponShow = false;
                                  this.winnerListShow = false;
                                  this.completed = false;
                              }, 3000);
                              setTimeout(() => {
                                  this.winnerShow = false;
                                  this.couponShow = true;
                              }, 7000);
                          })
                  }
                  else if(couponData.code === 'completed') {
                      this.notStarted = false;
                      this.couponShow = false;
                      this.completed = true;
                  }
                  else {
                      this._notify.error(`${couponData.message}`);
                  }
              })
      }
  }

  getWinners() {
      /** completed */
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
                  this.winners = data.data;
              }
          });
  }
}
