import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {QuestionsComponent} from './questions/questions.component';
import {QuestionsAnswerComponent} from './questions-answer/questions-answer.component';
import {QuestionsReadComponent} from './questions-read/questions-read.component';
import {QuestionsEditComponent} from './questions-edit/questions-edit.component';
import {QuestionsRoutingModule} from "./questions-routing.module";
import {NgZorroAntdModule} from "ng-zorro-antd";

@NgModule({
    imports: [
        CommonModule,
        QuestionsRoutingModule,
        NgZorroAntdModule
    ],
    declarations: [
        QuestionsComponent,
        QuestionsAnswerComponent,
        QuestionsReadComponent,
        QuestionsEditComponent
    ]
})
export class QuestionsModule {
}
