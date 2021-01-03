import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {CraftmanPriceComponent} from "./component/craftman-price.component";
import {AccessControl} from "../../../auth/core/guard/AccessControl.guard";
import {CraftmanPriceCreateComponent} from "./component/craftman-price-create/craftman-price-create.component";
import {CraftmanPriceEditComponent} from "./component/craftman-price-edit/craftman-price-edit.component";

const routes: Routes = [
    {
        path: '',
        children: [
            {
                path: '',
                canActivate: [AccessControl],
                data: {accessData: 'craftsmanprice-read'},
                component: CraftmanPriceComponent,
            },
            {
                path: 'create',
                canActivate: [AccessControl],
                data: {accessData: 'craftsmanprice-create', breadcrumbs: 'create'},
                component: CraftmanPriceCreateComponent,
            },
            {
                path: 'edit/:id',
                canActivate: [AccessControl],
                data: {accessData: 'craftsmanprice-edit', breadcrumbs: 'edit'},
                component: CraftmanPriceEditComponent,
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
export class CraftmanPriceRoutingModule {
}
