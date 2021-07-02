import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OfferListComponent } from './offer-list/offer-list.component';
import { OfferRoutingModule } from './offer-routing.module';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {FileUploadModule} from 'ng2-file-upload';
import {UiModule} from "../../shared/ui.module";
import { OfferCreateComponent } from './offer-create/offer-create.component';
import { OfferEditComponent } from './offer-edit/offer-edit.component';
import {AllProductModalComponent} from "./offer-list/components/all-product-modal.component";
import { AnonderJhorComponent } from './anonder-jhor/anonder-jhor.component';
import { AnonderJhorOfferCreateComponent } from './anonder-jhor-offer-create/anonder-jhor-offer-create.component';
import { AnonderJhorOfferEditComponent } from './anonder-jhor-offer-edit/anonder-jhor-offer-edit.component';
import {CKEditorModule} from "@ckeditor/ckeditor5-angular";

@NgModule({
    imports: [
        CommonModule,
        OfferRoutingModule,
        UiModule,
        FormsModule,
        FileUploadModule,
        ReactiveFormsModule,
        UiModule,
        CKEditorModule
    ],
  declarations: [
    OfferListComponent,
    OfferEditComponent,
    OfferCreateComponent,
    AllProductModalComponent,
    AnonderJhorComponent,
    AnonderJhorOfferCreateComponent,
    AnonderJhorOfferEditComponent
  ]
})
export class OfferModule { }
