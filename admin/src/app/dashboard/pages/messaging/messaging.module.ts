import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NgZorroAntdModule } from 'ng-zorro-antd';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FileUploadModule } from 'ng2-file-upload';
import { ImageUploadModule } from 'angular2-image-upload';
import { MessagingRoutingModule } from "./messaging-routing.module";
import { MessageClientComponent } from './message-client/message-client.component';
import { UiModule } from "../../shared/ui.module";


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    FileUploadModule,
    ReactiveFormsModule,
    UiModule,
    MessagingRoutingModule,
    NgZorroAntdModule
  ],
  declarations: [MessageClientComponent]
})
export class MessagingModule { }
