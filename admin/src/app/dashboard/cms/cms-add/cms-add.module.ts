import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgZorroAntdModule } from 'ng-zorro-antd';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ImageUploadModule } from 'angular2-image-upload';
import { RouterModule, Routes } from '@angular/router';
import { UiModule } from '../../shared/ui.module';
import { FileUploadModule } from 'ng2-file-upload';
import { CmsAddComponent } from './cms-add-component/cms-add.component';

const routes: Routes = [
  {
    path: '',
    component: CmsAddComponent,
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
    NgZorroAntdModule,
    RouterModule.forChild(routes),
    UiModule
  ],
  declarations: [CmsAddComponent],
  exports: []
})
export class CmsAddModule {}
