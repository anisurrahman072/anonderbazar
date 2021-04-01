import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CategoryListRoutingModule } from './category-list-routing.module';
import {CategoryListComponent} from "./category-list/category-list.component";
import {SharedModule} from "../shared/shared.module";
import {ModalModule} from "ngx-bootstrap/modal";
import {MaterialModule} from "../../core/material.module";
import {NgxPaginationModule} from "ngx-pagination";

@NgModule({
  imports: [
    CommonModule,
    CategoryListRoutingModule,
    SharedModule,
    ModalModule.forRoot(),
    MaterialModule,
    NgxPaginationModule,
  ],
  declarations: [CategoryListComponent]
})
export class CategoryListModule { }
