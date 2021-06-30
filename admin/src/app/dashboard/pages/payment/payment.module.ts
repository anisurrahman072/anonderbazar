import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {NgZorroAntdModule} from 'ng-zorro-antd';

import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {FileUploadModule} from 'ng2-file-upload';
import {ImageUploadModule} from 'angular2-image-upload';
import {PaymentComponent} from "./payment/payment.component";
import {PaymentRoutingModule} from "./payment-routing.module";
import {PaymentReadComponent} from "./payment-read/payment-read.component";
import {PaymentCreateComponent} from "./payment-create/payment-create.component";
import {PaymentEditComponent} from "./payment-edit/payment-edit.component";
import {UiModule} from "../../shared/ui.module";
import {OrderModule} from "../order/order.module";

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        FileUploadModule,
        ReactiveFormsModule,
        PaymentRoutingModule,
        UiModule,
        OrderModule
    ],
    declarations: [
        PaymentComponent,
        PaymentReadComponent,
        PaymentCreateComponent,
        PaymentEditComponent
    ]
})
export class PaymentModule {
}
