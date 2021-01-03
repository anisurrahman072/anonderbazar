import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {NgZorroAntdModule} from 'ng-zorro-antd';

import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {FileUploadModule} from 'ng2-file-upload';
import {ImageUploadModule} from 'angular2-image-upload';
import {ProfileRoutingModule} from './profile-routing.module';
import {ProfileReadComponent} from './profile-read/profile-read.component';
import {ProfileEditComponent} from './profile-edit/profile-edit.component';
import {ProfilePipe} from "../../../pipes/profile";

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        FileUploadModule,
        ReactiveFormsModule,
        ProfileRoutingModule,
        NgZorroAntdModule.forRoot(),
        ImageUploadModule.forRoot(),
    ],
    declarations: [
        ProfileReadComponent,
        ProfileEditComponent,
        ProfilePipe
    ]
})
export class ProfileModule {
}
