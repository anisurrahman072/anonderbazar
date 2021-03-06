import {Component, OnInit, QueryList, ViewChildren} from '@angular/core';
import {OrderService} from '../../../../services/order.service';
import {AuthService} from '../../../../services/auth.service';
import {NzNotificationService} from "ng-zorro-antd";
import {UIService} from '../../../../services/ui/ui.service';
import {ExportService} from '../../../../services/export.service';
import {StatusChangeService} from '../../../../services/statuschange.service';
import {FormBuilder, FormGroup} from '@angular/forms';
import {SuborderService} from '../../../../services/suborder.service';
import {MomentDateAdapter} from '@angular/material-moment-adapter';
import {MatDatepickerInputEvent} from "@angular/material/datepicker";
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE} from "@angular/material/core";
import {GLOBAL_CONFIGS} from "../../../../../environments/global_config";
import {SuborderItemService} from "../../../../services/suborder-item.service";

import * as ___ from 'lodash';
import * as _moment from 'moment';
import {default as _rollupMoment} from 'moment';
const moment = _rollupMoment || _moment;

export const MY_FORMATS = {
    parse: {
        dateInput: 'YYYY-MM-DD H:m:s',
    },
    display: {
        dateInput: 'DD/MM/YYYY',
        monthYearLabel: 'MMM YYYY',
        dateA11yLabel: 'LL',
        monthYearA11yLabel: 'MMMM YYYY',
    },
};

@Component({
    selector: 'app-warehouse',
    templateUrl: './Order.component.html',
    styleUrls: ['./Order.component.css'],
    providers: [
        // `MomentDateAdapter` can be automatically provided by importing `MomentDateModule` in your
        // application's root module. We provide it at the component level here, due to limitations of
        // our example generation script.
        {provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE]},

        {provide: MAT_DATE_FORMATS, useValue: MY_FORMATS},
    ],
})
export class OrderComponent implements OnInit {
    @ViewChildren('dataFor') dataFor: QueryList<any>;
    validateFormORDER: FormGroup;
    validateProductForm: FormGroup;
    viewNotRendered: boolean = true;
    maxSearchDate: string = '';
    minSearchDate: string = '';
    searchStartDate: any;
    searchEndDate: any;

    orderData = [];
    orderTotal: number = 0;
    orderLimit: number = 25;
    orderPage: number = 1;
    _isSpinning = true;
    currentUser: any;
    selectedOption: any[] = [];

    statusSearchValue: string = '';
    dateSearchValue: any;

    page: any;
    statusData: any;
    options: any[] = GLOBAL_CONFIGS.ORDER_STATUSES;
    statusOptions = GLOBAL_CONFIGS.ORDER_STATUSES_KEY_VALUE;

    currentWarehouseId: any;
    isProductVisible = false;

    allOders: any = [];
    products = [];
    addNew: boolean;
    currentProduct: any = {};
    storeOrderIds: any = [];
    orderStatus: any;
    maxDate: any;

    pageOrder: number = 1;
    pageAllCheckedStatusOrder: any = {};
    dataORDER = [];
    storeOrderIdsORDER: any = [];
    warehouse: any;
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
        this.maxSearchDate = moment().format('YYYY-MM-DD');
        this.minSearchDate = moment().subtract(10, 'years').format('YYYY-MM-DD');


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
    getData() {

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

        console.log('getData: ', dateSearchValue);

        this._isSpinning = true;
        this.orderService.getAllOrdersGrid({
            date: JSON.stringify(dateSearchValue),
            status: this.statusSearchValue
        }, this.orderPage, this.orderLimit)
            .subscribe(result => {
                console.log('getallorders', result);
                this.orderData = result.data;
                this.orderTotal = result.total;
                this._isSpinning = false;

            }, (err) => {
                console.log(err);
                this._isSpinning = false;
                this._notification.error('Problems!', 'Problems in loading the orders');
            });
    }

    //Event method for resetting all filters
    resetAllFilter() {
        this.searchStartDate = '';
        this.searchEndDate = '';
        this.statusSearchValue = '';
        this.orderPage = 1;
        this.getData();
    }

    // Event method for pagination change
    changePage(page: number, limit: number) {
        this.orderPage = page;
        this.orderLimit = limit;
        this.getData();
        return false;
    }

    searchDateChangeHandler(type: string, event: MatDatepickerInputEvent<String>) {

        /*
        console.log('searchDateChangeHandler: ', event.value.toString());
           if (type === 'startDate') {
               this.searchStartDate = moment(event.value.toString()).format('YYYY-MM-DD HH:mm:ss');
           } else if (type === 'endDate') {
               this.searchEndDate = moment(event.value.toString()).format('YYYY-MM-DD HH:mm:ss');
           }
        */
        this.getData();
    }

    //Method for status change
    selectAllOrder($event) {
        const isChecked = !!$event.target.checked;
        this.pageAllCheckedStatusOrder[this.pageOrder] = isChecked;
        const len = this.dataORDER.length;
        for (let i = 0; i < len; i++) {
            this.dataORDER[i].checked = isChecked;
            this._refreshStatusORDER(isChecked, this.dataORDER[i])
        }
    }

