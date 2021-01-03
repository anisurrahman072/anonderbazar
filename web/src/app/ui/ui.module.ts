import { ImageUploadModule } from "angular2-image-upload";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { SwiperModule } from "ngx-swiper-wrapper";
import { AccordionModule } from "ngx-bootstrap/accordion";
import { ImageZoomModule } from "angular2-image-zoom";
import {
  BsDropdownModule,
  PopoverModule,
  TabsModule,
  ButtonsModule
} from "ngx-bootstrap";
import {
  CloudinaryModule,
  CloudinaryConfiguration
} from "@cloudinary/angular-5.x";
import { Cloudinary } from "cloudinary-core";
import { RatingModule } from "ngx-bootstrap/rating";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { TooltipModule } from "ngx-bootstrap/tooltip";
import { ModalModule } from "ngx-bootstrap/modal";
import { TypeaheadModule } from "ngx-bootstrap/typeahead";
import { ClickOutsideModule } from "ng4-click-outside";
import { NouisliderModule } from "ng2-nouislider";
import { AngularMultiSelectModule } from "angular2-multiselect-dropdown/angular2-multiselect-dropdown";
import { NgxPaginationModule } from "ngx-pagination";
import { NgxChartsModule } from "@swimlane/ngx-charts"; 
import { NgSelectModule } from "@ng-select/ng-select"; 

@NgModule(<NgModule>{
  imports: [
    CommonModule,
    SwiperModule,
    FormsModule,
    ImageZoomModule,
    TabsModule.forRoot(),
    ButtonsModule.forRoot(),
    AccordionModule.forRoot(),
    CloudinaryModule.forRoot({ Cloudinary }, {
      cloud_name: "dnttans7l"
    } as CloudinaryConfiguration),
    RatingModule.forRoot(),
    TooltipModule.forRoot(),
    ModalModule.forRoot(),
    TypeaheadModule.forRoot(),
    PopoverModule.forRoot(),
    ClickOutsideModule,
    BsDropdownModule.forRoot(),
    NouisliderModule,
    AngularMultiSelectModule,
    NgxPaginationModule,
    NgxChartsModule,
    ImageUploadModule.forRoot(),
    NgSelectModule, 
  ],

  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SwiperModule,
    ImageZoomModule,
    TabsModule,
    ButtonsModule,
    AccordionModule,
    CloudinaryModule,
    RatingModule,
    TooltipModule,
    ModalModule,
    TypeaheadModule,
    PopoverModule,
    BsDropdownModule,
    NouisliderModule,
    ClickOutsideModule,
    AngularMultiSelectModule,
    NgxPaginationModule,
    ImageUploadModule,
    NgSelectModule, 
  ],
  providers: [
    { 
    }
  ]
})
export class UiModule {}
