import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {RequestPageComponent} from "./request-page/request-page.component";

const routes: Routes = [
  {
    path: "",
    component: RequestPageComponent,
    data: {
      title: "Request"
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RequestRoutingModule { }
