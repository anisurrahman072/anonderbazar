import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {CmsPageComponent} from "./cms-page/cms-page.component";
import {CmsDetailsPageComponent} from "./cms-details-page/cms-details-page.component";
import {CmsPostDetailsComponent} from "./cms-post-details/cms-post-details.component";


const routes: Routes = [
    {
        path: "",
        component: CmsPageComponent,
        data: {
            title: "OFFERS"
        }
    },
    {
        path: "post-details/:id",
        component: CmsPostDetailsComponent,
        data: {
            title: "post-details"
        }
    },
    {
        path: "none",
        component: CmsPageComponent,
        data: {
            title: "CMS"
        }
    },
    {
        path: "cms-details/:id",
        component: CmsDetailsPageComponent,
        data: {
            title: "Cms Details"
        }
    },
    {
        path: 'cms-details',
        children: [
            {path : '**' , component: CmsDetailsPageComponent}
        ]
    }

];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class CmsRoutingModule {
}
