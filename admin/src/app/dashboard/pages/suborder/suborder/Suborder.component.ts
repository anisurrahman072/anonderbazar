import {
    Component,
    OnInit, QueryList, ViewChildren, ViewEncapsulation
} from '@angular/core';
import {forkJoin} from "rxjs/observable/forkJoin";
import {SuborderService} from '../../../../services/suborder.service';
import {AuthService} from '../../../../services/auth.service';
import {RequisitionService} from '../../../../services/requisition.service';
import {NzNotificationService} from "ng-zorro-antd";
import {Subscription} from 'rxjs';
import {UIService} from '../../../../services/ui/ui.service';
import {ExportService} from '../../../../services/export.service';
import {StatusChangeService} from '../../../../services/statuschange.service';
import {FormBuilder, FormGroup} from '@angular/forms';
import * as moment from 'moment';
import {CourierService} from '../../../../services/courier.service';
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import {GLOBAL_CONFIGS} from "../../../../../environments/global_config";

pdfMake.vfs = pdfFonts.pdfMake.vfs;

@Component({
    selector: 'app-warehouse',
    templateUrl: './Suborder.component.html',
    encapsulation: ViewEncapsulation.None,
    styleUrls: ['./Suborder.component.css'],
})
export class SuborderComponent implements OnInit {
    @ViewChildren('dataFor') dataFor: QueryList<any>;

    modelValueAsDate: Date = new Date();
    dateTimeValue: Date = new Date();
    multiDates: Date[] = [new Date(), (new Date() as any)['fp_incr'](10)];
    rangeValue: { from: Date; to: Date } = {
        from: new Date(),
        to: (new Date() as any)['fp_incr'](10)
    };
    inlineDatePicker: Date = new Date();


    subOrderData = [];
    subOrderTotal: number;
    subOrderLimit: number = 10;
    subOrderPage: number = 1;

    dataPR = [];
    _isSpinning = true;
    _isSpinningCsv = true;
    _isSpinningPr = true;
    currentUser: any;
    selectedOption: any[] = [];
    viewNotRendered: boolean = true;

    pageCsv: number = 1;
    limitCsv: number = 10;
    totalCsv: number;
    pageAllCheckedStatusCsv: any = {};

    pagePr: number = 1;
    limitPr: number = 10;
    totalPr: number;
    pageAllCheckedStatusPr: any = {};

    nameSearchValue: string = '';

    sortValue = {
        name: null,
        price: null,
    };
    categoryId: any = null;
    subcategoryId: any = null;

    subcategorySearchOptions: any;
    categorySearchOptions: any[] = [];

    suborderNumberSearchValue: any = '';
    orderNumberSearchValue: string = '';
    suborderIdValue: string = '';
    quantitySearchValue: string = '';
    totalPriceSearchValue: string = '';
    dateSearchValue: any;
    dateSearchValue1: any;
    statusSearchValue: string = '';
    statusData: any;
    options: any[] = GLOBAL_CONFIGS.ORDER_STATUSES;
    statusOptions = GLOBAL_CONFIGS.ORDER_STATUSES_KEY_VALUE;

    private currentWarehouseSubscriprtion: Subscription;
    private currentWarehouseId: any;
    isProductVisible = false;
    validateProductForm: FormGroup;
    allOders: any = [];
    products = [];

    currentProduct: any = {};
    storeOrderIds: any = [];

    isProductVisiblePR = false;
    validateFormPR: FormGroup;
    storeOrderIdsPR: any = [];
    warehouse: any;

    constructor(private suborderService: SuborderService,
                private _notification: NzNotificationService,
                private fb: FormBuilder,
                private exportService: ExportService,
                private requisitionService: RequisitionService,
                private courierService: CourierService,
                private statusChangeService: StatusChangeService,
                private uiService: UIService,
                private authService: AuthService) {

        this.validateProductForm = this.fb.group({
            productChecked: ['', []],
        });
        this.validateFormPR = this.fb.group({
            productCheckedPR: ['', []],
            total_order: ['', []],
            pickup_carrier_name: ['', []],
            seller_name: ['', []],
            seller_phone: ['', []],
            seller_address: ['', []],
            k_a_m: ['', []],
            payment_method: ['', []],
            pickup_slot: ['', []],
            pickup_rider_name: ['', []],
            pickup_rider_contact_number: ['', []],
        });
    }

