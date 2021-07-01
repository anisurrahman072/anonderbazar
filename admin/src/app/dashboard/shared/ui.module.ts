import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ImageUploadModule} from 'angular2-image-upload';
import {CKEditorModule} from "@ckeditor/ckeditor5-angular";
import {FileUploadModule} from "ng2-file-upload";
import {AccessControlPipe} from "../../pipes/accessControl.pipe";
import {FormsModule} from "@angular/forms";
import {McBreadcrumbsModule} from "ngx-breadcrumbs";
import {FlatpickrModule, FLATPICKR} from 'angularx-flatpickr';
import flatpickr from 'flatpickr';
import {NgZorroAntdModule} from "ng-zorro-antd";

export function flatpickrFactory() {
    return flatpickr;
}

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        CKEditorModule,
        ImageUploadModule.forRoot(),
        McBreadcrumbsModule.forRoot(),
        FileUploadModule,
        FlatpickrModule.forRoot({
            provide: FLATPICKR,
            useFactory: flatpickrFactory
        }),
        NgZorroAntdModule
    ],
    declarations: [
        AccessControlPipe
    ],
    exports: [
        FormsModule,
        ImageUploadModule,
        FileUploadModule,
        CKEditorModule,
        McBreadcrumbsModule,
        AccessControlPipe,
        FlatpickrModule,
        NgZorroAntdModule
    ]
})
export class UiModule {
}
