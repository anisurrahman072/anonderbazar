import {
    Component,
    OnInit, QueryList, ViewChildren, ViewEncapsulation
} from '@angular/core';
import {forkJoin} from "rxjs/observable/forkJoin";
import {SuborderService} from '../../../../services/suborder.service';
import {AuthService} from '../../../../services/auth.service';
import {RequisitionService} from '../../../../services/requisition.service';
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
import {NzNotificationService} from "ng-zorro-antd";

pdfMake.vfs = pdfFonts.pdfMake.vfs;

@Component({
    selector: 'app-warehouse',
    templateUrl: './Suborder.component.html',
    encapsulation: ViewEncapsulation.None,
    styleUrls: ['./Suborder.component.css'],
})
export class SuborderComponent implements OnInit {
    @ViewChildren('dataFor') dataFor: QueryList<any>;

    data = [];
    dataPR = [];
    _isSpinning = true;
    _isSpinningCsv = true;
    _isSpinningPr = true;
    currentUser: any;
    private viewNotRendered: boolean = true;

    limit: number = 10;
    page: number = 1;
    total: number;

    pageCsv: number = 1;
    limitCsv: number = 10;
    totalCsv: number;
    pageAllCheckedStatusCsv: any = {};

    pagePr: number = 1;
    limitPr: number = 10;
    totalPr: number;
    pageAllCheckedStatusPr: any = {};

    private sortKey: string = '';
    private sortValue: string = '';

    suborderNumberSearchValue: any = '';

    suborderIdValue: string = '';
    quantitySearchValue: string = '';
    totalPriceSearchValue: string = '';
    dateSearchValue: any;

    statusSearchValue: string = '';
    statusData: any;
    options: any[] = GLOBAL_CONFIGS.ORDER_STATUSES;
    statusOptions = GLOBAL_CONFIGS.ORDER_STATUSES_KEY_VALUE;

    private currentWarehouseSubscriprtion: Subscription;
    private currentWarehouseId: any;
    isProductVisible = false;
    validateProductForm: FormGroup;
    allOders: any = [];

    storeOrderIds: any = [];

    isProductVisiblePR = false;
    validateFormPR: FormGroup;
    storeOrderIdsPR: any = [];
    warehouse: any;

    loading: boolean = false;


    constructor(private suborderService: SuborderService,
                private _notification: NzNotificationService,
                private fb: FormBuilder,
                private exportService: ExportService,
                private requisitionService: RequisitionService,
                private courierService: CourierService,
                private statusChangeService: StatusChangeService,
                private uiService: UIService,
                private authService: AuthService) {

        this.options = GLOBAL_CONFIGS.SUB_ORDER_STATUSES;
    }

    // init the component
    ngOnInit(): void {

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


        this.currentUser = this.authService.getCurrentUser();

        this.currentWarehouseSubscriprtion = this.uiService.currentSelectedWarehouseInfo.subscribe(
            warehouseId => {
                this.currentWarehouseId = warehouseId || '';
                this.getPageData();
            }
        );
    }

    //Event method for getting all the data for the page
    getPageData(event?: any) {
        if (event) {
            this.page = event;
        }
        this.loading = true;
        this._isSpinning = true;
        this.suborderService.getAllsuborder(
            this.currentWarehouseId,
            this.page,
            this.limit,
            this.suborderNumberSearchValue || '',
            this.suborderIdValue || '',
            this.quantitySearchValue || '',
            this.totalPriceSearchValue || '',
            this.dateSearchValue ? JSON.stringify(this.dateSearchValue) : '',
            this.statusSearchValue || '',
            this.sortKey,
            this.filterTerm(this.sortValue))
            .subscribe(result => {
                    this.loading = false;
                    this.data = result.data;
                    console.log(result);

                    this.total = result.total;
                    this._isSpinning = false;
                },
                result => {
                    this.loading = false;
                    this._isSpinning = false;
                });
    }

