import {Component, OnInit} from '@angular/core';
import {PaymentService} from '../../../../services/payment.service';
import {AuthService} from '../../../../services/auth.service';
import {environment} from "../../../../../environments/environment";
import {NzNotificationService} from "ng-zorro-antd";
import moment from "moment";

@Component({
    selector: 'app-payment',
    templateUrl: './payment.component.html',
    styleUrls: ['./payment.component.css']
})
export class PaymentComponent implements OnInit {
    data: any;
    _isSpinning = true;
    IMAGE_ENDPOINT = environment.IMAGE_ENDPOINT;
    currentUser: any;
    cardTitle: any;
    loading = false;
    page: number = 1;
    total: number;
    selectedOption: any[] = [];
    viewNotRendered: boolean = true;

    nameSearchValue: string = '';
    orderNumberSearchValue: string = '';
    suborderNumberSearchValue: string = '';
    userIdSearchValue: string = '';
    transactionSearchValue: string = '';
    paymentTypeSearchValue: string = '';
    paymentAmountSearchValue: string = '';
    dateSearchValue: string = '';
    statusSearchValue: string = '';
    limit: number = 10;

    sortValue = '';
    sortKey = '';

    receiver_id: any = null;

    subcategorySearchOptions: any;
    categorySearchOptions: any[] = [];
    options: any[];

    constructor(
        private paymentService: PaymentService,
        private _notification: NzNotificationService,
        private authService: AuthService
    ) {
    }

    // init the component
    ngOnInit(): void {
        this.options = [
            {
                value: 1,
                label: 'Pending',
                icon: 'anticon-spin anticon-loading'
            },
            {
                value: 2,
                label: 'Processing',
                icon: 'anticon-spin anticon-hourglass'
            },
            {
                value: 3,
                label: 'Delivered',
                icon: 'anticon-check-circle'
            },
            {
                value: 4,
                label: 'Canceled',
                icon: 'anticon-close-circle'
            }
        ];

        this.currentUser = this.authService.getCurrentUser();
        if (this.currentUser.group_id != "admin") {
            this.receiver_id = this.currentUser.id;
        }
        this.cardTitle = this.currentUser.group_id == 4 ? this.currentUser.username + '\'s Financial History' : 'Financial History';
        this.getPageData();
    }
    //Event method for resetting all filters
    resetAllFilter() {
        this.limit = 5;
        this.page = 1;
        this.nameSearchValue = '';
        this.orderNumberSearchValue = '';
        this.suborderNumberSearchValue = '';
        this.transactionSearchValue = '';
        this.paymentTypeSearchValue = '';
        this.paymentAmountSearchValue = '';
        this.dateSearchValue = '';
        this.sortValue = '';
        this.sortKey = '';

        this.getPageData();
    }

    //Event method for getting all the data for the page
    getPageData() {
        console.log('this.dateSearchValue', this.dateSearchValue);
        let dateSearchVal = '';
        if(this.dateSearchValue){
            dateSearchVal = moment(this.dateSearchValue).format('YYYY-MM-DD');
        }
        this.loading = true;
        this.paymentService
            .getAllPayment(
                this.page,
                this.limit,
                this.nameSearchValue || '',
                this.orderNumberSearchValue || '',
                this.suborderNumberSearchValue || '',
                this.userIdSearchValue || '',
                this.transactionSearchValue || '',
                this.paymentTypeSearchValue || '',
                this.paymentAmountSearchValue || '',
                dateSearchVal || '',
                this.statusSearchValue || '',
                this.receiver_id || '',
                this.sortKey,
                this.filterTerm(this.sortValue)
            )
            .subscribe(
                result => {
                    this.loading = false;
                    this.data = result.data;
                    this.total = result.total;
                    console.log(result);
                    this._isSpinning = false;

                },
                result => {
                    this.loading = false
                    this._isSpinning = false;
                }
            );
    }

    //Method for status change

    changeStatusConfirm(index, id, oldStatus) {
        if (this.currentUser.group_id == "admin") {
            this.paymentService
                .update(id, {status: this.selectedOption[index]})
                .subscribe(
                    res => {
                        this.data[index].status = this.selectedOption[index];
                    },
                    err => {
                        this.selectedOption[index] = oldStatus;
                    }
                );
        }
    }

    //Method for set status

    setStatus(index, id) {
        if (!this.viewNotRendered) return;
        this.selectedOption[index] = status;
    }
    //Event method for setting up filter data
    sort(sort: { key: string, value: string }) {
        this.page = 1;
        this.sortKey = sort.key;
        this.sortValue = sort.value;
        this.getPageData();
    }
    //Event method for pagination change
    changePage(page: number, limit: number) {
        this.page = page;
        this.limit = limit;
        this.getPageData();
        return false;
    }

    //Event method for setting up filter data
    private filterTerm(sortValue: string): string {
        switch (sortValue) {
            case 'ascend':
                return 'ASC';
            case 'descend':
                return 'DESC';
            default:
                return '';
        }
    }


    categoryIdChange($event) {
        this.page = 1;
        const query = encodeURI($event);

        this.getPageData();
    }


    deleteConfirm(id) {
        if (this.currentUser.group_id == "admin") {
            this._isSpinning = true;

            this.paymentService.delete(id).subscribe(result => {
                this._notification.create('warning', 'Delete', 'Transaction has been removed successfully');

                this._isSpinning = false;

            });
            this.getPageData();
        }
    }
}
