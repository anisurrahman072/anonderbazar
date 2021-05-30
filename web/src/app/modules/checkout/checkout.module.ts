import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CheckoutRoutingModule} from './checkout-routing.module';
import {CheckoutPageComponent} from "./checkout-page/checkout-page.component";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {SharedModule} from "../shared/shared.module";
import {ModalModule} from "ngx-bootstrap/modal";
import {MaterialModule} from "../../core/material.module";

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        CheckoutRoutingModule,
        ModalModule.forRoot(),
        MaterialModule,
        SharedModule,
    ],
    declarations: [CheckoutPageComponent],
})
export class CheckoutModule {
}
