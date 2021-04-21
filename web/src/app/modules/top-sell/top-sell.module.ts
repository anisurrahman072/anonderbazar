import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TopSellComponent } from './top-sell/top-sell.component';
import { TopSellRoutingModule } from './top-sell-routing.module';
import {SharedModule} from './../shared/shared.module';

@NgModule({
  imports: [
    CommonModule, TopSellRoutingModule, SharedModule
  ],
  declarations: [TopSellComponent]
})
export class TopSellModule { }
