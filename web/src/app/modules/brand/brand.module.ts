import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrandProductComponent } from './brand-product/brand-product.component';
import { BrandRoutingModule } from './brand-routing.module';
import {SharedModule} from "../shared/shared.module";

@NgModule({
  imports: [
    CommonModule,
    BrandRoutingModule,
    SharedModule,
  ],
  declarations: [BrandProductComponent]
})
export class BrandModule { }
