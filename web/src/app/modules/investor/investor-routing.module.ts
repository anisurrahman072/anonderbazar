import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {InvestorRegistrationComponent} from "./investor-registration/investor-registration.component";

const routes: Routes = [
    {
        path: "registration",
        component: InvestorRegistrationComponent,
        data: {
            title: "Investor Registration"
        }
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class InvestorRoutingModule { }
