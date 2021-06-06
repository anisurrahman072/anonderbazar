import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {FileUploadModule} from 'ng2-file-upload';
import {OrderComponent} from './order/Order.component';
import {OrderReadComponent} from './order-read/Order-read.component';
import {OrderRoutingModule} from './order-routing.module';
import {UiModule} from "../../shared/ui.module";
import {ProductModule} from "../product/product.module";

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        FileUploadModule,
        ReactiveFormsModule,
        OrderRoutingModule,
        UiModule,
        ProductModule
    ],
    declarations: [
        OrderComponent,
        OrderReadComponent,
    ]
})
export class OrderModule {
}
