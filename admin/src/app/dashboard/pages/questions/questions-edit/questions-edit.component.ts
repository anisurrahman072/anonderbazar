import {Component, OnInit} from '@angular/core';
import {Subscription} from "rxjs";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {ActivatedRoute, Router} from '@angular/router';
import {NzNotificationService, sr_RS} from "ng-zorro-antd";
import {QuestionsService} from "../../../../services/questions.service";
import {AuthService} from "../../../../services/auth.service";
import {esLocale} from "ngx-bootstrap";

@Component({
    selector: 'app-questions-edit',
    templateUrl: './questions-edit.component.html',
    styleUrls: ['./questions-edit.component.css']
})
export class QuestionsEditComponent implements OnInit {

    id: number;
    data: any;
    sub: Subscription;
    validateForm: FormGroup;
    answerData: {};
    private currentUserData: any;
    private asnweredBy: string;

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private _notification: NzNotificationService,
        private fb: FormBuilder,
        private questionsService: QuestionsService,
        private authService: AuthService
    ) {
        this.validateForm = this.fb.group({
            answer: ['', [Validators.required]]
        });
    }

    ngOnInit() {
        this.currentUserData = this.authService.getCurrentUser();
        /*console.log('current uuuuuuuuu: ', this.currentUserData);*/

        if (this.currentUserData.warehouse && this.currentUserData.warehouse.name) {
            this.asnweredBy = this.currentUserData.warehouse.name;
        } else {
            this.asnweredBy = this.currentUserData.group_id;
        }
        this.sub = this.route.params.subscribe(params => {
            this.id = +params['id'];
            this.questionsService.getById(this.id)
                .subscribe(result => {
                    this.data = result.questionedProduct[0];
                    this.validateForm.patchValue(this.data);
                })
        })
    }

    /**Event method for submitting the form*/
    submitForm = ($event, value) => {
        $event.preventDefault();
        for (const key in this.validateForm.controls) {
            this.validateForm.controls[key].markAsDirty();
        }

        this.answerData = {
            answer: value.answer,
            answeredBy: this.asnweredBy
        }
        /*console.log('datassssssssssssss: ', this.answerData);*/
        this.questionsService.update(this.id, this.answerData)
            .subscribe(result => {
                this._notification.create('success', 'Update success by ', this.asnweredBy);
                this.router.navigate(['/dashboard/questions/details/', this.id]);
            })
    }

    /**Event method for resetting the form*/
    resetForm($event: MouseEvent) {
        $event.preventDefault();
        this.validateForm.reset();
        for (const key in this.validateForm.controls) {
            this.validateForm.controls[key].markAsPristine();
        }
    }

    /** Event method for setting up form in validation */
    getFormControl(answer) {
        return this.validateForm.controls[answer];
    }

    ngOnDestroy(): void {
        this.sub ? this.sub.unsubscribe() : '';
    }

}
