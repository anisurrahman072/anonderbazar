import { Component, OnInit } from '@angular/core';
import {LotteryService} from "../../../../services/lottery.service";

@Component({
  selector: 'app-lottery',
  templateUrl: './lottery.component.html',
  styleUrls: ['./lottery.component.scss']
})
export class LotteryComponent implements OnInit {
    winners: any;

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
        });
  }
}
