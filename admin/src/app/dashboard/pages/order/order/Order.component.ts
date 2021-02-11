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

    maxSearchDate: string = '';
    minSearchDate: string = '';
    searchStartDate: string;
    searchEndDate: string;

    data = [];
    _isSpinning = true;
    currentUser: any;
    selectedOption: any[] = [];
    options: any[];
    customerNameSearchValue: string = '';
    dateSearchValue: any;

    page: any;
    statusData: any;
    statusOptions = ['Pending', 'Processing', 'Delivered', 'Canceled'];
    viewNotRendered: boolean = true;
    private currentWarehouseSubscriprtion: Subscription;
    currentWarehouseId: any;
    isProductVisible = false;
    validateProductForm: FormGroup;
    allOders: any = [];
    products = [];
    addNew: boolean;
    currentProduct: any = {};
    storeOrderIds: any = [];
    orderStatus: any;
    maxDate: any;

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
    }

    // init the component
    ngOnInit(): void {

        this.options = [
            {value: 1, label: 'Pending', icon: 'anticon-spin anticon-loading'},
            {value: 2, label: 'Processing', icon: 'anticon-spin anticon-hourglass'},
            {value: 11, label: 'Delivered', icon: 'anticon-check-circle'},
            {value: 12, label: 'Canceled', icon: 'anticon-close-circle'}
        ];

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
            dateSearchValue.from = this.searchStartDate;
        } else {
            dateSearchValue.from = moment().subtract(50, 'years').format('YYYY-MM-DD') + ' 00:00:00';
        }
        if (this.searchEndDate) {
            dateSearchValue.to = this.searchEndDate;
        } else {
            dateSearchValue.to = moment().format('YYYY-MM-DD HH:mm:ss');
        }
        console.log('getData: ', dateSearchValue);

        this.orderService.getAllOrdersForFilter({date: JSON.stringify(dateSearchValue)})
            .subscribe(result => {
                this.data = result;
                this._isSpinning = false;
            }, (err) => {
                this._isSpinning = false;
            });
    }

    searchDateChangeHandler(type: string, event: MatDatepickerInputEvent<String>) {
        console.log('searchDateChangeHandler: ', event.value.toString());
        if (type === 'startDate') {
            this.searchStartDate = moment(event.value.toString()).format('YYYY-MM-DD HH:mm:ss');
        } else if (type === 'endDate') {
            this.searchEndDate = moment(event.value.toString()).format('YYYY-MM-DD HH:mm:ss');
        }
        this.getData();
    }

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


    //Event method for resetting all filters
    resetAllFilter() {
        this.dateSearchValue = '';
        this.getData();

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
