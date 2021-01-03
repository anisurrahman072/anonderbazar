import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {PartComponent} from "./part/part.component";
import {PartCreateComponent} from "./part-create/part-create.component";
import {PartEditComponent} from "./part-edit/part-edit.component";
import {PartReadComponent} from "./part-read/part-read.component";
import {PartRoutingModule} from "./part-routing.module";
import {NgZorroAntdModule} from "ng-zorro-antd";
import {FileUploadModule} from "ng2-file-upload";
import {ImageUploadModule} from "angular2-image-upload";
import {UiModule} from "../../shared/ui.module";



@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        FileUploadModule,
        ReactiveFormsModule,
        PartRoutingModule,
        UiModule
    ],
    declarations: [
        PartComponent,
        PartCreateComponent,
        PartEditComponent,
        PartReadComponent
    ]
})
export class PartModule {
}
