import {Component, OnInit} from '@angular/core';
import {ProductService} from "../../../../services/product.service";
import {AuthService} from "../../../../services/auth.service";
import {NzNotificationService} from "ng-zorro-antd";
import {QuestionsService} from "../../../../services/questions.service";

@Component({
    selector: 'app-questions',
    templateUrl: './questions.component.html',
    styleUrls: ['./questions.component.css']
})
export class QuestionsComponent implements OnInit {
    data = [];
    _isSpinning = true;
    limit: number = 10;
    page: number = 1;
    total: number;
    loading: boolean = false;
    private currentUser: any;
    private warehouseId: any;

    constructor(private questionsService: QuestionsService,
                private authService: AuthService,
                private _notification: NzNotificationService,
    ) {
    }

    ngOnInit() {
        this.currentUser = this.authService.getCurrentUser();
        /*console.log('this.currentUser', this.currentUser);*/
        if (this.currentUser.warehouse && this.currentUser.warehouse.id) {
            this.warehouseId = this.currentUser.warehouse.id;
        } else {
            this.warehouseId = '';
        }

        this.getAllQuestionedProducts();
    }

    //Event method for getting all the questioned product data for the page
    getAllQuestionedProducts() {
        this.loading = true;
        this._isSpinning = true;
        this.questionsService.getAllQuestionedProducts(
            this.page,
            this.limit,
            this.warehouseId
        ).subscribe(result => {
            /*console.log('getAllQuestionedProducts', result);*/
            this.data = result.data;
            this.loading = false;
            this._isSpinning = false;
        })
    }

    //Event method for pagination change
    changePage(page: number, limit: number) {
        this.page = page;
        this.limit = limit;
        this.getAllQuestionedProducts();
        return false;
    }

    //Event method for deleting question
    deleteConfirm(id) {
        this.questionsService.deleteQuestion(id)
            .subscribe(result => {
                this._notification.create(
                    'success',
                    'Question has been removed successfully.',
                    result.name
                );
                this.getAllQuestionedProducts();
            });
    }


}
