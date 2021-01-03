import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {MessageClientComponent} from "./message-client/message-client.component";
import {AccessControl} from "../../../auth/core/guard/AccessControl.guard";

const routes: Routes = [
  {
      path: '',
      children: [
          {
              path: '',
              canActivate: [AccessControl],
              data: {accessData: 'message-client'},
              component: MessageClientComponent,
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
export class MessagingRoutingModule { }
