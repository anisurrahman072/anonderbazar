import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {DesignCategoryCoreComponent} from "./core/design-category-core.component";
import {DesignCategoryComponent} from "./components/design-category-list/design-category.component";
import {DesignCategoryReadComponent} from "./components/design-category-read/design-category-read.component";
import {DesignCategoryCreateComponent} from "./components/design-category-create/design-category-create.component";
import {DesignCategoryEditComponent} from "./components/design-category-edit/design-category-edit.component";
import {AccessControl} from "../../../auth/core/guard/AccessControl.guard";

const routes: Routes = [
    {
        path: '', /*  /dashboard/designctaegory */
        component: DesignCategoryCoreComponent,
        children: [
            {
                path: '',
                canActivate: [AccessControl],
                data: {accessData: 'designcategory-read'},
                component: DesignCategoryComponent,
            }, {
                path: 'details/:id',
                canActivate: [AccessControl],
                data: {accessData: 'designcategory-read'},
                component: DesignCategoryReadComponent,
            }, {
                path: 'create',
                canActivate: [AccessControl],
                data: {accessData: 'designcategory-create'},
                component: DesignCategoryCreateComponent,
            }, {
                path: 'edit/:id',
                canActivate: [AccessControl],
                data: {accessData: 'designcategory-edit'},
                component: DesignCategoryEditComponent,
            }, {
                path: '**',
                redirectTo: '',
                pathMatch: 'full'
            }
        ]
        
    },
];

@NgModule({
    imports: [
        RouterModule.forChild(routes)
    ],
    exports: [RouterModule],
    declarations: []
})
export class DesignCategoryRoutingModule {
}