    // init the component
    ngOnInit(): void {

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
        this.currentUser = this.authService.getCurrentUser();

        this.currentWarehouseSubscriprtion = this.uiService.currentSelectedWarehouseInfo.subscribe(
            warehouseId => {
                this.currentWarehouseId = warehouseId || '';
                this.getPageData();
            }
        );
    }

    //Event method for getting all the data for the page
    getPageData() {
        this._isSpinning = true;
        this.suborderService.getAllsuborder(
            this.currentWarehouseId,
            this.subOrderPage,
            this.subOrderLimit,
            this.suborderNumberSearchValue || '',
            this.orderNumberSearchValue || '',
            this.suborderIdValue || '',
            this.quantitySearchValue || '',
            this.totalPriceSearchValue || '',
            this.dateSearchValue ? JSON.stringify(this.dateSearchValue) : '',
            this.statusSearchValue || '',
            this.categoryId || '',
            this.subcategoryId || '',
            this.filterTerm(this.sortValue.name),
            this.filterTerm(this.sortValue.price))
            .subscribe(result => {
                    this.subOrderData = result.data;
                    console.log(result);

                    this.subOrderTotal = result.total;
                    this._isSpinning = false;
                },
                result => {

                    this._isSpinning = false;
                });
    }

    //Method for showing the modal
    showProductModal = () => {
        this._isSpinningCsv = true;
        if (typeof this.pageAllCheckedStatusCsv[this.pageCsv] === 'undefined') {
            this.pageAllCheckedStatusCsv[this.pageCsv] = false;
        }
        this.suborderService.getAllsuborderForCsv(
            this.currentWarehouseId,
            this.pageCsv,
            this.limitCsv,
            this.suborderNumberSearchValue || '',
            this.orderNumberSearchValue || '',
            this.suborderIdValue || '',
            this.quantitySearchValue || '',
            this.totalPriceSearchValue || '',
            this.dateSearchValue ? JSON.stringify(this.dateSearchValue) : '',
            this.statusSearchValue || '',
            this.categoryId || '',
            this.subcategoryId || '',
            this.filterTerm(this.sortValue.name),
            this.filterTerm(this.sortValue.price))
            .subscribe(result => {

                    console.log('showProductModal', result);

                    this.totalCsv = result.total;
                    this.allOders = result.data;
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

                    this._isSpinningCsv = false;
                },
                result => {

                    this._isSpinningCsv = false;
                });

        this.isProductVisible = true;
        this.isProductVisiblePR = false;
    };
    //Method for showing the modal
    showPRModal = () => {

        if (typeof this.pageAllCheckedStatusPr[this.pagePr] === 'undefined') {
            this.pageAllCheckedStatusPr[this.pagePr] = false;
        }

        this._isSpinningPr = true;
        this.suborderService.getAllSuborderWithPR(
            this.currentWarehouseId,
            this.pagePr,
            this.limitPr,
            this.suborderNumberSearchValue || '',
            this.orderNumberSearchValue || '',
            this.suborderIdValue || '',
            this.quantitySearchValue || '',
            this.totalPriceSearchValue || '',
            this.dateSearchValue ? JSON.stringify(this.dateSearchValue) : '',
            this.statusSearchValue || '',
            this.categoryId || '',
            this.subcategoryId || '',
            this.filterTerm(this.sortValue.name),
            this.filterTerm(this.sortValue.price))
            .subscribe(result => {

                    console.log('getAllSuborderWithPR', result)

                    this.dataPR = result.data;
                    this.totalPr = result.total;
                    const thisTotal = this.dataPR.length;

                    if (this.storeOrderIdsPR && this.storeOrderIdsPR.length) {
                        for (let index = 0; index < thisTotal; index++) {
                            const foundIndex = this.storeOrderIdsPR.findIndex((storedOder) => {
                                return storedOder.id == this.dataPR[index].id;
                            });

                            this.dataPR[index].checked = foundIndex !== -1;
                        }

                    } else {
                        for (let index = 0; index < thisTotal; index++) {
                            this.dataPR[index].checked = false;
                        }
                    }
                    this._isSpinningPr = false;
                },
                result => {

                    this._isSpinningPr = false;
                });
        this.isProductVisiblePR = true;
    };

