import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {NgZorroAntdModule} from 'ng-zorro-antd';
import {ImageUploadModule} from 'angular2-image-upload';
import {CKEditorModule} from "ng2-ckeditor";
import {FileUploadModule} from "ng2-file-upload";
import {AccessControlPipe} from "../../pipes/accessControl.pipe";
import {FormsModule} from "@angular/forms";
import {McBreadcrumbsModule} from "ngx-breadcrumbs";
import {FlatpickrModule, FLATPICKR} from 'angularx-flatpickr';
import flatpickr from 'flatpickr';

export function flatpickrFactory() {
    return flatpickr;
}


@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        CKEditorModule,
        NgZorroAntdModule.forRoot(),
        ImageUploadModule.forRoot(),
        McBreadcrumbsModule.forRoot(),
        FileUploadModule,
        FlatpickrModule.forRoot({
            provide: FLATPICKR,
            useFactory: flatpickrFactory
        })
    ],
    declarations: [
        AccessControlPipe
    ],
    exports: [
        FormsModule,
        NgZorroAntdModule,
        ImageUploadModule,
        FileUploadModule,
        CKEditorModule,
        McBreadcrumbsModule,
        AccessControlPipe,
        FlatpickrModule
    ]
})
export class UiModule {
}
