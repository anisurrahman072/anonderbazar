import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CanceledOrderComponent } from './canceled-order/canceled-order.component';
import {CanceledOrderRoutingModule} from "./canceled-order-routing.module";
import {UiModule} from "../../shared/ui.module";
import {RefundStatusPipe} from "../../../pipes/refund-status";

@NgModule({
    imports: [
        CommonModule, CanceledOrderRoutingModule, UiModule
    ],
    declarations: [CanceledOrderComponent, RefundStatusPipe]
})
export class CanceledOrderModule { }
