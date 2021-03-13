import {Component, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren} from '@angular/core';
import {OrderService} from '../../../../services/order.service';
import {AuthService} from '../../../../services/auth.service';
import {NzNotificationService} from "ng-zorro-antd";
import {UIService} from '../../../../services/ui/ui.service';
import {ExportService} from '../../../../services/export.service';
import {StatusChangeService} from '../../../../services/statuschange.service';
import {FormBuilder, FormGroup} from '@angular/forms';
import {SuborderService} from '../../../../services/suborder.service';
import {GLOBAL_CONFIGS} from "../../../../../environments/global_config";
import {SuborderItemService} from "../../../../services/suborder-item.service";
import * as ___ from 'lodash';
import * as _moment from 'moment';
import {default as _rollupMoment} from 'moment';
import {Subscription} from "rxjs";

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
    searchEndDate: any;

    orderData = [];
    orderTotal: number = 0;
    orderLimit: number = 25;
    orderPage: number = 1;
    _isSpinning = false;

    orderCsvTotal: number = 0;
    csvPage: number = 1;

    private statusData: any;
    options: any[] = GLOBAL_CONFIGS.ORDER_STATUSES;
    private statusOptions = GLOBAL_CONFIGS.ORDER_STATUSES_KEY_VALUE;

    isProductVisible = false;

    csvOrders: any = [];
    private csvPageSelectAll = [];
    private storedCsvOrders: any = [];

    submitting: boolean = false;

    constructor(private orderService: OrderService,
                private suborderItemService: SuborderItemService,
                private fb: FormBuilder,
                private _notification: NzNotificationService,
                private uiService: UIService,
                private suborderService: SuborderService,
                private statusChangeService: StatusChangeService,
                private exportService: ExportService,
                private authService: AuthService) {

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
        this.currentUser = this.authService.getCurrentUser();
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

        let dateSearchValue = {
            from: null,
            to: null,
        };

        if (this.searchStartDate) {
            if (this.searchStartDate.constructor.name === 'Moment') {
                dateSearchValue.from = this.searchStartDate.startOf('day').format('YYYY-MM-DD HH:mm:ss');
            } else {
                dateSearchValue.from = this.searchStartDate;
            }
        } else {
            dateSearchValue.from = moment().subtract(50, 'years').startOf('day').format('YYYY-MM-DD HH:mm:ss');
        }

        if (this.searchEndDate) {
            if (this.searchEndDate.constructor.name === 'Moment') {
                dateSearchValue.to = this.searchEndDate.endOf('day').format('YYYY-MM-DD HH:mm:ss');
            } else {
                dateSearchValue.to = this.searchEndDate;
            }
        } else {
            dateSearchValue.to = moment().endOf('day').format('YYYY-MM-DD HH:mm:ss');
        }

        let page = this.orderPage;
        let limit = this.orderLimit;
        if (forCsv) {
            page = this.csvPage;
            limit = 20;
        }

        this._isSpinning = true;
        this.orderDataSubscription = this.orderService.getAllOrdersGrid({
            date: JSON.stringify(dateSearchValue),
            status: this.statusSearchValue,
            customerName: this.customerNameFilter,
            orderNumber: this.orderNumberFilter
        }, page, limit)
            .subscribe(result => {
                console.log('getallorders', result);
                if (!forCsv) {
                    this.orderData = result.data;
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

                    if(typeof this.storedCsvOrders[page - 1] === 'undefined'){
                        this.storedCsvOrders[page - 1] = [];
                    }
                    if(typeof this.csvPageSelectAll[page - 1] === 'undefined'){
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
        console.log('selectAllCsv', isChecked);
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
        console.log('this.storedCsvOrders', this.storedCsvOrders[this.csvPage - 1]);
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
        this.subOrderUpdateSub = this.orderService.update(id, {status: $event, changed_by: this.currentUser.id}).subscribe((res) => {
            console.log(res);
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

    //Method for csv download
    dowonloadCSV(data) {

        if (!(Array.isArray(data) && data.length > 0)) {
            return false;
        }

        let csvData = [];
        data.forEach(suborderItem => {

            let allCouponCodes = '';

            if (suborderItem.all_coupons) {
                allCouponCodes = suborderItem.all_coupons.split('|').map((coupon) => {
                    return '1' + ___.padStart(coupon, 6, '0')
                });
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
                'Vandor Name': (suborderItem.vendor_name) ? suborderItem.vendor_name : 'N/a',
                'Vandor Phone': (suborderItem.vendor_phone) ? suborderItem.vendor_phone : 'N/a',
                'Customer Name': suborderItem.customer_name,
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
        ];
        this.exportService.downloadFile(csvData, header);
    }

    //Event method for submitting the form
    submitForm = ($event, value) => {
        this.submitting = true;
        let orderIds = ___.flatten(this.storedCsvOrders).map(item => {
            return item.id;
        });
        if(orderIds.length === 0){
            return false;
        }

        this.isProductVisible = false;
        this._isSpinning = true;
        this.subOrderTimeSub = this.suborderItemService.allOrderItemsByOrderIds(orderIds)
            .subscribe((result: any) => {
                console.log('submitForm', result);
                this._isSpinning = false;
                this.dowonloadCSV(result.data);
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
    };

    handleCancel = e => {
        this.isProductVisible = false;
    };


}
