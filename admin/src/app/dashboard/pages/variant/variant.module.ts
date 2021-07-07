import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {NgZorroAntdModule} from 'ng-zorro-antd';
import {VariantRoutingModule} from './variant-routing.module';
import {VariantReadComponent} from './variant-read/variant-read.component';
import {VariantCreateComponent} from './variant-create/variant-create.component';
import {VariantEditComponent} from './variant-edit/variant-edit.component';
import {VariantComponent} from './variant/variant.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {FileUploadModule} from 'ng2-file-upload';
import {VariantTypePipe} from "../../../pipes/variant-type";
import {UiModule} from "../../shared/ui.module";

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        FileUploadModule,
        ReactiveFormsModule,
        VariantRoutingModule,
        UiModule
    ],
    declarations: [
        VariantComponent,
        VariantReadComponent,
        VariantCreateComponent,
        VariantEditComponent,
        VariantTypePipe,

    ]
})
export class VariantModule {
}
