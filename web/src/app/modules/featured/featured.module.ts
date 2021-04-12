import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FeaturedProductComponent } from './featured-product/featured-product.component';
import {FeaturedRoutingModule} from './featured-routing.module';
import {HomeModule} from '../home/home.module'

@NgModule({
  imports: [
    CommonModule, FeaturedRoutingModule, HomeModule
  ],
  declarations: [FeaturedProductComponent]
})
export class FeaturedModule { }
