import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {OfferRoutingModule} from "./offer-routing.module";
import { OffersPageComponent } from './offers-page/offers-page.component';
import { AnonderJhorComponent } from './anonder-jhor/anonder-jhor.component';
import { AnonderJhorDetailsComponent } from './anonder-jhor-details/anonder-jhor-details.component';
import {NgxPaginationModule} from "ngx-pagination";
import {SharedModule} from "../shared/shared.module";
import { OfferedProductsBrandsComponent } from './offered-products-brands/offered-products-brands.component';
import { OfferedProductsComponent } from './offered-products/offered-products.component';

@NgModule({
    imports: [
        CommonModule,
        OfferRoutingModule,
        NgxPaginationModule,
        SharedModule,
    ],
    declarations: [OffersPageComponent, AnonderJhorComponent, AnonderJhorDetailsComponent, OfferedProductsBrandsComponent, OfferedProductsComponent]
})
export class OfferModule {
}
