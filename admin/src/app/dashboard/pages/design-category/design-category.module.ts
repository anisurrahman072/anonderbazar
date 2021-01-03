import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {FileUploadModule} from 'ng2-file-upload';
import {UiModule} from "../../shared/ui.module";
import {DesignCategoryRoutingModule} from "./design-category-routing.module";
import {DesignCategoryCoreComponent} from "./core/design-category-core.component";
import {DesignCategoryComponent} from "./components/design-category-list/design-category.component";
import {DesignCategoryCreateComponent} from "./components/design-category-create/design-category-create.component";
import {DesignCategoryReadComponent} from "./components/design-category-read/design-category-read.component";
import {DesignCategoryEditComponent} from "./components/design-category-edit/design-category-edit.component";

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        FileUploadModule,
        ReactiveFormsModule,
        DesignCategoryRoutingModule,
        UiModule
    ],
    declarations: [
        DesignCategoryCoreComponent,
        
        DesignCategoryComponent,
        DesignCategoryCreateComponent,
        DesignCategoryReadComponent,
        DesignCategoryEditComponent],
})

export class DesignCategoryModule {
}
