import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NgZorroAntdModule } from 'ng-zorro-antd';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ImageUploadModule } from 'angular2-image-upload';
import { RouterModule, Routes } from '@angular/router';
import { UiModule } from '../../../shared/ui.module';
import { FileUploadModule } from 'ng2-file-upload';
import { UserCmsPostComponent } from './Components/user-cms-post/user-cms-post.component';

const routes: Routes = [
  {
    path: '' /* /dashboard/ */,
    component: UserCmsPostComponent,
    children: [
    ]
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    FileUploadModule,
    ImageUploadModule.forRoot(),
    NgZorroAntdModule.forRoot(),
    RouterModule.forChild(routes),
    UiModule
  ],
  declarations: [UserCmsPostComponent],
  exports: []
})
export class UserCmsPostModule {}
