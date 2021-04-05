import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ProductDetailsRoutingModule} from './product-details-routing.module';
import {ProductDetailsComponent} from "./product-details/product-details.component";
import {FormsModule} from "@angular/forms";
import {SharedModule} from "../shared/shared.module";
import {MaterialModule} from "../../core/material.module";
import {CarouselModule, TooltipModule} from "ngx-bootstrap";
import {CouponBannersComponent} from "./product-details/coupon-banners/coupon-banners.component";
import {HomeModule} from "../home/home.module";

@NgModule({
    imports: [
        CommonModule,
        ProductDetailsRoutingModule,
        FormsModule,
        SharedModule,
        MaterialModule,
        TooltipModule.forRoot(),
        HomeModule,
        CarouselModule
    ],
    declarations: [ProductDetailsComponent, CouponBannersComponent]
})
export class ProductDetailsModule {
}
