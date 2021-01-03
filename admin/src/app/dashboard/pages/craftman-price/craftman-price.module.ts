import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {NgZorroAntdModule} from 'ng-zorro-antd';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {FileUploadModule} from 'ng2-file-upload';
import {ImageUploadModule} from 'angular2-image-upload';
import {CKEditorModule} from 'ng2-ckeditor';
import {CraftmanPriceRoutingModule} from "./craftman-price-routing.module";
import {CraftmanPriceComponent} from "./component/craftman-price.component";
import {CraftmanPriceCreateComponent} from "./component/craftman-price-create/craftman-price-create.component";
import {UiModule} from "../../shared/ui.module";
import { CraftmanPriceEditComponent } from './component/craftman-price-edit/craftman-price-edit.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        FileUploadModule,
        ReactiveFormsModule,
        CraftmanPriceRoutingModule,
        UiModule,
        CKEditorModule
    ],
    declarations: [
        CraftmanPriceComponent,
        CraftmanPriceCreateComponent,
        CraftmanPriceEditComponent
    ]
})
export class CraftmanPriceModule {
}