    //Event method for resetting all filters

    selectAllCsv($event) {

        const isChecked = !!$event.target.checked;
        this.pageAllCheckedStatusCsv[this.pageCsv] = isChecked;
        const len = this.allOders.length;
        for (let i = 0; i < len; i++) {
            this.allOders[i].checked = isChecked;
            this._refreshStatus(isChecked, this.allOders[i])
        }
    }

    selectAllPr($event) {
        const isChecked = !!$event.target.checked;
        this.pageAllCheckedStatusPr[this.pagePr] = isChecked;
        const len = this.dataPR.length;
        for (let i = 0; i < len; i++) {
            this.dataPR[i].checked = isChecked;
            this._refreshStatusPR(isChecked, this.dataPR[i])
        }
    }

    _refreshStatus($event, value) {

        if ($event) {
            this.storeOrderIds.push(value);
        } else {
            let findValue = this.storeOrderIds.indexOf(value);

            if (findValue !== -1) {
                this.storeOrderIds.splice(findValue, 1);
            }
        }

        // console.log('this.storeOrderIds', this.storeOrderIds)
    };

    _refreshStatusPR($event, value) {

        if ($event) {
            this.storeOrderIdsPR.push(value);
        } else {
            let findValue = this.storeOrderIdsPR.indexOf(value);
            if (findValue !== -1) {
                this.storeOrderIdsPR.splice(findValue, 1);
                this.warehouse = {
                    id: value.warehouse_id,
                    name: value.warehouse_name,
                    phone: value.warehouse_phone,
                    address: value.warehouse_address,
                };
                this.validateFormPR.patchValue({
                    seller_name: value.name,
                });
            }
        }

        let itemCount = 0;
        if (this.storeOrderIdsPR.length > 0) {
            this.storeOrderIdsPR.forEach(element => {
                itemCount += element.total_quantity;
            });
        }

        if (this.storeOrderIdsPR[0]) {

            this.validateFormPR.patchValue({
                total_order: itemCount,
                seller_name: this.storeOrderIdsPR[0].warehouse_name,
                seller_phone: this.storeOrderIdsPR[0].warehouse_phone,
                seller_address: this.storeOrderIdsPR[0].warehouse_address,
                k_a_m: this.storeOrderIdsPR[0].warehouse_name,
            });
        } else {
            this.validateFormPR.patchValue({
                total_order: '',
                seller_name: '',
                seller_phone: '',
                seller_address: '',
                k_a_m: '',
            });
        }
    };

    //Event method for setting up filter data
    sort(sortName, sortValue) {
        this.subOrderPage = 1;
        this.sortValue[sortName] = sortValue;
        this.getPageData()
    }

    //Event method for pagination change
    changePage(page: number, limit: number) {

        this.subOrderPage = page;
        this.subOrderLimit = limit;
        this.getPageData();
        return false;
    }

    changePageCsv(page: number, limit: number) {

        this.pageCsv = page;
        this.limitCsv = limit;

        this.showProductModal();
        return false;
    }

    changePagePr(page: number, limit: number) {
        this.pagePr = page;
        this.limitPr = limit;

        this.showPRModal();
        return false;
    }


    categoryIdChange($event) {
        this.subOrderPage = 1;
        const query = encodeURI($event);

        this.subcategorySearchOptions = [];
        this.subcategoryId = null;
        this.getPageData();
    }

    //Method for download csv


    changeStatusConfirm($event, id, oldStatus) {

        this.suborderService.update(id, {status: $event, changed_by: this.currentUser.id}).subscribe((res) => {
            this._notification.create('success', 'Successful Message', 'suborder has been updated successfully');
            /*
                        this.courierService.updateSuborder($event, id)
                            .subscribe(arg => {
                            });
            */

            this.getPageData();
        }, (err) => {
            this._notification.create('error', 'Error', 'suborder has not been updated successfully');
            $event = oldStatus;
        })

        this.statusChangeService.updateStatus({
            order_id: $event.product_order_id,
            suborder_id: id,
            status: $event,
            changed_by: this.currentUser.id
        })
            .subscribe(arg => this.statusData = arg);
    }

