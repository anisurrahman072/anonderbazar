import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {NgZorroAntdModule} from 'ng-zorro-antd';
import {WarehouseVariantRoutingModule} from './warehouse-variant-routing.module';
import {WarehouseVariantReadComponent} from './warehouse-variant-read/warehouse-variant-read.component';
import {WarehouseVariantCreateComponent} from './warehouse-variant-create/warehouse-variant-create.component';
import {WarehouseVariantEditComponent} from './warehouse-variant-edit/warehouse-variant-edit.component';
import {WarehouseVariantComponent} from './warehouse-variant/warehouse-variant.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {FileUploadModule} from 'ng2-file-upload';
import {ImageUploadModule} from 'angular2-image-upload';
import {WarehouseVariantService} from '../../../services/warehouse-variant.service';
import {UiModule} from "../../shared/ui.module";

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        FileUploadModule,
        ReactiveFormsModule,
        WarehouseVariantRoutingModule,
        UiModule
    ],
    declarations: [
        WarehouseVariantComponent,
        WarehouseVariantReadComponent,
        WarehouseVariantCreateComponent,
        WarehouseVariantEditComponent
    ]
})
export class WarehouseVariantModule {
}
