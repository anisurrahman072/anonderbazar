import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UserCmsComponent } from './core/user-cms.component';

import { NgZorroAntdModule } from 'ng-zorro-antd';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ImageUploadModule } from 'angular2-image-upload';
import { CmsRoutingModule } from './user-cms-routing.module';
import { UiModule } from '../../shared/ui.module';
import { UserCmsPostReadComponent } from './user-cms-post-read/user-cms-post-read.component';

@NgModule({
  imports: [
    CommonModule,
    CmsRoutingModule,
    FormsModule,
    ReactiveFormsModule,

    ImageUploadModule.forRoot(),
    NgZorroAntdModule.forRoot(),
    UiModule

    // ScrollbarModule
  ],
  declarations: [UserCmsComponent, UserCmsPostReadComponent],
  exports: []
})
export class UserCmsModule {}
