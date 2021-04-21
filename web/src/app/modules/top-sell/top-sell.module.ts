import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TopSellComponent } from './top-sell/top-sell.component';
import { TopSellRoutingModule } from './top-sell-routing.module';
import {SharedModule} from './../shared/shared.module';
import {NgxPaginationModule} from "ngx-pagination";

@NgModule({
  imports: [
    CommonModule, TopSellRoutingModule, SharedModule, NgxPaginationModule,
  ],
  declarations: [TopSellComponent]
})
export class TopSellModule { }