    _refreshStatusORDER($event, value) {

        if ($event) {
            this.storeOrderIdsORDER.push(value);
        } else {
            let findValue = this.storeOrderIdsORDER.indexOf(value);
            if (findValue !== -1) {
                this.storeOrderIdsORDER.splice(findValue, 1);
                this.warehouse = value;
                this.validateFormORDER.patchValue({
                    seller_name: this.warehouse.name,
                });
            }
        }

        let itemCount = 0;
        if (this.storeOrderIdsORDER.length > 0) {
            this.storeOrderIdsORDER.forEach(element => {
                itemCount += element.total_quantity;
            });
        }

        if (this.storeOrderIdsORDER[0]) {
            this.warehouse = this.storeOrderIdsORDER[0].warehouse_id;
            this.validateFormORDER.patchValue({
                total_order: itemCount,
                seller_name: this.warehouse.name,
                seller_phone: this.warehouse.phone,
                seller_address: this.warehouse.address,
                k_a_m: this.warehouse.name,
            });
        } else {
            this.validateFormORDER.patchValue({
                total_order: '',
                seller_name: '',
                seller_phone: '',
                seller_address: '',
                k_a_m: '',
            });
        }
    };

    //Method for status change

    changeStatusConfirm($event, id, oldStatus) {
        this.orderService.update(id, {status: $event, changed_by: this.currentUser.id}).subscribe((res) => {
            console.log(res);
            this._notification.create('success', 'Successful Message', 'Order status has been updated successfully');
            this.suborderService.updateByOrderId(id, {status: $event})
                .subscribe(arg => {});

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
                allCouponCodes = suborderItem.all_coupons.split(',').map((coupon) => {
                    return '1' + ___.padStart(coupon, 6, '0')
                });
            }

            let varients = "";
            /*                    item.suborderItemVariants.forEach(element => {
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
                'SSLCommerce Transaction Id': suborderItem.ssl_transaction_id ? suborderItem.ssl_transaction_id: '',
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
        let orderIds = this.storeOrderIds.map(item => {
            return item.id;
        });

        this.isProductVisible = false;
        this._isSpinning = true;
        this.suborderItemService.allOrderItemsByOrderIds(orderIds)
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
        if (!this.viewNotRendered) return;
        this.selectedOption[index] = status;
    }

    ngAfterViewInit() {
        this.dataFor.changes.subscribe(t => {
            this.viewNotRendered = false;
        })
    }

    //Method for order status change
    orderStatusChange($event) {
        this.orderStatus = $event;
    }

    //Event method for deleting order
    deleteConfirm(id) {
        this.orderService.delete(id)
            .subscribe(result => {
                console.log('deleted', result);
            });
    }

    //Event called for daterange change
    daterangeChange() {
        if (this.dateSearchValue.from && this.dateSearchValue.to) {
            this.page = 1;
            this.getData()
        }

    }

    handleOk = e => {
        this.isProductVisible = false;
    };

    handleCancel = e => {
        this.isProductVisible = false;
    };


    // Method for showing the modal
    showProductModal = data => {
        console.log('showProductModal')
        this.allOders = data.map((item) => {
            return {
                ...item,
                checked: false
            }
        });
        this.isProductVisible = true;
        this.storeOrderIds = [];
    };


    selectAllCsv($event) {

        const isChecked = !!$event.target.checked;
        console.log('selectAllCsv', isChecked);
        if (!isChecked) {
            this.storeOrderIds = [];
        }

        const len = this.allOders.length;
        for (let i = 0; i < len; i++) {
            this.allOders[i].checked = isChecked;
            if (isChecked) {
                const foundIndex = this.storeOrderIds.findIndex((storedOder) => {
                    return storedOder.id == this.allOders[i].id;
                });
                if (foundIndex === -1) {
                    this.storeOrderIds.push(this.allOders[i]);
                }
            }
        }
        console.log('this.storeOrderIds', this.storeOrderIds);
    }

    csvPageChangeHandler($event) {

        const thisTotal = this.allOders.length;

        if (this.storeOrderIds && this.storeOrderIds.length) {
            for (let index = 0; index < thisTotal; index++) {
                const foundIndex = this.storeOrderIds.findIndex((storedOder) => {
                    return storedOder.id == this.allOders[index].id;
                });
                this.allOders[index].checked = foundIndex !== -1;
            }
        } else {
            for (let index = 0; index < thisTotal; index++) {
                this.allOders[index].checked = false;
            }
        }
    }

    //Method for status checkbox

    _refreshStatus($event, value) {
        if ($event && $event.currentTarget.checked) {
            this.storeOrderIds.push(value);
        } else {
            let findValue = this.storeOrderIds.findIndex((item) => {
                return item.id == value.id
            });
            if (findValue !== -1) {
                this.storeOrderIds.splice(findValue, 1);
            }
        }
    };
}
