import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgZorroAntdModule } from 'ng-zorro-antd';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ImageUploadModule } from 'angular2-image-upload';
import { RouterModule, Routes } from '@angular/router';
import { CmsLayoutComponent } from './components/layout/cms-layout.component';
import { CmsHeaderComponent } from './components/header/cms-header.component';
import { CmsLogoComponent } from './components/logo/cms-logo.component';
import { UiModule } from '../../shared/ui.module';
import { FileUploadModule } from 'ng2-file-upload';
import { CmsFooterComponent } from './components/footer/footer/cms-footer.component';
import { CmsFeatureFooterComponent } from './components/footer/cms-feature-footer/cms-feature-footer.component';

const routes: Routes = [
  {
    path: '',
    component: CmsLayoutComponent
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
  declarations: [
    CmsLayoutComponent,
    CmsHeaderComponent,
    CmsLogoComponent,
    CmsFooterComponent,
    CmsFeatureFooterComponent
  ],
  exports: []
})
export class CmsLayoutModule {}
