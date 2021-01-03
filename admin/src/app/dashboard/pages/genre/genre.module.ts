import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {NgZorroAntdModule} from 'ng-zorro-antd';

import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {FileUploadModule} from 'ng2-file-upload';
import {ImageUploadModule} from 'angular2-image-upload';
import {GenreRoutingModule} from "./genre-routing.module";
import {GenreComponent} from "./genre/genre.component";
import {GenreReadComponent} from "./genre-read/genre-read.component";
import {GenreCreateComponent} from "./genre-create/genre-create.component";
import {GenreEditComponent} from "./genre-edit/genre-edit.component";
import {UiModule} from "../../shared/ui.module";


@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        FileUploadModule,
        ReactiveFormsModule,
        GenreRoutingModule,
        UiModule
    ],
    declarations: [
        GenreComponent,
        GenreReadComponent,
        GenreCreateComponent,
        GenreEditComponent
    ]
})
export class GenreModule {
}
