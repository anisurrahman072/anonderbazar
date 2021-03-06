import {Component, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren} from '@angular/core';
import {OrderService} from '../../../../services/order.service';
import {AuthService} from '../../../../services/auth.service';
import {NzNotificationService} from "ng-zorro-antd";
import {UIService} from '../../../../services/ui/ui.service';
import {ExportService} from '../../../../services/export.service';
import {StatusChangeService} from '../../../../services/statuschange.service';
import {FormBuilder, FormGroup} from '@angular/forms';
import {SuborderService} from '../../../../services/suborder.service';
import {GLOBAL_CONFIGS, PAYMENT_METHODS, PAYMENT_STATUS, ORDER_TYPE} from "../../../../../environments/global_config";
import {SuborderItemService} from "../../../../services/suborder-item.service";
import * as ___ from 'lodash';
import * as _moment from 'moment';
import {default as _rollupMoment} from 'moment';
import {Subscription} from "rxjs";
import {ActivatedRoute, Router} from "@angular/router";

const moment = _rollupMoment || _moment;

@Component({
    selector: 'app-warehouse',
    templateUrl: './Order.component.html',
    styleUrls: ['./Order.component.css']
})
export class OrderComponent implements OnInit, OnDestroy {

    @ViewChildren('dataFor') dataFor: QueryList<any>;
    @ViewChild('csvSelectAll') csvSelectAll;

    private orderDataSubscription: Subscription;
    private subOrderTimeSub: Subscription;
    private subOrderUpdateSub: Subscription;
    private currentUser: any;
    validateProductForm: FormGroup;
    viewNotRendered: boolean = true;
    orderNumberFilter: string = '';
    customerNameFilter: string = '';
    statusSearchValue: string = '';

    searchStartDate: any;
    paymentStatusSearchValue: any;
    paymentTypeSearchValue: any;
    orderTypeSearchValue: any;
    searchEndDate: any;
    dateSearchValue = {
        from: null,
        to: null,
    }

    searchStartDateOrdersBulk: any;
    searchEndDateOrdersBulk: any;

    orderData = [];
    orderTotal: number = 0;
    orderLimit: number = 25;
    orderPage: number = 1;
    _isSpinning = false;

    orderCsvTotal: number = 0;
    csvPage: number = 1;

    private statusData: any;
    options: any[] = GLOBAL_CONFIGS.ORDER_STATUSES;
    paymentOptions: any[] = GLOBAL_CONFIGS.PAYMENT_STATUS;
    paymentTypes: any[] = GLOBAL_CONFIGS.PAYMENT_TYPES;
    orderTypes: any[] = GLOBAL_CONFIGS.ORDER_TYPE;
    paymentStatus: any = PAYMENT_STATUS;
    private statusOptions = GLOBAL_CONFIGS.ORDER_STATUSES_KEY_VALUE;

    changePaymentOptions: any[] = GLOBAL_CONFIGS.REGULAR_OFFLINE_ORDER_PAYMENT_STATUS_CHANGE;

    isProductVisible = false;
    isOrdersBulkVisible = false;

    csvOrders: any = [];
    private csvPageSelectAll = [];
    private storedCsvOrders: any = [];

    submitting: boolean = false;

    ordersGridPageNumber = null;
    ordersGridDate = null;
    ordersGridStatus = null;
    ordersGridPaymentStatus = null;
    ordersGridPaymentType = null;
    ordersGridOrderType = null;
    ordersGridCustomerName = null;
    ordersGridOrderNumber = null;

    PAYMENT_METHODS = PAYMENT_METHODS;
    ORDER_TYPE = ORDER_TYPE;

    ORDER_STATUS_UPDATE_ADMIN_USER = GLOBAL_CONFIGS.ORDER_STATUS_CHANGE_ADMIN_USER;
    isAllowedToUpdateOrderStatus: boolean = false;

