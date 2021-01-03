
import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';


import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {RequisitionRoutingModule} from './requisition-routing.module';
import {PrRequisitionComponent} from './prrequisition/PrRequisition.component';  
import {UiModule} from "../../shared/ui.module"; 


@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule,
        RequisitionRoutingModule,
        UiModule
    ],
    declarations: [
        PrRequisitionComponent, 
    ]
})
export class RequisitionModule {
}
