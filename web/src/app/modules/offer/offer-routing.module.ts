import {NgModule} from '@angular/core';
import {Routes, RouterModule} from "@angular/router";
import {OffersPageComponent} from "./offers-page/offers-page.component";
import {AnonderJhorComponent} from "./anonder-jhor/anonder-jhor.component";
import {AnonderJhorDetailsComponent} from "./anonder-jhor-details/anonder-jhor-details.component";

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

];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
    declarations: []
})
export class OfferRoutingModule {
}
