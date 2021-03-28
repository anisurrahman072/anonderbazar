import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ReactiveFormsModule} from '@angular/forms';
import {UiModule} from "../../shared/ui.module";
import {CouponLotteryRoutingModule} from "./coupon-lottery-routing.module";
import {CouponLotteryComponent} from "./coupon-lottery/coupon-lottery.component";
import {CouponLotteryService} from "../../../services/coupon-lottery.service";

@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule,
        CouponLotteryRoutingModule,
        UiModule
    ],
    declarations: [
        CouponLotteryComponent,
    ],
    providers: [
        CouponLotteryService,
    ]
})
export class CouponLotteryModule {
}
