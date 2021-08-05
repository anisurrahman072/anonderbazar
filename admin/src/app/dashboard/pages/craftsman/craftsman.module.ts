import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {FileUploadModule} from 'ng2-file-upload';
import {CraftsmanRoutingModule} from './craftsman-routing.module';
import {CraftsmanReadComponent} from './craftsman-read/craftsman-read.component';
import {CraftsmanEditComponent} from './craftsman-edit/craftsman-edit.component';
import {CraftsmanCreateComponent} from './craftsman-create/craftsman-create.component';
import {CraftsmanComponent} from './craftsman/craftsman.component';
import {CraftsmanPipe} from "../../../pipes/craftman-active";
import {UiModule} from "../../shared/ui.module";

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        FileUploadModule,
        ReactiveFormsModule,
        CraftsmanRoutingModule,
        UiModule
    ],
    declarations: [
        CraftsmanComponent,
        CraftsmanReadComponent,
        CraftsmanEditComponent,
        CraftsmanCreateComponent,
        CraftsmanPipe
    ]
})
export class CraftsmanModule {
}
