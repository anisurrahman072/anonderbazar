
import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';


import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {SuborderComponent} from './suborder/Suborder.component';
import {SuborderReadComponent} from './suborder-read/Suborder-read.component';
import {SuborderRoutingModule} from './suborder-routing.module';
import {SuborderInvoiceComponent} from "./suborder-invoice/Suborder-invoice.component";
import {SuborderInvoice2Component} from "./suborder-invoice-2/Suborder-invoice-2.component";
import {SuborderTypePipe} from "../../../pipes/suborder-status";
import {UiModule} from "../../shared/ui.module";


@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule,
        SuborderRoutingModule,
        UiModule
    ],
    declarations: [
        SuborderComponent,
        SuborderReadComponent,
        SuborderInvoiceComponent,
        SuborderInvoice2Component,
        SuborderTypePipe
    ]
})
export class SuborderModule {
}
