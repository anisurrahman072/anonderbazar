import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OfferListComponent } from './offer-list/offer-list.component';
import { OfferRoutingModule } from './offer-routing.module'; 

import {NgZorroAntdModule} from 'ng-zorro-antd';

import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {FileUploadModule} from 'ng2-file-upload';
import {ImageUploadModule} from 'angular2-image-upload'; 

import {UiModule} from "../../shared/ui.module";
import { OfferCreateComponent } from './offer-create/offer-create.component';
import { OfferEditComponent } from './offer-edit/offer-edit.component';
import { OfferReadComponent } from './offer-read/offer-read.component';
@NgModule({
  imports: [
    CommonModule,
    OfferRoutingModule,
    UiModule,
    FormsModule,
    FileUploadModule,
    ReactiveFormsModule,
    UiModule
  ],
  declarations: [
    OfferListComponent,
    OfferEditComponent,
    OfferCreateComponent,
    OfferReadComponent
  ]
})
export class OfferModule { }
