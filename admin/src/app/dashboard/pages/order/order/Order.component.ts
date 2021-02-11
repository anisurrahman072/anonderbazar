import {Component, OnInit, QueryList, ViewChildren} from '@angular/core';
import {OrderService} from '../../../../services/order.service';
import {AuthService} from '../../../../services/auth.service';
import {NzNotificationService} from "ng-zorro-antd";
import {Subscription} from 'rxjs';
import {UIService} from '../../../../services/ui/ui.service';
import {ExportService} from '../../../../services/export.service';
import {StatusChangeService} from '../../../../services/statuschange.service';
import {FormBuilder, FormGroup} from '@angular/forms';
import {SuborderService} from '../../../../services/suborder.service';
import {MomentDateAdapter} from '@angular/material-moment-adapter';
import * as _moment from 'moment';
import {default as _rollupMoment} from 'moment';

const moment = _rollupMoment || _moment;
import {MatDatepickerInputEvent} from "@angular/material/datepicker";
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE} from "@angular/material/core";

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
    private currentWarehouseSubscriprtion: Subscription;
    viewNotRendered: boolean = true;
    maxSearchDate: string = '';
    minSearchDate: string = '';
    searchStartDate: any;
    searchEndDate: any;

    data = [];
    _isSpinning = true;
    currentUser: any;
    selectedOption: any[] = [];
    options: any[];
    statusSearchValue: string = '';
    dateSearchValue: any;

    page: any;
    statusData: any;
    statusOptions = ['Pending', 'Processing', 'Delivered', 'Canceled'];

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


    constructor(private orderService: OrderService,
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

        this.options = [
            {value: 1, label: 'Pending', icon: 'anticon-spin anticon-loading'},
            {value: 13, label: 'Confirmed', icon: 'anticon-spin anticon-loading'},
            {value: 2, label: 'Processing', icon: 'anticon-spin anticon-loading'},
            {value: 3, label: 'Prepared', icon: 'anticon-spin anticon-loading'},
            {value: 4, label: 'Departure', icon: 'anticon-spin anticon-loading'},
            {value: 5, label: 'Pickup', icon: 'anticon-spin anticon-loading'},
            {value: 6, label: 'In the Air', icon: 'anticon-spin anticon-loading'},
            {value: 7, label: 'Landed', icon: 'anticon-spin anticon-loading'},
            {value: 8, label: 'Arrived At Warehouse', icon: 'anticon-spin anticon-loading'},
            {value: 9, label: 'Shipped', icon: 'anticon-spin anticon-hourglass'},
            {value: 10, label: 'Out For Delivery', icon: 'anticon-check-circle'},
            {value: 11, label: 'Delivered', icon: 'anticon-check-circle'},
            {value: 12, label: 'Canceled', icon: 'anticon-close-circle'},
        ];
    }

    // init the component
    ngOnInit(): void {
        this.currentUser = this.authService.getCurrentUser();
        this.getData();
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
        this.orderService.getAllOrdersForFilter({date: JSON.stringify(dateSearchValue), status: this.statusSearchValue})
            .subscribe(result => {
                this.data = result;
                this._isSpinning = false;
            }, (err) => {
                this._isSpinning = false;
            });
    }

    //Event method for resetting all filters
    resetAllFilter() {
        this.searchStartDate = '';
        this.searchEndDate = '';
        this.statusSearchValue = '';
        this.getData();
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
            // this.data[index].status = $event;
            this.getData();
        }, (err) => {
            this._notification.create('error', 'Error', 'Something went wrong');
            $event = oldStatus;
        });
        this.suborderService.updateByOrderId(id, {status: $event})
            .subscribe(arg => {

            });

        this.statusChangeService.updateStatus({order_id: id, order_status: $event, changed_by: this.currentUser.id})
            .subscribe(arg => this.statusData = arg);

    }

    //Method for csv download

    dowonloadCSV(data) {
        let csvData = [];
        data.forEach(element => {
            element.suborders.forEach(suborder => {
                suborder.items.forEach(item => {
                    let i = 0, varients = "";
                    item.suborderItemVariants.forEach(element => {
                        varients += element.variant_id.name + ': ' + element.product_variant_id.name + ' '
                    });

                    csvData.push({
                        'SL': i++,
                        'Order Id': element.id,
                        'SubOrder Id': suborder.id,
                        'Vandor Name': (item.warehouse_id) ? item.warehouse_id.name : 'N/a',
                        'Vandor Phone': (item.warehouse_id) ? item.warehouse_id.phone : 'N/a',
                        'Customer Name': element.user_id.first_name + ' ' + element.user_id.last_name,
                        'Customer Phone': (element.user_id) ? element.user_id.phone : 'N/a',
                        'Product Description': item.product_id.name + ' | ' + varients,
                        'Price': item.product_id.price,
                        'Quantity': item.product_quantity,
                        'Total': item.product_total_price,
                        'Suborder Status': this.statusOptions[suborder.status - 1],
                        'Suborder Changed By': ((element.changed_by) ? element.changed_by.first_name : '') + ' ' + ((element.changed_by) ? element.changed_by.last_name : ''),
                        'Order Status': this.statusOptions[element.status - 1],
                        'Order Status Changed By': ((element.changed_by) ? element.changed_by.first_name : '') + ' ' + ((element.changed_by) ? element.changed_by.last_name : ''),
                        'Date': (item.date) ? item.date : 'N/a'
                    });
                });
            });
        });

        const header = [
            'SL',
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
            'Date'
        ];
        this.exportService.downloadFile(csvData, header);
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
    //Method for showing the modal
    showProductModal = data => {
        this.allOders = data;
        this.isProductVisible = true;
    };
    //Event method for submitting the form
    submitForm = ($event, value) => {
        let newlist = this.storeOrderIds;

        this.isProductVisible = false;
        this.dowonloadCSV(newlist);
        console.log(newlist);

    }

    //Method for status checkbox

    _refreshStatus($event, value) {
        console.log($event);
        if ($event !== 'undefined') {
            if ($event) {
                this.storeOrderIds.push(value);
            } else {
                let findValue = this.storeOrderIds.indexOf(value);
                this.storeOrderIds.splice(findValue, 1);
            }
        }

    };
}
