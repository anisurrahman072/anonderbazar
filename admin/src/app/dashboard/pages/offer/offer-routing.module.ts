import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {OfferListComponent} from './offer-list/offer-list.component';
import {OfferCreateComponent} from './offer-create/offer-create.component';
import {OfferEditComponent} from './offer-edit/offer-edit.component';
import {OfferReadComponent} from './offer-read/offer-read.component';
import {AccessControl} from "../../../auth/core/guard/AccessControl.guard";
import {AnonderJhorComponent} from "./anonder-jhor/anonder-jhor.component";

const routes: Routes = [
    {
        path: '',
        data: {accessData: 'offer',breadcrumbs: 'Offer'},
        children: [
            {
                path: '',
                canActivate: [AccessControl],
                data: {accessData: 'offer-list'},
                component: OfferListComponent,
            },
            {
                path: 'create',
                canActivate: [AccessControl],
                data: {accessData: 'offer-create'},
                component: OfferCreateComponent,
            },
            {
                path: 'edit/:id',
                canActivate: [AccessControl],
                data: {accessData: 'offer-edit'},
                component: OfferEditComponent,
            },
            {
                path: 'detail/:id',
                canActivate: [AccessControl],
                data: {accessData: 'offer-read'},
                component: OfferReadComponent,
            },
            {
                path: 'anonder-jhor',
                canActivate: [AccessControl],
                data: {accessData: 'anonder-jhor'},
                component: AnonderJhorComponent,
            },
            {
                path: '**',
                redirectTo: '',
                pathMatch: 'full'
            }
        ]
    }
];


@NgModule({
    imports: [
        RouterModule.forChild(routes)
    ],
    exports: [RouterModule],
    declarations: []
})
export class OfferRoutingModule {
}
