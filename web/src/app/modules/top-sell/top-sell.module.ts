import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TopSellComponent } from './top-sell/top-sell.component';
import { TopSellRoutingModule } from './top-sell-routing.module';

@NgModule({
  imports: [
    CommonModule, TopSellRoutingModule
  ],
  declarations: [TopSellComponent]
})
export class TopSellModule { }
