import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {FileUploadModule} from 'ng2-file-upload';
import {OrderComponent} from './order/Order.component';
import {OrderReadComponent} from './order-read/Order-read.component';
import {OrderRoutingModule} from './order-routing.module';
import {UiModule} from "../../shared/ui.module";
import {MatDatepickerModule} from "@angular/material/datepicker";
import {MatNativeDateModule} from "@angular/material/core";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        FileUploadModule,
        ReactiveFormsModule,
        OrderRoutingModule,
        UiModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatFormFieldModule,
        MatInputModule
    ],
    declarations: [
        OrderComponent,
        OrderReadComponent,
    ]
})
export class OrderModule {
}
