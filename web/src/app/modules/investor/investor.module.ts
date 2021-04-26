import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InvestorRegistrationComponent } from './investor-registration/investor-registration.component';
import {InvestorRoutingModule} from './investor-routing.module';
import {ReactiveFormsModule} from "@angular/forms";
import {MaterialModule} from "../../core/material.module";

@NgModule({
  imports: [
    CommonModule, InvestorRoutingModule, ReactiveFormsModule, MaterialModule
  ],
  declarations: [InvestorRegistrationComponent]
})
export class InvestorModule { }
