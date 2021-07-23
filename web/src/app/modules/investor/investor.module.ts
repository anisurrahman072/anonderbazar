import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InvestorRegistrationComponent } from './investor-registration/investor-registration.component';
import {InvestorRoutingModule} from './investor-routing.module';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MaterialModule} from "../../core/material.module";
import {SharedModule} from "../shared/shared.module";

@NgModule({
    imports: [
        CommonModule, InvestorRoutingModule, ReactiveFormsModule, MaterialModule, SharedModule, FormsModule
    ],
  declarations: [InvestorRegistrationComponent]
})
export class InvestorModule { }
