import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CmsRoutingModule} from './cms-routing.module';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {SharedModule} from "../shared/shared.module";
import {NgxPaginationModule} from "ngx-pagination";
import {TabsModule} from "ngx-bootstrap";
import {ModalModule} from "ngx-bootstrap/modal";
import {NgAisModule} from "angular-instantsearch";
import {MaterialModule} from "../../core/material.module";
import {CmsDetailsPageComponent} from "./cms-details-page/cms-details-page.component";
import {CmsPageComponent} from "./cms-page/cms-page.component";

@NgModule({
    imports: [
        CommonModule,
        CmsRoutingModule,
        FormsModule,
        ReactiveFormsModule,
        SharedModule,
        NgxPaginationModule,
        TabsModule.forRoot(),
        ModalModule.forRoot(),
        NgAisModule,
        MaterialModule,
    ],
    declarations: [CmsPageComponent, CmsDetailsPageComponent]
})
export class CmsModule {
}
