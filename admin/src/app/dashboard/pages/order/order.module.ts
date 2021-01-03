import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {NgZorroAntdModule} from 'ng-zorro-antd';

import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {FileUploadModule} from 'ng2-file-upload';
import {ImageUploadModule} from 'angular2-image-upload';
import {OrderComponent} from './order/Order.component';
import {OrderReadComponent} from './order-read/Order-read.component';
import {OrderRoutingModule} from './order-routing.module';
import {UiModule} from "../../shared/ui.module";


@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        FileUploadModule,
        ReactiveFormsModule,
        OrderRoutingModule,
        UiModule
    ],
    declarations: [
        OrderComponent,
        OrderReadComponent,
    ]
})
export class OrderModule {
}
