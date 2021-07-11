import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {NgZorroAntdModule} from 'ng-zorro-antd';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {ImageUploadModule} from 'angular2-image-upload';
import {RouterModule, Routes} from '@angular/router';
import {UiModule} from '../../shared/ui.module';
import {FileUploadModule} from 'ng2-file-upload';
import {CmsPostComponent} from './Components/cms-post/cms-post.component';
import {CmsLayoutComponent} from './Components/layout/cms-layout.component';
import {CmsHeaderComponent} from './Components/banner/cms-header.component';
import {CmsFooterComponent} from './Components/mixed/bottom/cms-footer.component';
import {CmsOfferComponent} from './Components/mixed/offer/cms-offer.component';
import {CmsFeatureFooterComponent} from './Components/mixed/middle/cms-feature-footer.component';
import {CKEditorModule} from "@ckeditor/ckeditor5-angular";

const routes: Routes = [
    {
        path: '',
        component: CmsLayoutComponent,
        children: []
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
        UiModule,
        CKEditorModule
    ],
    declarations: [
        CmsPostComponent,
        CmsLayoutComponent,
        CmsHeaderComponent,
        CmsFooterComponent,
        CmsOfferComponent,
        CmsFeatureFooterComponent
    ],
    exports: []
})
export class CmsPostModule {
}
