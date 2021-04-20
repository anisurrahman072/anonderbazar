import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrandProductComponent } from './brand-product/brand-product.component';
import { BrandRoutingModule } from './brand-routing.module';
import {SharedModule} from "../shared/shared.module";
import { BrandComponent } from './brand/brand.component';

@NgModule({
  imports: [
    CommonModule,
    BrandRoutingModule,
    SharedModule,
  ],
  declarations: [BrandProductComponent, BrandComponent]
})
export class BrandModule { }
