import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {NgZorroAntdModule} from 'ng-zorro-antd';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {ImageUploadModule} from 'angular2-image-upload';
import {RouterModule, Routes} from '@angular/router';
import {CmsBannerComponent} from './components/banner/cms-banner.component';
import {CmsCarouselComponent} from './components/carousel/cms-carousel.component';
import {UiModule} from '../../shared/ui.module';
import {FileUploadModule} from 'ng2-file-upload';
import {CmsHomeComponent} from './components/home/cms-home.component';

const routes: Routes = [
    {
        path: '',
        component: CmsHomeComponent
    }
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        FileUploadModule,
        RouterModule.forChild(routes),
        NgZorroAntdModule,
        ImageUploadModule.forRoot(),
        UiModule
    ],
    declarations: [CmsHomeComponent, CmsBannerComponent, CmsCarouselComponent]
})
export class CmsHomeModule {
}
