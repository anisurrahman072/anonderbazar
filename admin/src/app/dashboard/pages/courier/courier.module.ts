import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {CourierRoutingModule} from './courier-routing.module';
import {UiModule} from "../../shared/ui.module";
import { CourierListComponent } from './courier-list/courier-list.component';
import { CourierOrderListComponent } from './courier-order-list/courier-order-list.component';
import { CourierPriceListComponent } from './courier-price-list/courier-price-list.component';
import { CourierComponent } from './courier/courier.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    CourierRoutingModule,
    UiModule
  ],
  declarations: [CourierListComponent, CourierPriceListComponent, CourierComponent,CourierOrderListComponent]
})
export class CourierModule { }