    PAYMENT_STATUS_UPDATE_ADMIN_USER = GLOBAL_CONFIGS.PAYMENT_STATUS_CHANGE_ADMIN_USER;
    isAllowedToUpdatePaymentStatus: boolean = false;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private orderService: OrderService,
        private suborderItemService: SuborderItemService,
        private fb: FormBuilder,
        private _notification: NzNotificationService,
        private uiService: UIService,
        private suborderService: SuborderService,
        private statusChangeService: StatusChangeService,
        private exportService: ExportService,
        private authService: AuthService
    ) {

        this.validateProductForm = this.fb.group({
            productChecked: ['', []],
        });
    }

    ngOnDestroy(): void {
        this.orderDataSubscription
            ? this.orderDataSubscription.unsubscribe()
            : '';

        this.subOrderTimeSub ? this.subOrderTimeSub.unsubscribe() : '';
        this.subOrderUpdateSub ? this.subOrderUpdateSub.unsubscribe() : '';

    }

    // init the component
    ngOnInit(): void {
        /** If come from Invoice page this section will be executed to add all previous filters */
        this.currentUser = this.authService.getCurrentUser();
        this.ordersGridPageNumber = +this.route.snapshot.queryParamMap.get("page");
        this.ordersGridDate = JSON.parse(this.route.snapshot.queryParamMap.get("date"));
        this.ordersGridStatus = +this.route.snapshot.queryParamMap.get("status");
        this.ordersGridPaymentStatus = +this.route.snapshot.queryParamMap.get("payment_status");
        this.ordersGridPaymentType = this.route.snapshot.queryParamMap.get("payment_type");
        this.ordersGridOrderType = +this.route.snapshot.queryParamMap.get("order_type");
        this.ordersGridCustomerName = this.route.snapshot.queryParamMap.get("customerName");
        this.ordersGridOrderNumber = +this.route.snapshot.queryParamMap.get("orderNumber");

        if(this.ordersGridPageNumber){
            this.orderPage = this.ordersGridPageNumber;
        }
        if(this.ordersGridDate){
            this.searchStartDate = this.ordersGridDate.from;
            this.searchEndDate = this.ordersGridDate.to;
        }
        if(this.ordersGridStatus){
            this.statusSearchValue = this.ordersGridStatus;
        }
        if(this.ordersGridPaymentStatus){
            this.paymentStatusSearchValue = this.ordersGridPaymentStatus
        }
        if(this.ordersGridPaymentType){
            this.paymentTypeSearchValue = this.ordersGridPaymentType
        }
        if(this.ordersGridOrderType){
            this.orderTypeSearchValue = this.ordersGridOrderType;
        }
        if(this.ordersGridCustomerName){
            this.customerNameFilter = this.ordersGridCustomerName;
        }
        if(this.ordersGridOrderNumber){
            this.orderNumberFilter = this.ordersGridOrderNumber
        }
        /** If come from Invoice page this section will be executed to add all previous filters END */


        if(this.currentUser.id == this.ORDER_STATUS_UPDATE_ADMIN_USER){
            this.isAllowedToUpdateOrderStatus = true;
        }
        if(this.currentUser.id == this.PAYMENT_STATUS_UPDATE_ADMIN_USER){
            this.isAllowedToUpdatePaymentStatus = true;
        }
        this.getData();
    }

    getStatusLabel(statusCode) {

        if (typeof this.statusOptions[statusCode] !== 'undefined') {
            return this.statusOptions[statusCode];
        }
        return 'Unrecognized Status';
    }

    //Event method for getting all the data for the page
    getData(event?: any, forCsv?: boolean) {

        if (event) {
            if (forCsv) {
                this.csvPage = event;
            } else {
                this.orderPage = event;
            }
        }

        if (this.searchStartDate) {
            if (this.searchStartDate.constructor.name === 'Moment') {
                this.dateSearchValue.from = this.searchStartDate.startOf('day').format('YYYY-MM-DD HH:mm:ss');
            } else {
                this.dateSearchValue.from = this.searchStartDate;
            }
        } else {
            this.dateSearchValue.from = moment().subtract(50, 'years').startOf('day').format('YYYY-MM-DD HH:mm:ss');
        }

        if (this.searchEndDate) {
            if (this.searchEndDate.constructor.name === 'Moment') {
                this.dateSearchValue.to = this.searchEndDate.endOf('day').format('YYYY-MM-DD HH:mm:ss');
            } else {
                this.dateSearchValue.to = this.searchEndDate;
            }
        } else {
            this.dateSearchValue.to = moment().endOf('day').format('YYYY-MM-DD HH:mm:ss');
        }

        let page = this.orderPage;
        let limit = this.orderLimit;
        if (forCsv) {
            page = this.csvPage;
            limit = 20;
        }

        this._isSpinning = true;
        this.orderDataSubscription = this.orderService.getAllOrdersGrid({
            date: JSON.stringify(this.dateSearchValue),
            status: this.statusSearchValue,
            payment_status: this.paymentStatusSearchValue,
            payment_type: this.paymentTypeSearchValue,
            order_type: this.orderTypeSearchValue,
            customerName: this.customerNameFilter,
            orderNumber: this.orderNumberFilter
        }, page, limit)
            .subscribe(result => {
                if (!forCsv) {

                    let allData = result.data;
                    allData = allData.map(data => {
                        let transactions = [];

                        if (!data.paymentAmount) {
                            return {...data, transactions};
                        } else {
                            let transactionsCount = data.paymentAmount.split(',').length;

                            let paymentAmounts = data.paymentAmount.split(',');
                            let paymentTypes = data.paymentType.split(',');
                            let transactionKeys = data.transactionKey.split(',');
                            let transactionTimes = data.transactionTime.split(',');

                            for (let i = 0; i < transactionsCount; i++) {
                                let transaction = {
                                    amount: Math.trunc(paymentAmounts[i]),
                                    paymentType: paymentTypes[i],
                                    transactionKey: transactionKeys[i],
                                    transactionTime: transactionTimes[i]
                                }
                                transactions.push(transaction);
                            }
                            return {...data, transactions};
                        }
                    })

                    this.orderData = allData;
                    this.orderTotal = result.total;
                } else {
                    this.csvOrders = result.data.map((item) => {
                        return {
                            ...item,
                            checked: false
                        }
                    });

                    this.orderCsvTotal = result.total;
                    const thisTotal = this.csvOrders.length;

                    if (typeof this.storedCsvOrders[page - 1] === 'undefined') {
                        this.storedCsvOrders[page - 1] = [];
                    }
                    if (typeof this.csvPageSelectAll[page - 1] === 'undefined') {
                        this.csvPageSelectAll[page - 1] = false;
                    }

                    this.csvSelectAll.nativeElement.checked = !!this.csvPageSelectAll[page - 1];

                    if (this.storedCsvOrders[page - 1].length) {
                        for (let index = 0; index < thisTotal; index++) {
                            const foundIndex = this.storedCsvOrders[page - 1].findIndex((storedOder) => {
                                return storedOder.id == this.csvOrders[index].id;
                            });
                            this.csvOrders[index].checked = foundIndex !== -1;
                        }
                    } else {
                        for (let index = 0; index < thisTotal; index++) {
                            this.csvOrders[index].checked = false;
                        }
                    }
                }

                this._isSpinning = false;

            }, (err) => {
                console.log(err);
                this._isSpinning = false;
                this._notification.error('Problems!', 'Problems in loading the orders');
            });
    }

    selectAllCsv($event) {
        const isChecked = !!$event.target.checked;

        if (!isChecked) {
            this.storedCsvOrders[this.csvPage - 1] = [];
        }

        this.csvPageSelectAll[this.csvPage - 1] = isChecked;
        const len = this.csvOrders.length;

        for (let i = 0; i < len; i++) {
            this.csvOrders[i].checked = isChecked;
            if (isChecked) {
                const foundIndex = this.storedCsvOrders[this.csvPage - 1].findIndex((storedOder) => {
                    return storedOder.id == this.csvOrders[i].id;
                });
                if (foundIndex === -1) {
                    this.storedCsvOrders[this.csvPage - 1].push(this.csvOrders[i]);
                }
            }
        }
    }


    //Method for status checkbox

    _refreshStatus($event, value) {
        if ($event && $event.currentTarget.checked) {
            this.storedCsvOrders[this.csvPage - 1].push(value);
        } else {
            let findValue = this.storedCsvOrders[this.csvPage - 1].findIndex((item) => {
                return item.id == value.id
            });
            if (findValue !== -1) {
                this.storedCsvOrders[this.csvPage - 1].splice(findValue, 1);
            }
        }
    }

    // Method for showing the modal
    showProductModal = () => {

        this.csvSelectAll.nativeElement.checked = false;
        this.isProductVisible = true;
        this.storedCsvOrders = [];
        this.csvPageSelectAll = [];

        this.getData(null, true);
    };

    showOrdersBalkModal() {
        this.isOrdersBulkVisible = true;
    }


    //Event method for resetting all filters
    resetAllFilter() {
        this.searchStartDate = '';
        this.searchEndDate = '';
        this.statusSearchValue = '';
        this.customerNameFilter = '';
        this.orderNumberFilter = '';
        this.orderPage = 1;
        this.getData();
    }

    //Method for status change
    changeStatusConfirm($event, id, oldStatus) {
        this.subOrderUpdateSub = this.orderService.update(id, {
            status: $event,
            changed_by: this.currentUser.id
        }).subscribe((res) => {
            this._notification.create('success', 'Successful Message', 'Order status has been updated successfully');
            this.suborderService.updateByOrderId(id, {status: $event})
                .subscribe(arg => {
                });

            this.statusChangeService.updateStatus({order_id: id, order_status: $event, changed_by: this.currentUser.id})
                .subscribe(arg => this.statusData = arg);

            this.getData();
        }, (err) => {
            this._notification.create('error', 'Error', 'Something went wrong');
            $event = oldStatus;
        });
    }

    changePaymentStatusConfirm($event, id, oldStatus) {
        this._isSpinning = true;
        this.orderService.updatePaymentStatus(id, {
            payment_status: $event,
            changed_by: this.currentUser.id
        }).subscribe(data => {
            this._isSpinning = false;
            this._notification.create('success', 'Successful Message', 'Order Payment status has been updated successfully');
        }, error => {
            console.log(error);
            this._isSpinning = false;
            this._notification.create('error', 'Error Message', 'Error occurred while updating the payment status!');
        })
    }

    //Method for csv download
    dowonloadCSV(data) {

        if (!(Array.isArray(data) && data.length > 0)) {
            return false;
        }

        let csvData = [];
        data.forEach(suborderItem => {

            let allCouponCodes = '';

            if (suborderItem.all_coupons) {
                const couponArr = suborderItem.all_coupons.split(',');
                allCouponCodes = couponArr.map((coupon) => {
                    return '1' + ___.padStart(coupon, 6, '0')
                }).join('|');
            }

            let varients = "";
            /*
            item.suborderItemVariants.forEach(element => {
                varients += element.variant_id.name + ': ' + element.product_variant_id.name + ' '
            });
           */

            csvData.push({
                'Order Id': suborderItem.order_id,
                'SubOrder Id': suborderItem.suborder_id,
                'Vandor Name': (suborderItem.vendor_name) ? suborderItem.vendor_name.split(',').join('-').trim() : 'N/a',
                'Vandor Phone': (suborderItem.vendor_phone) ? suborderItem.vendor_phone : 'N/a',
                'Customer Name': suborderItem.customer_name ? suborderItem.customer_name.split(',').join('-').trim() : 'N/a',
                'Customer Phone': (suborderItem.customer_phone) ? suborderItem.customer_phone : 'N/a',
                'Product Description': '(' + suborderItem.product_code + ') | ' + suborderItem.product_id + ' | ' + varients,
                'Price': suborderItem.price,
                'Quantity': suborderItem.product_quantity,
                'Total': suborderItem.product_total_price,
                'Suborder Status': typeof this.statusOptions[suborderItem.sub_order_status] !== 'undefined' ? this.statusOptions[suborderItem.sub_order_status] : 'Unrecognized Status',
                'Suborder Changed By': ((suborderItem.suborder_changed_by_name) ? suborderItem.suborder_changed_by_name : ''),
                'Order Status': typeof this.statusOptions[suborderItem.order_status] !== 'undefined' ? this.statusOptions[suborderItem.order_status] : 'Unrecognized Status',
                'Order Status Changed By': ((suborderItem.order_changed_by_name) ? suborderItem.order_changed_by_name : ''),
                'Date': (suborderItem.created_at) ? moment(suborderItem.created_at).format('DD/MM/YYYY h:m a') : 'N/a',
                'SSLCommerce Transaction Id': suborderItem.ssl_transaction_id ? suborderItem.ssl_transaction_id : '',
                'Coupon Product Code': allCouponCodes,
                'postal Code': suborderItem.postal_code,
                'Transactions': suborderItem.transactions,
                'Upazila Name': suborderItem.upazila_name ? suborderItem.upazila_name.split(',').join('/').trim() : 'N/a',
                'Zila Name': suborderItem.zila_name ? suborderItem.zila_name.split(',').join('/').trim() : 'N/a',
                'Division Name': suborderItem.division_name ? suborderItem.division_name.split(',').join('/').trim() : 'N/a',
                'Address': suborderItem.address ? suborderItem.address.split(',').join('/').trim() : 'N/a'
            });

        });

        const header = [
            'Order Id',
            'SubOrder Id',
            'Vandor Name',
            'Vandor Phone',
            'Customer Name',
            'Customer Phone',
            'Product Description',
            'Price',
            'Quantity',
            'Total',
            'Suborder Status',
            'Suborder Changed By',
            'Order Status',
            'Order Status Changed By',
            'Date',
            'SSLCommerce Transaction Id',
            'Coupon Product Code',
            'postal Code',
            'Transactions',
            'Upazila Name',
            'Zila Name',
            'Division Name',
            'Address'
        ];
        this.exportService.downloadFile(csvData, header);
    }

    //Event method for submitting the form
    submitForm = ($event, value) => {
        this.submitting = true;

        /** the array indexes which has the data are being filtered and the ids
         *  of those data's are being map out and taken into "orderIds" variable*/
        let orderIds = ___.flatten(this.storedCsvOrders.filter(arr => {
            return arr.length > 0;
        })).map(item => {
            return item.id;
        });
        if (orderIds.length === 0) {
            return false;
        }

        this.isProductVisible = false;
        this._isSpinning = true;
        this.subOrderTimeSub = this.suborderItemService.allOrderItemsByOrderIds(orderIds)
            .subscribe((result: any) => {
                this._isSpinning = false;

                let allData = result.data;
                allData = allData.map(data => {
                    let transactions = [];

                    if (!data.paymentAmount) {
                        return {...data, transactions};
                    } else {
                        let transactionsCount = data.paymentAmount.split(',').length;

                        let paymentAmounts = data.paymentAmount.split(',');
                        let paymentTypes = data.paymentType.split(',');
                        let transactionKeys = data.transactionKey.split(',');
                        let transactionTimes = data.transactionTime.split(',');

                        for (let i = 0; i < transactionsCount; i++) {
                            let transaction = {
                                Amount: paymentAmounts[i],
                                Type: paymentTypes[i],
                                Transaction_Key: transactionKeys[i],
                                Time: transactionTimes[i]
                            }
                            transactions.push(transaction);
                        }
                        return {...data, transactions};
                    }
                })

                this.dowonloadCSV(allData);
                this.submitting = false;
            }, (err) => {
                console.log(err);
                this._isSpinning = false;
                this._notification.error('Problems!', 'Problems in loading the orders');
            });
    }

    //Method for set status

    setStatus(index, status) {
        if (!this.viewNotRendered) {
            return;
        }
    }

    ngAfterViewInit() {
        this.dataFor.changes.subscribe(t => {
            this.viewNotRendered = false;
        })
    }


    //Event method for deleting order
    deleteConfirm(id) {
        this.orderService.delete(id)
            .subscribe(result => {
                console.log('deleted', result);
            });
    }


    handleOk = e => {
        this.isProductVisible = false;
        this.isOrdersBulkVisible = false;
    };

    handleCancel = e => {
        this.isProductVisible = false;
        this.isOrdersBulkVisible = false;
    };

    onSubmitOrdersBulkDownload() {
        this.isOrdersBulkVisible = false;
        if (!this.searchStartDateOrdersBulk) {
            this._notification.error('Missing Start date!', 'Please provide start date!');
        }

        let dateSearchValue = {
            from: null,
            to: null,
        };


        if (this.searchStartDateOrdersBulk) {
            if (this.searchStartDateOrdersBulk.constructor.name === 'Moment') {
                dateSearchValue.from = this.searchStartDateOrdersBulk.startOf('day').format('YYYY-MM-DD HH:mm:ss');
            } else {
                dateSearchValue.from = this.searchStartDateOrdersBulk;
            }
        } else {
            dateSearchValue.from = moment().subtract(50, 'years').startOf('day').format('YYYY-MM-DD HH:mm:ss');
        }

        if (this.searchEndDateOrdersBulk) {
            if (this.searchEndDateOrdersBulk.constructor.name === 'Moment') {
                dateSearchValue.to = this.searchEndDateOrdersBulk.endOf('day').format('YYYY-MM-DD HH:mm:ss');
            } else {
                dateSearchValue.to = this.searchEndDateOrdersBulk;
            }
        } else {
            dateSearchValue.to = moment().endOf('day').format('YYYY-MM-DD HH:mm:ss');
        }


        this.orderService.getOrdersByDate({
            date: JSON.stringify(dateSearchValue)
        })
            .subscribe(result => {
                /*console.log("result is: ", result);*/
                if (!(Array.isArray(result) && result.length > 0)) {
                    this._notification.info('Not found!', 'No product found in this time');
                    return false;
                }
                let csvData = [];
                let varients = "";
                result.forEach(suborderItem => {
                    csvData.push({
                        'Order Date': _moment(suborderItem.orderCreatedAt).format('DD-MM-YYYY'),
                        'Order Time': _moment(suborderItem.orderCreatedAt).format('h:m a'),
                        'Order Id': suborderItem.order_id,
                        'SubOrder Id': suborderItem.suborder_id,
                        'Customer Name': suborderItem.customer_name ? suborderItem.customer_name.split(',').join('-').trim() : 'N/a',
                        'Customer Phone': (suborderItem.customer_phone) ? suborderItem.customer_phone : 'N/a',
                        'Customer Division': suborderItem.division_name ? suborderItem.division_name.split(',').join('/').trim() : 'N/a',
                        'Customer District': suborderItem.zila_name ? suborderItem.zila_name.split(',').join('/').trim() : 'N/a',
                        'Customer Upazila': suborderItem.upazila_name ? suborderItem.upazila_name.split(',').join('/').trim() : 'N/a',
                        'Customer House/Road/Block/Village': suborderItem.address ? suborderItem.address.split(',').join('/').trim() : 'N/a',
                        'Category': suborderItem.categoryName ? suborderItem.categoryName.split(',').join('-').trim() : 'N/a',
                        'Product Name': suborderItem.product_name ? suborderItem.product_name.split(',').join('-').trim() : 'N/a',
                        'Product SKU': suborderItem.product_code,
                        'MRP': suborderItem.originalPrice,
                        'Vendor Price': suborderItem.vendorPrice,
                        'Discount Price': suborderItem.discountPrice,
                        'Quantity': suborderItem.product_quantity,
                        'Shipping Charge': suborderItem.courier_charge,
                        'Total': suborderItem.product_total_price,
                        'Grand Total': suborderItem.total_price,
                        'Payment Method': suborderItem.paymentType,
                        'Transaction ID': suborderItem.transactionKey,
                        'Payment Amount': suborderItem.order_type === ORDER_TYPE.REGULAR_ORDER_TYPE ? suborderItem.paid_amount : suborderItem.paymentAmount,
                        'Transaction Time': _moment(suborderItem.transactionTime).format('DD-MM-YYYY h:m a'),
                        'Remaining Amount': suborderItem.dueAmount,
                        'Vendor Name': (suborderItem.vendor_name) ? suborderItem.vendor_name.split(',').join('-').trim() : 'N/a',
                        'Vendor Phone': (suborderItem.vendor_phone) ? suborderItem.vendor_phone : 'N/a',
                        'Vendor Address': suborderItem.vendor_address ? suborderItem.vendor_address.split(',').join('/').trim() : 'N/a',
                        'Suborder Status': typeof this.statusOptions[suborderItem.sub_order_status] !== 'undefined' ? this.statusOptions[suborderItem.sub_order_status] : 'Unrecognized Status',
                        'Suborder Changed By': ((suborderItem.suborder_changed_by_name) ? suborderItem.suborder_changed_by_name : ''),
                        'Order Status': typeof this.statusOptions[suborderItem.order_status] !== 'undefined' ? this.statusOptions[suborderItem.order_status] : 'Unrecognized Status',
                        'Order Status Changed By': ((suborderItem.order_changed_by_name) ? suborderItem.order_changed_by_name : ''),
                    });
                });
                const header = [
                    'Order Date',
                    'Order Time',
                    'Order Id',
                    'SubOrder Id',
                    'Customer Name',
                    'Customer Phone',
                    'Customer Division',
                    'Customer District',
                    'Customer Upazila',
                    'Customer House/Road/Block/Village',
                    'Category',
                    'Product Name',
                    'Product SKU',
                    'MRP',
                    'Vendor Price',
                    'Discount Price',
                    'Quantity',
                    'Shipping Charge',
                    'Total',
                    'Grand Total',
                    'Payment Method',
                    'Transaction ID',
                    'Payment Amount',
                    'Transaction Time',
                    'Remaining Amount',
                    'Vendor Name',
                    'Vendor Phone',
                    'Vendor Address',
                    'Suborder Status',
                    'Suborder Changed By',
                    'Order Status',
                    'Order Status Changed By'
                ];
                this.exportService.downloadFile(csvData, header);
                this._notification.success('Success', 'Successfully fetched all products.');

            }, error => {
                console.log("Error: ", error);
                this._notification.error('Error occurred!', 'Something wrong happened!');
            })
    }

    goToOrderRead(orderId){
        let query = {
            page: this.orderPage,
            date: JSON.stringify(this.dateSearchValue),
            status: this.statusSearchValue,
            payment_status: this.paymentStatusSearchValue,
            payment_type: this.paymentTypeSearchValue,
            order_type: this.orderTypeSearchValue,
            customerName: this.customerNameFilter,
            orderNumber: this.orderNumberFilter
        };
        this.router.navigate(['/dashboard/order/details/', orderId], {queryParams: query});
    }


}
