import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {BrandComponent} from './brand/brand.component';
import {BrandReadComponent} from './brand-read/brand-read.component';
import {BrandCreateComponent} from './brand-create/brand-create.component';
import {BrandEditComponent} from './brand-edit/brand-edit.component';
import {BrandRoutingModule} from './brand-routing.module';
import {UiModule} from "../../shared/ui.module";


@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        BrandRoutingModule,
        UiModule
    ],
    declarations: [
        BrandComponent,
        BrandReadComponent,
        BrandCreateComponent,
        BrandEditComponent
    ]
})
export class BrandModule {
}
