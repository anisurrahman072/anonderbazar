import { Component, OnInit } from '@angular/core';
import {LotteryService} from "../../../../services/lottery.service";

@Component({
  selector: 'app-lottery',
  templateUrl: './lottery.component.html',
  styleUrls: ['./lottery.component.scss']
})
export class LotteryComponent implements OnInit {
    winners: any;
    currentCoupon: any;

  constructor(private lotteryService: LotteryService) { }

  ngOnInit() {
    this.lotteryService.getAll()
        .subscribe((winners) => {
          this.winners = winners.winners;
        })

  }

  takeDraw() {
    this.lotteryService.takeDraw()
        .subscribe((winners) => {
          this.winners = winners.winners;
            if(winners.prize.coupon_id){
                this.currentCoupon = String(winners.prize.coupon_id).split('');
                if(this.currentCoupon.length < 5){
                    let len = 5 - this.currentCoupon.length;
                    for(let i = 0; i < len; i++){
                        this.currentCoupon.unshift('0');
                    }
                }
            }
        });
  }
}
