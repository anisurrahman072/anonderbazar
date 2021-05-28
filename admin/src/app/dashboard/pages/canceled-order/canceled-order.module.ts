import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CanceledOrderComponent } from './canceled-order/canceled-order.component';
import {CanceledOrderRoutingModule} from "./canceled-order-routing.module";

@NgModule({
  imports: [
    CommonModule, CanceledOrderRoutingModule
  ],
  declarations: [CanceledOrderComponent]
})
export class CanceledOrderModule { }
