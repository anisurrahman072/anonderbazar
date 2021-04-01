import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CouponLotteryRoutingModule} from './coupon-lottery-routing.module';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {ModalModule} from "ngx-bootstrap/modal";
import {MaterialModule} from "../../core/material.module";
import {SharedModule} from "../shared/shared.module";
import {LotteryComponent} from "./lottery/lottery.component";
import {NgxPaginationModule} from "ngx-pagination";
import {NgAisModule} from "angular-instantsearch";
import {TabsModule} from "ngx-bootstrap";

@NgModule({
    imports: [
        CommonModule,
        CouponLotteryRoutingModule,
        FormsModule,
        ReactiveFormsModule,
        ModalModule.forRoot(),
        MaterialModule,
        TabsModule.forRoot(),
        SharedModule,
        NgxPaginationModule,
        NgAisModule,
    ],
    declarations: [LotteryComponent]
})
export class CouponLotteryModule {
}