    //Method for showing the modal
    showProductModal = () => {
        this._isSpinningCsv = true;
        if (typeof this.pageAllCheckedStatusCsv[this.pageCsv] === 'undefined') {
            this.pageAllCheckedStatusCsv[this.pageCsv] = false;
        }
        this.suborderService.getAllsuborder(
            this.currentWarehouseId,
            this.pageCsv,
            this.limitCsv,
            this.suborderNumberSearchValue || '',
            this.suborderIdValue || '',
            this.quantitySearchValue || '',
            this.totalPriceSearchValue || '',
            this.dateSearchValue ? JSON.stringify(this.dateSearchValue) : '',
            this.statusSearchValue || '',
            this.sortKey,
            this.filterTerm(this.sortValue))
            .subscribe(result => {

                    console.log('csv showProductModal', result);

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
            this.suborderIdValue || '',
            this.quantitySearchValue || '',
            this.totalPriceSearchValue || '',
            this.dateSearchValue ? JSON.stringify(this.dateSearchValue) : '',
            this.statusSearchValue || '',
            this.sortKey,
            this.filterTerm(this.sortValue)
        )
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
                this.warehouse = value;
                this.validateFormPR.patchValue({
                    seller_name: this.warehouse.name,
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
            this.warehouse = this.storeOrderIdsPR[0].warehouse_id;
            this.validateFormPR.patchValue({
                total_order: itemCount,
                seller_name: this.warehouse.name,
                seller_phone: this.warehouse.phone,
                seller_address: this.warehouse.address,
                k_a_m: this.warehouse.name,
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
    sort(sort: { key: string, value: string }) {
        this.page = 1;
        this.sortKey = sort.key;
        this.sortValue = sort.value;
        this.getPageData()
    }

    //Event method for pagination change
    changePage(page: number, limit: number) {

        this.page = page;
        this.limit = limit;
        this.getPageData();
        return false;
    }

    changePageCsv(page: number) {

        this.pageCsv = page;
        this.showProductModal();
        return false;
    }

    changePagePr(page: number) {
        this.pagePr = page;
        this.showPRModal();
        return false;
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
            this.page = 1;
            this.getPageData()
        }

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


    resetAllFilter() {
        this.limit = 5;
        this.page = 1;
        this.dateSearchValue = '';

        this.sortValue = '';
        this.sortKey = '';
        this.getPageData();

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

            const allApiCalls = newlist.map((suborder) => {
                return this.suborderService.update(suborder.id, {PR_status: 1});
            })

            let pdfDataMine = [];
            let i = 0;

            newlist.forEach(suborder => {

                suborder.items.forEach(item => {
                    let varients = "";

                    item.suborderItemVariants.forEach(element => {
                        varients += element.product_variant_id.name + ','
                    });
                    pdfDataMine.push({
                        'SL': ++i,
                        'Vendor': item.warehouse_id.name,
                        'Title': item.product_id.name,
                        'SKU': item.product_id.code,
                        'Size': varients,
                        'Count': item.product_quantity,
                        'Rate': item.product_id.price,
                        'Amount': item.product_total_price,
                    });
                });
                let payload = {
                    warehouse_id: suborder.items[0].warehouse_id.id,
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

                allApiCalls.push(this.requisitionService.insert(payload))

            });

            const pdfDataFormattedMine = pdfDataMine.map(p => {
                return [p.SL, p.Vendor, p.Title, p.SKU, p.Size, p.Count, p.Rate, (p.Amount).toFixed(2)];
            });

            console.log('pdfDataFormattedMine', pdfDataMine, pdfDataFormattedMine)

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

        console.log('data',data);

        data.forEach(suborder => {
            suborder.items.forEach(item => {
                let i = 0, varients = "";
                item.suborderItemVariants.forEach(element => {
                    varients += element.variant_id.name + ': ' + element.product_variant_id.name + ' '
                });

                csvData.push({
                    'SL': ++i,
                    'Order Id': suborder.product_order_id.id,
                    'SubOrder Id': suborder.id,
                    'Vandor Name': (item.warehouse_id) ? item.warehouse_id.name : 'N/a',
                    'Vandor Phone': (item.warehouse_id) ? item.warehouse_id.phone : 'N/a',
                    'Customer Name': suborder.order.user_id.first_name + ' ' + suborder.order.user_id.last_name,
                    'Customer Phone': (suborder.order.user_id) ? suborder.order.user_id.phone : 'N/a',
                    'Product Description': item.product_id.name + ' | ' + varients,
                    'Price': item.product_id.price,
                    'Quantity': item.product_quantity,
                    'Total': item.product_total_price,
                    'Suborder Status': typeof this.statusOptions[suborder.status] !== 'undefined' ? this.statusOptions[suborder.status] : 'Unrecognized Status',
                    'Suborder Changed By': ((suborder.changed_by) ? suborder.changed_by.first_name : '') + ' ' + ((suborder.changed_by) ? suborder.changed_by.last_name : ''),
                    'Order Status': typeof this.statusOptions[suborder.status] !== 'undefined' ? this.statusOptions[suborder.order.status] : 'Unrecognized Status',
                    'Order Status Changed By': ((suborder.order.changed_by) ? suborder.order.changed_by.first_name : '') + ' ' + ((suborder.order.changed_by) ? suborder.order.changed_by.last_name : ''),
                    'Date': (item.date) ? item.date : 'N/a',
                    'Pending': (item.pending) ? moment(item.pending.date).format('YYYY-MM-DD') + '-' + item.pending.changed_by.first_name + ' ' + item.pending.changed_by.last_name : 'N/a',
                    'Processing': (item.processing) ? moment(item.processing.date).format('YYYY-MM-DD') + '-' + item.processing.changed_by.first_name + ' ' + item.processing.changed_by.last_name : 'N/a',
                    'Prepared': (item.prepared) ? moment(item.prepared.date).format('YYYY-MM-DD') + '-' + item.prepared.changed_by.first_name + ' ' + item.prepared.changed_by.last_name : 'N/a',
                    'Departure': (item.departure) ? moment(item.departure.date).format('YYYY-MM-DD') + '-' + item.departure.changed_by.first_name + ' ' + item.departure.changed_by.last_name : 'N/a',
                    'Pickup': (item.pickup) ? moment(item.pickup.date).format('YYYY-MM-DD') + '-' + item.pickup.changed_by.first_name + ' ' + item.pickup.changed_by.last_name : 'N/a',
                    'In the Air': (item.in_the_air) ? moment(item.in_the_air.date).format('YYYY-MM-DD') + '-' + item.in_the_air.changed_by.first_name + ' ' + item.in_the_air.changed_by.last_name : 'N/a',
                    'Landed': (item.landed) ? moment(item.landed.date).format('YYYY-MM-DD') + '-' + item.landed.changed_by.first_name + ' ' + item.landed.changed_by.last_name : 'N/a',
                    'Arrived At Warehouse': (item.arrival_at_warehouse) ? moment(item.arrival_at_warehouse.date).format('YYYY-MM-DD') + '-' + item.arrival_at_warehouse.changed_by.first_name + ' ' + item.arrival_at_warehouse.changed_by.last_name : 'N/a',
                    'Shipped': (item.shipped) ? moment(item.shipped.date).format('YYYY-MM-DD') + '-' + item.shipped.changed_by.first_name + ' ' + item.shipped.changed_by.last_name : 'N/a',
                    'Out For Delivery': (item.out_for_delivery) ? moment(item.out_for_delivery.date).format('YYYY-MM-DD') + '-' + item.out_for_delivery.changed_by.first_name + ' ' + item.out_for_delivery.changed_by.last_name : 'N/a',
                    'Delivered': (item.delivered) ? moment(item.delivered.date).format('YYYY-MM-DD') + '-' + item.delivered.changed_by.first_name + ' ' + item.delivered.changed_by.last_name : 'N/a',
                    'Canceled': (item.canceled) ? moment(item.canceled.date).format('YYYY-MM-DD') + '-' + item.canceled.changed_by.first_name + ' ' + item.canceled.changed_by.last_name : 'N/a',
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


}
