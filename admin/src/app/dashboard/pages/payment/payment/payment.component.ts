import {Component, OnInit} from '@angular/core';
import {PaymentService} from '../../../../services/payment.service';
import {AuthService} from '../../../../services/auth.service';
import {environment} from "../../../../../environments/environment";
import {PAYMENT_METHODS, OFFLINE_PAYMENT_METHODS, GLOBAL_CONFIGS, ORDER_TYPE, PAYMENT_APPROVAL_STATUS_TYPES} from "../../../../../environments/global_config";
import {NzNotificationService} from "ng-zorro-antd";
import moment from "moment";
import * as ___ from 'lodash';

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
    approvalStatusSearchValue: any = null;
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

    isOrderDetailsVisible: boolean = false;
    currentOrderDetails = null;
    isOfflinePaymentDetailVisible: boolean = false;
    currentOfflinePaymentDetails = null;

    PAYMENT_METHODS = PAYMENT_METHODS;
    OFFLINE_PAYMENT_METHODS = OFFLINE_PAYMENT_METHODS;
    approvalOptions = GLOBAL_CONFIGS.PAYMENT_APPROVAL_STATUS_TYPES;
    ORDER_TYPE = ORDER_TYPE;
    PAYMENT_APPROVAL_STATUS_TYPES = PAYMENT_APPROVAL_STATUS_TYPES;

    PAYMENT_STATUS_CHANGE_ADMIN_USER = GLOBAL_CONFIGS.PAYMENT_STATUS_CHANGE_ADMIN_USER;
    isAllowedToUpdatePaymentStatus:boolean = false;

    partial_offline_payments:boolean = false;
    regular_offline_payments:boolean = false;

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
        if(this.currentUser.id == this.PAYMENT_STATUS_CHANGE_ADMIN_USER){
            this.isAllowedToUpdatePaymentStatus = true;
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
    getPageData(showPartialOfflinePayments = false, showRegularOfflinePayments = false) {
        console.log('this.dateSearchValue', this.dateSearchValue);
        let dateSearchVal = '';
        if(this.dateSearchValue){
            dateSearchVal = moment(this.dateSearchValue).format('YYYY-MM-DD');
        }
        let orderType = null;
        if(showPartialOfflinePayments && !showRegularOfflinePayments){
            orderType = ORDER_TYPE.PARTIAL_ORDER_TYPE;
            this.paymentTypeSearchValue = PAYMENT_METHODS.OFFLINE_PAYMENT_TYPE;

            this.nameSearchValue = '';
            this.orderNumberSearchValue = '';
            this.suborderNumberSearchValue = '';
            this.userIdSearchValue = '';
            this.transactionSearchValue = '';
            this.paymentAmountSearchValue = '';
            dateSearchVal = '';
            this.statusSearchValue = '';
            this.receiver_id = '';
            this.approvalStatusSearchValue = '';
            this.sortKey = '';
        }
        if(showRegularOfflinePayments && !showPartialOfflinePayments){
            orderType = ORDER_TYPE.REGULAR_ORDER_TYPE;
            this.paymentTypeSearchValue = PAYMENT_METHODS.OFFLINE_PAYMENT_TYPE;

            this.nameSearchValue = '';
            this.orderNumberSearchValue = '';
            this.suborderNumberSearchValue = '';
            this.userIdSearchValue = '';
            this.transactionSearchValue = '';
            this.paymentAmountSearchValue = '';
            dateSearchVal = '';
            this.statusSearchValue = '';
            this.receiver_id = '';
            this.approvalStatusSearchValue = '';
            this.sortKey = '';
        }
        if(showRegularOfflinePayments && showPartialOfflinePayments){
            orderType = 'bothRegularPartialOfflinePayments';
            this.paymentTypeSearchValue = PAYMENT_METHODS.OFFLINE_PAYMENT_TYPE;

            this.nameSearchValue = '';
            this.orderNumberSearchValue = '';
            this.suborderNumberSearchValue = '';
            this.userIdSearchValue = '';
            this.transactionSearchValue = '';
            this.paymentAmountSearchValue = '';
            dateSearchVal = '';
            this.statusSearchValue = '';
            this.receiver_id = '';
            this.approvalStatusSearchValue = '';
            this.sortKey = '';
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
                this.approvalStatusSearchValue || '',
                orderType || '',
                this.sortKey,
                this.filterTerm(this.sortValue)
            )
            .subscribe(
                result => {
                    this.loading = false;
                    this.data = result.data.map(payment => {
                        let  productNames = payment.productName.split('___');
                        let  productQtys = payment.productQty.split(',');
                        let  productTotalPrices = payment.productTotalPrice.split(',');
                        let orderDetails = [];

                        let len = productTotalPrices.length;
                        for(let index = 0; index < len; index++){
                            let details = {
                                productName: productNames[index],
                                productQty: productQtys[index],
                                productTotalPrice: productTotalPrices[index]
                            };
                            orderDetails.push(details);
                        }

                        return {...payment, orderDetails, paymentDetails: JSON.parse(payment.paymentDetails)}

                    });
                    console.log("AnnnnnFnl: ", this.data );
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

    showOrderDetailsModal(orderDetail){
        this.isOrderDetailsVisible = true;
        this.currentOrderDetails = orderDetail;
    }

    showOfflinePaymentDetailsModal(paymentDetail){
        this.isOfflinePaymentDetailVisible = true;
        this.currentOfflinePaymentDetails = paymentDetail;

        if(this.currentOfflinePaymentDetails && this.currentOfflinePaymentDetails.money_receipt && this.currentOfflinePaymentDetails.money_receipt.split('[').length > 1){
            this.currentOfflinePaymentDetails.moneyReceipts = JSON.parse(this.currentOfflinePaymentDetails.money_receipt);
        }
    }

    handleOk = e => {
        this.isOrderDetailsVisible = false;
        this.isOfflinePaymentDetailVisible = false;
    };
    // Modal method
    handleCancel = e => {
        this.isOrderDetailsVisible = false;
        this.isOfflinePaymentDetailVisible = false;
    };

    changeApprovalStatus($event, paymentId, orderId, paymentApprovalStatus){
        this.paymentService.changeApprovalStatus(paymentId, orderId, paymentApprovalStatus)
            .subscribe(data => {
                console.log("The updated data is: ", data);
                this._notification.success("Success", "Successfully updated the payment");
                this.getPageData();
            }, error => {
                this._notification.error("Error", "Error occurred while updating the payment");
            })
    }
}
