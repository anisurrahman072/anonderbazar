import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InvestorComponent } from './investor/investor.component';
import {InvestorRoutingModule} from './investor-routing.module';
import {NgZorroAntdModule} from "ng-zorro-antd";
import {UiModule} from "../../shared/ui.module";

@NgModule({
  imports: [
    CommonModule, InvestorRoutingModule, NgZorroAntdModule, UiModule
  ],
  declarations: [InvestorComponent]
})
export class InvestorModule { }