    setStatus(index, status) {
        if (!this.viewNotRendered) return;
        this.selectedOption[index] = status;
    }

    ngAfterViewInit() {
        this.dataFor.changes.subscribe(t => {
            this.viewNotRendered = false;
        })
    }

    deleteConfirm(id) {
        this.suborderService.delete(id)
            .subscribe(result => {
            });
    }

    daterangeChange() {
        if (this.dateSearchValue.from && this.dateSearchValue.to) {
            this.subOrderPage = 1;
            this.getPageData()
        }

    }

    daterange1Change() {
        console.log('called');

        if (this.dateSearchValue1.from && this.dateSearchValue1.to) {
            this.subOrderPage = 1;
            this.allOders = this.getPageData();
        }
    }

    handleOk = e => {
        this.isProductVisible = false;
    };

    handleCancel = e => {
        this.isProductVisible = false;
    };

    //Event method for submitting the form
    submitForm = ($event, value) => {
        let newlist = this.storeOrderIds;

        this.isProductVisible = false;
        this.dowonloadCSV(newlist);
    }

    handleOkPR = e => {
        this.isProductVisiblePR = false;
    };

    handleCancelPR = e => {
        this.isProductVisiblePR = false;
        this.validateFormPR.reset();
    };

    //Event method for submitting the form
    submitFormPR = ($event, value) => {
        this._isSpinningPr = true;
        try {
            const newlist = this.storeOrderIdsPR;

            const allSuborderIds = newlist.map((suborder) => {
               return suborder.id
            });

            const allApiCalls = [
                this.suborderService.massUpdatePrStatus(allSuborderIds, 1)
            ];

            let pdfDataMine = [];
            let i = 0;

            const prRequestPayloads = [];
            newlist.forEach(suborder => {

                suborder.items.forEach(item => {
                    let varients = "";

                    item.suborderItemVariants.forEach(element => {
                        varients += element.product_variant_id.name + ','
                    });
                    pdfDataMine.push({
                        'SL': ++i,
                        'Vendor': suborder.warehouse_name,
                        'Title': item.product_id.name,
                        'SKU': item.product_id.code,
                        'Size': varients,
                        'Count': item.product_quantity,
                        'Rate': item.product_id.price,
                        'Amount': item.product_total_price,
                    });
                });
                let payload = {
                    warehouse_id: suborder.warehouse_id,
                    total_quantity: pdfDataMine.reduce(function (total, currentValue) {
                        return total + currentValue.Count;
                    }, 0),
                    total_amount: pdfDataMine.reduce(function (total, currentValue) {
                        return total + currentValue.Amount;
                    }, 0),
                    info: JSON.stringify({
                        total_order: value.total_order,
                        pickup_carrier_name: value.pickup_carrier_name,
                        payment_method: value.payment_method,
                        pickup_slot: value.pickup_slot,
                        pickup_rider_name: value.pickup_rider_name,
                        pickup_rider_contact_number: value.pickup_rider_contact_number
                    }),
                    items: JSON.stringify(pdfDataMine),
                    created_by: this.currentUser.id,
                    date: new Date()
                };

                prRequestPayloads.push(payload);

            });

            const pdfDataFormattedMine = pdfDataMine.map(p => {
                return [p.SL, p.Vendor, p.Title, p.SKU, p.Size, p.Count, p.Rate, (p.Amount).toFixed(2)];
            });

            console.log('pdfDataFormattedMine', pdfDataMine, pdfDataFormattedMine)

            allApiCalls.push(this.requisitionService.insertMass(prRequestPayloads));
            forkJoin(allApiCalls).subscribe((res) => {

                let docDefinition = {
                    content: [
                        {
                            text: 'Product Requisition',
                            fontSize: 16,
                            alignment: 'center',
                            color: '#000000'
                        },
                        {
                            text: `Date: ${new Date().toDateString()}`,
                            alignment: 'left'
                        },
                        {
                            table: {
                                headerRows: 1,
                                widths: ['auto', 'auto'],
                                body: [
                                    ['Total Orders', value.total_order ? value.total_order : ''],
                                    ['Pickup Carrier Name', value.pickup_carrier_name ? value.pickup_carrier_name : ''],
                                    ['Seller Name', value.seller_name ? value.seller_name : ''],
                                    ['Seller Phone', value.seller_phone ? value.seller_phone : ''],
                                    ['Seller Address', value.seller_address ? value.seller_address : ''],
                                    ['Seller Address', value.k_a_m ? value.k_a_m : ''],
                                    ['Payment Method', value.payment_method ? value.payment_method : ''],
                                    ['Pickup Slot', value.pickup_slot ? value.pickup_slot : ''],
                                    ['Pickup Rider Name', value.pickup_rider_name ? value.pickup_rider_name : ''],
                                    ['Pickup Rider Contact Number', value.pickup_rider_contact_number ? value.pickup_rider_contact_number : ''],
                                    ['Signature', ''],
                                ]
                            },
                            style: 'sections'

                        },
                        {
                            table: {
                                headerRows: 1,
                                widths: ['auto', 'auto', '*', 'auto', 'auto', 'auto', 'auto', 'auto'],
                                body: [
                                    ['SL', 'Vendor Name', 'Title', 'SKU', 'SIZE', 'COUNT', 'RATE', 'AMOUNT'],

                                    ...pdfDataFormattedMine,
                                    [{
                                        text: 'Total Amount',
                                        colSpan: 7
                                    }, {}, {}, {}, {}, {}, {}, pdfDataMine.reduce((sum, p) => sum + (p.Amount), 0).toFixed(2)]
                                ]
                            },
                            style: 'sections'

                        }
                    ],
                    styles: {
                        sectionHeader: {
                            bold: true,
                            decoration: 'underline',
                            fontSize: 14,
                            margin: [0, 15, 0, 15]
                        },
                        sections: {
                            fontSize: 14,
                            margin: [0, 15, 0, 15]
                        }
                    }
                };
                this._isSpinningPr = false;
                pdfMake.createPdf(docDefinition).download();
                this.isProductVisiblePR = false;
                this.validateFormPR.reset();

            }, (err) => {
                console.error(err);
                this._isSpinningPr = false;
            });
        } catch (er) {
            this._isSpinningPr = false;
        }
    }


