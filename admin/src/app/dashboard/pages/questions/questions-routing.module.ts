import { NgModule } from '@angular/core';
import { RouterModule, Routes} from "@angular/router";
import { QuestionsComponent} from "./questions/questions.component";
import { QuestionsAnswerComponent} from "./questions-answer/questions-answer.component";
import { QuestionsReadComponent} from "./questions-read/questions-read.component";
import { AccessControl} from "../../../auth/core/guard/AccessControl.guard";
import {QuestionsEditComponent} from "./questions-edit/questions-edit.component";

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        canActivate: [AccessControl],
        data: {accessData: 'questions'},
        component: QuestionsComponent,
      }, {
        path: 'details/:id',
        canActivate: [AccessControl],
        data: {accessData: 'questions-read'},
        component: QuestionsReadComponent,
      }, {
        path: 'answer',
        canActivate: [AccessControl],
        data: {accessData: 'questions-answer'},
        component: QuestionsAnswerComponent,
      }, {
        path: 'edit/:id',
        canActivate: [AccessControl],
        data: {accessData: 'warehouse-edit'},
        component: QuestionsEditComponent,
      }, {
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
export class QuestionsRoutingModule { }
