import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CategoryNsearchRoutingModule } from './category-nsearch-routing.module';
import {CategoryPageComponent} from "./category-page/category-page.component";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {IonRangeSliderModule} from "ng2-ion-range-slider";
import {SharedModule} from "../shared/shared.module";
import {NgxPaginationModule} from "ngx-pagination";
import {ModalModule} from "ngx-bootstrap/modal";
import {MaterialModule} from "../../core/material.module";
import {Ng5SliderModule} from "ng5-slider";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonRangeSliderModule,
    SharedModule,
    NgxPaginationModule,
    ModalModule.forRoot(),
    CategoryNsearchRoutingModule,
    MaterialModule,
    Ng5SliderModule,
  ],
  declarations: [CategoryPageComponent]
})
export class CategoryNsearchModule { }
