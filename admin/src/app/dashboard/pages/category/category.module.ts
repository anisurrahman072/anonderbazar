import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CategoryCoreComponent} from './category-core/category-core.component';
import {CategoryRoutingModule} from './category-routing.module';
import {CategoryProductComponent} from './category-product/category-product/category-product.component';
import {CategoryTypeComponent} from './category-type/category-type/category-type.component';
import {CategoryTypeCreateComponent} from './category-type/category-type-create/category-type-create.component';
import {CategoryTypeEditComponent} from './category-type/category-type-edit/category-type-edit.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {CategoryTypeReadComponent} from './category-type/category-type-read/category-type-read.component';
import {CategoryProductReadComponent} from './category-product/category-product-read/category-product-read.component';
import {CategoryProductEditComponent} from './category-product/category-product-edit/category-product-edit.component';
import {CategoryProductCreateComponent} from './category-product/category-product-create/category-product-create.component';
import {FileUploadModule} from 'ng2-file-upload';
import {UiModule} from "../../shared/ui.module";

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        FileUploadModule,
        ReactiveFormsModule,
        CategoryRoutingModule,
        UiModule
    ],
    declarations: [
        CategoryCoreComponent,

        CategoryProductComponent,
        CategoryProductReadComponent,
        CategoryProductCreateComponent,
        CategoryProductEditComponent,

        CategoryTypeComponent,
        CategoryTypeCreateComponent,
        CategoryTypeReadComponent,
        CategoryTypeEditComponent],
})

export class CategoryModule {
}
