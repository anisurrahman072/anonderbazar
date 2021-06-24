import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {OfferRoutingModule} from "./offer-routing.module";
import { OffersPageComponent } from './offers-page/offers-page.component';
import { AnonderJhorComponent } from './anonder-jhor/anonder-jhor.component';
import { AnonderJhorDetailsComponent } from './anonder-jhor-details/anonder-jhor-details.component';
import {NgxPaginationModule} from "ngx-pagination";

@NgModule({
    imports: [
        CommonModule,
        OfferRoutingModule,
        NgxPaginationModule,
    ],
    declarations: [OffersPageComponent, AnonderJhorComponent, AnonderJhorDetailsComponent]
})
export class OfferModule {
}
