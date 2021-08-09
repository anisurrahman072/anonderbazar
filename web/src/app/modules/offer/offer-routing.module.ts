import {NgModule} from '@angular/core';
import {Routes, RouterModule} from "@angular/router";
import {OffersPageComponent} from "./offers-page/offers-page.component";
import {AnonderJhorComponent} from "./anonder-jhor/anonder-jhor.component";
import {AnonderJhorDetailsComponent} from "./anonder-jhor-details/anonder-jhor-details.component";
import {OfferedProductsBrandsComponent} from "./offered-products-brands/offered-products-brands.component";
import {OfferedProductsComponent} from "./offered-products/offered-products.component";

const routes: Routes = [
    {
        path: "",
        component: OffersPageComponent,
        data: {
            title: "Offers-Anonder Bazar"
        }
    },
    {
        path: "anonder-jhor",
        component: AnonderJhorComponent,
        data: {
            title: "Anonder Jhor Offer"
        }
    },
    {
        path: "anonder-jhor-detail/:id",
        component: AnonderJhorDetailsComponent,
        data: {
            title: "offer detail"
        }
    },
    {
        path: "offered-products-brands/:id",
        component: OfferedProductsBrandsComponent,
        data: {
            title: "Offered Brands"
        }
    },
    {
        path: "offered-products-brands/:offerId/:brandId",
        component: OfferedProductsComponent,
        data: {
            title: "Offered Products"
        }
    },

];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
    declarations: []
})
export class OfferRoutingModule {
}
