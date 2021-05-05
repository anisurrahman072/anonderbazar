import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {TopSellComponent} from "./top-sell/top-sell.component";

const routes: Routes = [
    {
        path: "",
        component: TopSellComponent,
        data: {
            title: "Top Selling products"
        }
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class TopSellRoutingModule { }
