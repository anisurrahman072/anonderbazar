import {FullyCustomProductCreateComponent} from './product-create/fullyCustom/fullyCustom-product-create.component';
import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ProductRoutingModule} from './product-routing.module';
import {ProductReadComponent} from './product-read/product-read.component';
import {ProductCreateComponent} from './product-create/product-create.component';
import {ProductEditComponent} from './product-edit/product-edit.component';
import {ProductComponent} from './product/product.component';
import {ReactiveFormsModule} from '@angular/forms';
import {CKEditorModule} from 'ng2-ckeditor';
import {AddProductDesignComponent} from './product/components/add-product-design/add-product-design.component';
import {DesignCombinationComponent} from './components/design-combination/design-combination.component';
import {UiModule} from '../../shared/ui.module';
import {CustomProductCreateComponent} from './product-create/custom/custom-product-create.component';
import {FixedProductCreateComponent} from './product-create/fixed/fixed-product-create.component';
import {BulkUploadComponent} from "./bulk-upload/bulk-upload.component";
import { BulkUpdateComponent } from './bulk-update/bulk-update.component';
import {OrderTypePipe} from "../../../pipes/order-type";

@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule,
        ProductRoutingModule,
        CKEditorModule,
        UiModule
    ],
    exports: [
        OrderTypePipe
    ],
    declarations: [
        ProductComponent,
        ProductReadComponent,
        ProductCreateComponent,
        CustomProductCreateComponent,
        FullyCustomProductCreateComponent,
        FixedProductCreateComponent,
        ProductEditComponent,
        AddProductDesignComponent,
        DesignCombinationComponent,
        BulkUploadComponent,
        BulkUpdateComponent,
        OrderTypePipe
    ]
})
export class ProductModule {
}