    isCsvChecked(data: any) {
        return this.storeOrderIds.findIndex((oder) => {
            return oder.id == data.id
        }) !== -1
    }

    dowonloadCSV(data) {

        let csvData = [];

        data.forEach(suborder => {
            if (suborder.items && suborder.items.length > 0) {
                suborder.items.forEach(item => {
                    let i = 0, varients = "";
                    item.suborderItemVariants.forEach(element => {
                        varients += element.variant_id.name + ': ' + element.product_variant_id.name + ' '
                    });

                    csvData.push({
                        'SL': ++i,
                        'Order Id': suborder.product_order_id.id,
                        'SubOrder Id': suborder.id,
                        'Vandor Name': (suborder.warehouse_name) ? suborder.warehouse_name : 'N/A',
                        'Vandor Phone': (suborder.warehouse_phone) ? suborder.warehouse_phone : 'N/A',
                        'Customer Name': suborder.customer_name,
                        'Customer Phone': (suborder.customer_phone) ? suborder.customer_phone : 'N/A',
                        'Product Description': item.product_id.name + ' | ' + varients,
                        'Price': item.product_id.price,
                        'Quantity': item.product_quantity,
                        'Total': item.product_total_price,
                        'Suborder Status': typeof this.statusOptions[suborder.status] !== 'undefined' ? this.statusOptions[suborder.status] : 'Unrecognized Status',
                        'Suborder Changed By': (suborder.subOrderChangedBy ? suborder.subOrderChangedBy : ''),
                        'Order Status': typeof this.statusOptions[suborder.order_status] !== 'undefined' ? this.statusOptions[suborder.order_status] : 'Unrecognized Status',
                        'Order Status Changed By': (suborder.orderChangedBy ? suborder.orderChangedBy : ''),
                        'Date': (item.date) ? item.date : 'N/A',
                        'Pending': (item.pending) ? moment(item.pending.date).format('YYYY-MM-DD') + '-' + item.pending.changed_by.first_name + ' ' + item.pending.changed_by.last_name : 'N/A',
                        'Processing': (item.processing) ? moment(item.processing.date).format('YYYY-MM-DD') + '-' + item.processing.changed_by.first_name + ' ' + item.processing.changed_by.last_name : 'N/A',
                        'Prepared': (item.prepared) ? moment(item.prepared.date).format('YYYY-MM-DD') + '-' + item.prepared.changed_by.first_name + ' ' + item.prepared.changed_by.last_name : 'N/A',
                        'Departure': (item.departure) ? moment(item.departure.date).format('YYYY-MM-DD') + '-' + item.departure.changed_by.first_name + ' ' + item.departure.changed_by.last_name : 'N/A',
                        'Pickup': (item.pickup) ? moment(item.pickup.date).format('YYYY-MM-DD') + '-' + item.pickup.changed_by.first_name + ' ' + item.pickup.changed_by.last_name : 'N/A',
                        'In the Air': (item.in_the_air) ? moment(item.in_the_air.date).format('YYYY-MM-DD') + '-' + item.in_the_air.changed_by.first_name + ' ' + item.in_the_air.changed_by.last_name : 'N/A',
                        'Landed': (item.landed) ? moment(item.landed.date).format('YYYY-MM-DD') + '-' + item.landed.changed_by.first_name + ' ' + item.landed.changed_by.last_name : 'N/A',
                        'Arrived At Warehouse': (item.arrival_at_warehouse) ? moment(item.arrival_at_warehouse.date).format('YYYY-MM-DD') + '-' + item.arrival_at_warehouse.changed_by.first_name + ' ' + item.arrival_at_warehouse.changed_by.last_name : 'N/A',
                        'Shipped': (item.shipped) ? moment(item.shipped.date).format('YYYY-MM-DD') + '-' + item.shipped.changed_by.first_name + ' ' + item.shipped.changed_by.last_name : 'N/A',
                        'Out For Delivery': (item.out_for_delivery) ? moment(item.out_for_delivery.date).format('YYYY-MM-DD') + '-' + item.out_for_delivery.changed_by.first_name + ' ' + item.out_for_delivery.changed_by.last_name : 'N/A',
                        'Delivered': (item.delivered) ? moment(item.delivered.date).format('YYYY-MM-DD') + '-' + item.delivered.changed_by.first_name + ' ' + item.delivered.changed_by.last_name : 'N/A',
                        'Canceled': (item.canceled) ? moment(item.canceled.date).format('YYYY-MM-DD') + '-' + item.canceled.changed_by.first_name + ' ' + item.canceled.changed_by.last_name : 'N/A',
                    });
                });
            }

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
            'Date',
            'Pending',
            'Processing',
            'Prepared',
            'Departure',
            'Pickup',
            'In the Air',
            'Landed',
            'Arrived At Warehouse',
            'Shipped',
            'Out For Delivery',
            'Delivered',
            'Canceled'
        ];
        this.exportService.downloadFile(csvData, header);
    }

    getStatusLabel(statusCode) {

        if (typeof this.statusOptions[statusCode] !== 'undefined') {
            return this.statusOptions[statusCode];
        }
        return 'Unrecognized Status';
    }

    //Event method for setting up form in validation
    getFormControl(name) {
        return this.validateFormPR.controls[name];
    }

    //Event method for setting up filter data
    private filterTerm(sortValue: string): string {

        switch (sortValue) {
            case ('ascend'):
                return 'ASC';
            case ('descend'):
                return 'DESC';
            default:
                return '';
        }
    }

    categoryIdSearchChange($event) {

    }

    subcategoryIdChange($event) {
        this.subOrderPage = 1;
        this.getPageData();

    }

    subcategoryIdSearchChange($event) {

    }

    resetAllFilter() {
        this.subOrderLimit = 5;
        this.subOrderPage = 1;
        this.dateSearchValue = '';
        this.nameSearchValue = '';
        this.sortValue = {
            name: null,
            price: null
        };
        this.categoryId = null;
        this.subcategoryId = null;
        this.subcategorySearchOptions = [];
        this.getPageData();

    }

}
