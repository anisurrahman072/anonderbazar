import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OfferListComponent } from './offer-list/offer-list.component';
import { OfferRoutingModule } from './offer-routing.module';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {FileUploadModule} from 'ng2-file-upload';
import {UiModule} from "../../shared/ui.module";
import { OfferCreateComponent } from './offer-create/offer-create.component';
import { OfferEditComponent } from './offer-edit/offer-edit.component';
import { OfferReadComponent } from './offer-read/offer-read.component';
import {AllProductModalComponent} from "./offer-list/components/all-product-modal.component";

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
    OfferReadComponent,
    AllProductModalComponent
  ]
})
export class OfferModule { }
