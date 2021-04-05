import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {LotteryComponent} from "./lottery/lottery.component";

const routes: Routes = [
  {
    path: "",
    component: LotteryComponent,
    data: {
      title: "Lottery"
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CouponLotteryRoutingModule { }
