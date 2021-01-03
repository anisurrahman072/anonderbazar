import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {NgZorroAntdModule} from 'ng-zorro-antd';
import {WarehouseRoutingModule} from './warehouse-routing.module';
import {WarehouseReadComponent} from './warehouse-read/warehouse-read.component';
import {WarehouseCreateComponent} from './warehouse-create/warehouse-create.component';
import {WarehouseEditComponent} from './warehouse-edit/warehouse-edit.component';
import {WarehouseComponent} from './warehouse/warehouse.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {FileUploadModule} from 'ng2-file-upload';
import {ImageUploadModule} from 'angular2-image-upload';
import {UiModule} from "../../shared/ui.module";

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        FileUploadModule,
        ReactiveFormsModule,
        WarehouseRoutingModule,
        UiModule
    ],
    declarations: [
        WarehouseComponent,
        WarehouseReadComponent,
        WarehouseCreateComponent,
        WarehouseEditComponent,
    ]
})
export class WarehouseModule {
}
