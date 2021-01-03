import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { EventPriceListComponent } from './event-price-list/event-price-list.component';
import {EventPriceRoutingModule} from './event-price-routing.module';
import {UiModule} from "../../shared/ui.module";



@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    EventPriceRoutingModule,
    UiModule
  ],
  declarations: [EventPriceListComponent]
})
export class EventPriceModule { }
