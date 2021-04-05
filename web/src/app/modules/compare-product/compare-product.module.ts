import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CompareProductRoutingModule} from './compare-product-routing.module';
import {ComparePageComponent} from "./compare-page/compare-page.component";
import {MaterialModule} from "../../core/material.module";
import {ModalModule} from "ngx-bootstrap/modal";
import {SharedModule} from "../shared/shared.module";

@NgModule({
    imports: [
        CommonModule,
        CompareProductRoutingModule,
        MaterialModule,
        ModalModule.forRoot(),
        SharedModule
    ],
    declarations: [ComparePageComponent]
})
export class CompareProductModule {
}
