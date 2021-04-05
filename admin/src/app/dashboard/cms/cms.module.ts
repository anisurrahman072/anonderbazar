import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CmsComponent } from './core/cms.component';
import { NgZorroAntdModule } from 'ng-zorro-antd';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ImageUploadModule } from 'angular2-image-upload';
import { CmsRoutingModule } from './cms-routing.module';

@NgModule({
  imports: [
    CommonModule,
    CmsRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    ImageUploadModule.forRoot(),
    NgZorroAntdModule
  ],
  declarations: [CmsComponent],
  exports: []
})
export class CmsModule {
}
