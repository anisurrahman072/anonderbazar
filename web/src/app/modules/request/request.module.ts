import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RequestRoutingModule } from './request-routing.module';
import {RequestPageComponent} from "./request-page/request-page.component";
import {FormsModule} from "@angular/forms";
import {SharedModule} from "../shared/shared.module";

@NgModule({
  imports: [
    CommonModule,
    RequestRoutingModule,
    FormsModule,
    SharedModule,
  ],
  declarations: [RequestPageComponent]
})
export class RequestModule { }
