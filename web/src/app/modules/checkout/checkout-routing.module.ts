import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {CheckoutPageComponent} from "./checkout-page/checkout-page.component";


const routes: Routes = [
  {
    path: "",
    component: CheckoutPageComponent,
    data: {
      title: "Checkout"
    }
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CheckoutRoutingModule { }
