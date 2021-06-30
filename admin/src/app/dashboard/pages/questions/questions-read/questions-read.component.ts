import { Component, OnInit } from '@angular/core';
import {Subscription} from "rxjs";
import {ActivatedRoute} from "@angular/router";
import {NzNotificationService} from "ng-zorro-antd";
import {QuestionsService} from "../../../../services/questions.service";

@Component({
  selector: 'app-questions-read',
  templateUrl: './questions-read.component.html',
  styleUrls: ['./questions-read.component.css']
})
export class QuestionsReadComponent implements OnInit {
  sub: Subscription;
  id: number;
  data: any;
  _isSpinning = true;

  constructor(
      private route: ActivatedRoute,
      private _notification: NzNotificationService,
      private questionsService: QuestionsService
  ) { }

  ngOnInit() {
    this.sub = this.route.params.subscribe( params => {
      this.id = +params['id'];
      this.questionsService.getById(this.id)
          .subscribe(result => {
            this.data = result.questionedProduct[0];
            this._isSpinning = false;
          })
    })
  }

  ngOnDestroy(): void {
    this.sub ? this.sub.unsubscribe() : '';
  }

}
