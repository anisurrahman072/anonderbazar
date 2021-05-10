import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MissingOrdersComponent } from './missing-orders/missing-orders.component';
import {MissingOrdersRoutingModule} from "./missing-orders-routing.module";
import {NgZorroAntdModule} from "ng-zorro-antd";
import {UiModule} from "../../shared/ui.module";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";

@NgModule({
  imports: [
    CommonModule, MissingOrdersRoutingModule, NgZorroAntdModule, UiModule,
    FormsModule, ReactiveFormsModule,
  ],
  declarations: [MissingOrdersComponent]
})
export class MissingOrdersModule { }
