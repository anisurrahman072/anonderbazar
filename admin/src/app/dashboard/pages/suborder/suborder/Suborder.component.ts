import {
    Component,
    OnInit, QueryList, ViewChildren, ViewEncapsulation
} from '@angular/core';
import {SuborderService} from '../../../../services/suborder.service';
import {AuthService} from '../../../../services/auth.service';
import {RequisitionService} from '../../../../services/requisition.service';
import {Subscription} from 'rxjs';
import {UIService} from '../../../../services/ui/ui.service';
import {ExportService} from '../../../../services/export.service';
import {StatusChangeService} from '../../../../services/statuschange.service';
import {FormBuilder, FormGroup} from '@angular/forms';
import {CourierService} from '../../../../services/courier.service';
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import {GLOBAL_CONFIGS} from "../../../../../environments/global_config";
import {NzNotificationService} from "ng-zorro-antd";
import differenceInCalendarDays from 'date-fns/difference_in_calendar_days';
import moment from "moment";
import {SuborderItemService} from "../../../../services/suborder-item.service";
import __ from "lodash";
import {environment} from "../../../../../environments/environment";

pdfMake.fonts = {
    solaimanlipi: {
        normal: environment.ADMIN_DOMAIN + '/assets/fonts/solaiman-lipi/solaiman-lipi.ttf',
        bold: environment.ADMIN_DOMAIN + '/assets/fonts/solaiman-lipi/solaiman-lipi.ttf',
        italics: environment.ADMIN_DOMAIN + '/assets/fonts/solaiman-lipi/solaiman-lipi.ttf',
        bolditalics: environment.ADMIN_DOMAIN + '/assets/fonts/solaiman-lipi/solaiman-lipi.ttf',
    },
}
pdfMake.vfs = pdfFonts.pdfMake.vfs;
const csvHeaders = [
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
    'Suborder Status Changer',
    'Order Status',
    'Order Status Changer',
    'Date',
    'Pending',
    'Confirmed',
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

@Component({
    selector: 'app-warehouse',
    templateUrl: './Suborder.component.html',
    encapsulation: ViewEncapsulation.None,
    styleUrls: ['./Suborder.component.css'],
})
export class SuborderComponent implements OnInit {
    @ViewChildren('dataFor') dataFor: QueryList<any>;

    private readonly today: any = null;
    dateRangeModel: any = [];
    data = [];
    dataPR = [];
    _isSpinning = true;
    _isSpinningCsv = true;
    _isSpinningPr = true;
    currentUser: any;
    private viewNotRendered: boolean = true;

    limit: number = 15;
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

    private dateRangeFilter: any = {
        to: null,
        from: null
    };
    orderNumberSearchValue: any = '';
    suborderNumberSearchValue: any = '';
    vendorNameValue: string = '';
    quantitySearchValue: string = '';
    totalPriceSearchValue: string = '';

    statusSearchValue: string = '';
    statusData: any;
    options: any[] = GLOBAL_CONFIGS.ORDER_STATUSES;
    private statusOptions = GLOBAL_CONFIGS.SUB_ORDER_STATUSES_KEY_VALUE;
    private statusOptionsMapping = GLOBAL_CONFIGS.SUB_ORDER_STATUSES_MAPPING;
    private OrderStatusOptions = GLOBAL_CONFIGS.ORDER_STATUSES_KEY_VALUE;

    private currentWarehouseSubscriprtion: Subscription;
    private currentWarehouseId: any;
    isProductVisible = false;
    validateProductForm: FormGroup;
    subOrdersForCsv: any = [];

    private selectedSubOrderIds: any = [];
    private selectedSubOrderIdsPr: any = [];
    isProductVisiblePR = false;
    validateFormPR: FormGroup;

    warehouse: any;

    loading: boolean = false;


    constructor(
        private suborderService: SuborderService,
        private suborderItemService: SuborderItemService,
        private _notification: NzNotificationService,
        private fb: FormBuilder,
        private exportService: ExportService,
        private requisitionService: RequisitionService,
        private courierService: CourierService,
        private statusChangeService: StatusChangeService,
        private uiService: UIService,
        private authService: AuthService
    ) {

        this.options = GLOBAL_CONFIGS.SUB_ORDER_STATUSES;
        this.today = moment();
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
                this.getSubOrderData();
            }
        );
    }
    resetAllFilter() {
        this.limit = 15;
        this.page = 1;
        this.orderNumberSearchValue = '';
        this.suborderNumberSearchValue = '';
        this.vendorNameValue = '';
        this.quantitySearchValue = '';
        this.totalPriceSearchValue = '';
        this.dateRangeFilter = {
            to: null,
            from: null
        };
        this.dateRangeModel = [];
        this.statusSearchValue = '';
        this.sortValue = '';
        this.sortKey = '';
        this.getSubOrderData();

    }
    //Event method for getting all the data for the page
    getSubOrderData(event?: any) {
        if (event) {
            this.page = event;
        }
        this.loading = true;
        this._isSpinning = true;
        this.suborderService.getAllsuborder(
            this.currentWarehouseId,
            this.page,
            this.limit,
            this.orderNumberSearchValue || '',
            this.suborderNumberSearchValue || '',
            this.vendorNameValue || '',
            this.quantitySearchValue || '',
            this.totalPriceSearchValue || '',
            JSON.stringify(this.dateRangeFilter),
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

    showCsvModal() {
        this.isProductVisible = true;
        this.isProductVisiblePR = false;
        this.pageAllCheckedStatusCsv = [];
        this.selectedSubOrderIds = [];
        this.getDataForCsv();
    }

    showPRModal() {
        this.isProductVisible = false;
        this.isProductVisiblePR = true;
        this.pageAllCheckedStatusPr = [];
        this.selectedSubOrderIdsPr = [];

        this.getDataForPr();
    }

    //Method for showing the modal
    getDataForCsv = () => {
        this._isSpinningCsv = true;
        if (typeof this.pageAllCheckedStatusCsv[this.pageCsv] === 'undefined') {
            this.pageAllCheckedStatusCsv[this.pageCsv] = false;
        }
        this.suborderService.getAllsuborder(
            this.currentWarehouseId,
            this.pageCsv,
            this.limitCsv,
            this.orderNumberSearchValue || '',
            this.suborderNumberSearchValue || '',
            this.vendorNameValue || '',
            this.quantitySearchValue || '',
            this.totalPriceSearchValue || '',
            JSON.stringify(this.dateRangeFilter),
            this.statusSearchValue || '',
            this.sortKey,
            this.filterTerm(this.sortValue))
            .subscribe(result => {
                    this.totalCsv = result.total;
                    this.subOrdersForCsv = result.data;
                    const thisTotal = this.subOrdersForCsv.length;

                    if (this.selectedSubOrderIds && this.selectedSubOrderIds.length) {
                        for (let index = 0; index < thisTotal; index++) {
                            const foundIndex = this.selectedSubOrderIds.findIndex((subOrderId) => {
                                return subOrderId == this.subOrdersForCsv[index].id;
                            });
                            this.subOrdersForCsv[index].checked = foundIndex !== -1;
                        }
                    } else {
                        for (let index = 0; index < thisTotal; index++) {
                            this.subOrdersForCsv[index].checked = false;
                        }
                    }

                    this._isSpinningCsv = false;
                },
                result => {

                    this._isSpinningCsv = false;
                });


    };
    //Method for showing the modal
    getDataForPr = () => {

        if (typeof this.pageAllCheckedStatusPr[this.pagePr] === 'undefined') {
            this.pageAllCheckedStatusPr[this.pagePr] = false;
        }

        this._isSpinningPr = true;
        this.suborderService.getAllSuborderWithPR(
            this.currentWarehouseId,
            this.pagePr,
            this.limitPr,
            this.suborderNumberSearchValue || '',
            this.vendorNameValue || '',
            this.quantitySearchValue || '',
            this.totalPriceSearchValue || '',
            JSON.stringify(this.dateRangeFilter),
            this.statusSearchValue || '',
            this.sortKey,
            this.filterTerm(this.sortValue)
        )
            .subscribe(result => {

                    console.log('getAllSuborderWithPR', result)

                    this.dataPR = result.data;
                    this.totalPr = result.total;
                    const thisTotal = this.dataPR.length;

                    if (this.selectedSubOrderIdsPr && this.selectedSubOrderIdsPr.length) {
                        for (let index = 0; index < thisTotal; index++) {
                            const foundIndex = this.selectedSubOrderIdsPr.findIndex((storedOder) => {
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

    };

    //Event method for resetting all filters
    selectAllCsv($event) {

        const isChecked = this.pageAllCheckedStatusCsv[this.pageCsv] ? false : true;
        this.pageAllCheckedStatusCsv[this.pageCsv] = isChecked;
        const len = this.subOrdersForCsv.length;
        for (let i = 0; i < len; i++) {
            this.subOrdersForCsv[i].checked = isChecked;
            let findValue = this.selectedSubOrderIds.indexOf(this.subOrdersForCsv[i].id);
            if(isChecked){
                if(findValue === -1){
                    this.selectedSubOrderIds.push(this.subOrdersForCsv[i].id);
                }
            }
            else {
                if(findValue !== -1){
                    this.selectedSubOrderIds.splice(findValue, 1);
                }
            }
        }
    }

    onCsvSelectionChange(index, value) {
        let findValue = this.selectedSubOrderIds.indexOf(value);

        if(findValue !== -1){
            this.subOrdersForCsv[index].checked = false;
            this.selectedSubOrderIds.splice(findValue, 1);
            if(this.pageAllCheckedStatusCsv[this.pageCsv]){
                this.pageAllCheckedStatusCsv[this.pageCsv] = false;
            }
        }
        else {
            this.subOrdersForCsv[index].checked = true;
            this.selectedSubOrderIds.push(value);
        }
    };

    selectAllPr($event) {
        const isChecked = !!$event.target.checked;
        this.pageAllCheckedStatusPr[this.pagePr] = isChecked;
        const len = this.dataPR.length;
        for (let i = 0; i < len; i++) {
            this.dataPR[i].checked = isChecked;
            this.onPrSelectionChange(isChecked, this.dataPR[i]);
        }
        console.log('selectAllPr', this.selectedSubOrderIdsPr);
    }

    onPrSelectionChange($event, value) {

        if ($event) {
            this.selectedSubOrderIdsPr.push(value);
        } else {

            const foundIndex = this.selectedSubOrderIdsPr.findIndex((storedOder) => {
                return storedOder.id == value.id;
            });

            console.log('onPrSelectionChange', value.id, foundIndex);
            if (foundIndex !== -1) {
                this.selectedSubOrderIdsPr.splice(foundIndex, 1);
            }
        }

        let itemCount = 0;
        if (this.selectedSubOrderIdsPr.length > 0) {
            this.selectedSubOrderIdsPr.forEach(element => {
                itemCount += parseFloat(element.total_quantity);
            });
        }

        if (this.selectedSubOrderIdsPr.length > 0) {
            this.warehouse = this.selectedSubOrderIdsPr[0].warehouse_id;
            this.validateFormPR.patchValue({
                total_order: itemCount,
                seller_name: this.selectedSubOrderIdsPr[0].warehouse_name,
                seller_phone: this.selectedSubOrderIdsPr[0].warehouse_phone,
                seller_address: this.selectedSubOrderIdsPr[0].warehouse_address,
                k_a_m: this.selectedSubOrderIdsPr[0].warehouse_name,
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
        this.getSubOrderData()
    }

    //Event method for pagination change
    changePage(page: number, limit: number) {

        this.page = page;
        this.limit = limit;
        this.getSubOrderData();
        return false;
    }

    changePageCsv(page: number) {

        this.pageCsv = page;
        this.getDataForCsv();
        return false;
    }

    changePagePr(page: number) {
        this.pagePr = page;
        this.getDataForPr();
        return false;
    }

    //Method for download csv
    changeStatusConfirm($event, id, oldStatus) {

        this.suborderService.update(id, {status: $event, changed_by: this.currentUser.id}).subscribe((res) => {
            this._notification.create('success', 'Successful Message', 'suborder has been updated successfully');
            this.getSubOrderData();
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

   handleOk = e => {
        this.isProductVisible = false;
    };

    handleCancel = e => {
        this.isProductVisible = false;
    };

    //Event method for submitting the form
    submitFormCSV = ($event, value) => {
        // this.isProductVisible = false;
        this.dowonloadCSV(this.selectedSubOrderIds);
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

            const allSelectedSubOrderIds = this.selectedSubOrderIdsPr.map((suborder) => {
                return suborder.id;
            })
            this._isSpinningPr = true;
            this.suborderItemService.allSubOrderItemsBySubOrderIds(allSelectedSubOrderIds, false)
                .subscribe((res: any) => {
                    const subOrders = __.groupBy(res.data, 'suborder_id');
                    let pdfDataAll = [];
                    let allPayloads = [];
                    let count = 1;
                    __.forEach(subOrders, (items, subOrderId) => {
                        let pdfDataMine = [];
                        items.forEach((item, i) => {
                            let varients = "";

                            /*                          item.suborderItemVariants.forEach(element => {
                                                            varients += element.product_variant_id.name + ','
                                                        });
                            */
                            let price = item.vendor_price === 0.0000 ? item.price : item.vendor_price;
                            const itemData = {
                                'SL': i + 1,
                                'Vendor': item.vendor_name,
                                'Title': item.product_name,
                                'SKU': item.product_code,
                                'Size': varients,
                                'Count': item.product_quantity,
                                'Rate': price,
                                'Amount': item.product_total_price,
                            };
                            pdfDataMine.push(itemData);
                            pdfDataAll.push({
                                ...itemData,
                                SL: count++
                            });

                            allPayloads.push({
                                warehouse_id: item.warehouse_id,
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
                            });

                        });
                    });

                    const pdfDataFormattedMine = pdfDataAll.map(p => {
                        return [p.SL, p.Vendor, p.Title, p.SKU, p.Size, p.Count, p.Rate, (p.Amount).toFixed(2)];
                    });

                    console.log('pdfDataFormattedMine', pdfDataAll, pdfDataFormattedMine)

                    this.requisitionService.insertMass({
                        suborder_ids: allSelectedSubOrderIds,
                        allPayloads
                    }).subscribe((res) => {

                        console.log('Mass PR Status', res);

                        let docDefinition = {
                            pageSize: 'TABLOID',
                            pageOrientation: 'landscape',
                            pageMargins: [40, 60, 40, 60],
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
                                            }, {}, {}, {}, {}, {}, {}, pdfDataAll.reduce((sum, p) => sum + (p.Amount), 0).toFixed(2)]
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
                                },
                            },
                            defaultStyle: {
                                font: 'solaimanlipi'
                            }
                        };
                        pdfMake.tableLayouts = {
                            exampleLayout: {
                                hLineWidth: function (i, node) {
                                    if (i === 0 || i === node.table.body.length) {
                                        return 0;
                                    }
                                    return (i === node.table.headerRows) ? 2 : 1;
                                },
                                vLineWidth: function (i) {
                                    return 0;
                                },
                                hLineColor: function (i) {
                                    return i === 1 ? 'black' : '#aaa';
                                },
                                paddingLeft: function (i) {
                                    return i === 0 ? 0 : 8;
                                },
                                paddingRight: function (i, node) {
                                    return (i === node.table.widths.length - 1) ? 0 : 8;
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
                }, () => {
                    this._isSpinningPr = false;
                })
        } catch (er) {
            this._isSpinningPr = false;
        }
    }


    isCsvChecked(data: any) {
        return this.selectedSubOrderIds.findIndex((subOrderId) => {
            return subOrderId == data.id

        }) !== -1
    }

    private dowonloadCSV(selectedSubOrderIds) {

        const getSubOrderStatuses = (allStatuses, subOrderId, status) => {
            if (!__.isEmpty(allStatuses) && !__.isNil(allStatuses[subOrderId]) && !__.isNil(allStatuses[subOrderId][status])) {
                return moment(allStatuses[subOrderId][status].status_date).format('DD/MM/YYYY h:m a') + '-' + allStatuses[subOrderId][status].changed_by_name;
            }
            return 'N/A';
        }
        this._isSpinning = true;
        this.suborderItemService.allSubOrderItemsBySubOrderIds(selectedSubOrderIds)
            .subscribe((result: any) => {
                console.log('dowonloadCSV', result);

                let allStatuses = null;
                if (result.subOrderStatuses && result.subOrderStatuses.length > 0) {
                    allStatuses = __.groupBy(result.subOrderStatuses, 'suborder_id');
                    __.forEach(allStatuses, (value, key) => {
                        console.log('value', value);
                        allStatuses[key] = __.keyBy(value, 'suborder_status');
                    });

                }
                if (result.data && result.data.length > 0) {
                    const csvData = result.data.map((item, i) => {

                        let varients = '';

                        return {
                            'SL': i + 1,
                            'Order Id': item.order_id,
                            'SubOrder Id': item.suborder_id,
                            'Vandor Name': (item.vendor_name) ? item.vendor_name : 'N/A',
                            'Vandor Phone': (item.vendor_phone) ? item.vendor_phone : 'N/A',
                            'Customer Name': item.customer_name,
                            'Customer Phone': (item.customer_phone) ? item.customer_phone : 'N/A',
                            'Product Description': item.product_name + ' | ' + varients,
                            'Price': item.price,
                            'Quantity': item.product_quantity,
                            'Total': item.product_total_price,
                            'Suborder Status': typeof this.statusOptions[item.sub_order_status] !== 'undefined' ? this.statusOptions[item.sub_order_status] : 'Unrecognized Status',
                            'Suborder Status Changer': item.suborder_changed_by_name ? item.suborder_changed_by_name : '',
                            'Order Status': typeof this.OrderStatusOptions[item.order_status] !== 'undefined' ? this.OrderStatusOptions[item.order_status] : 'Unrecognized Status',
                            'Order Status Changer': item.order_changed_by_name ? item.order_changed_by_name : '',
                            'Date': item.suborder_item_date ? moment(item.suborder_item_date).format('DD/MM/YYYY h:m a') : 'N/A',

                            'Pending': getSubOrderStatuses(allStatuses, item.suborder_id, this.statusOptionsMapping.pending),
                            'Confirmed': getSubOrderStatuses(allStatuses, item.suborder_id, this.statusOptionsMapping.confirmed),
                            'Processing': getSubOrderStatuses(allStatuses, item.suborder_id, this.statusOptionsMapping.processing),
                            'Prepared': getSubOrderStatuses(allStatuses, item.suborder_id, this.statusOptionsMapping.prepared),
                            'Departure': getSubOrderStatuses(allStatuses, item.suborder_id, this.statusOptionsMapping.departure),
                            'Pickup': getSubOrderStatuses(allStatuses, item.suborder_id, this.statusOptionsMapping.pickup),
                            'In the Air': getSubOrderStatuses(allStatuses, item.suborder_id, this.statusOptionsMapping.in_the_air),
                            'Landed': getSubOrderStatuses(allStatuses, item.suborder_id, this.statusOptionsMapping.landed),
                            'Arrived At Warehouse': getSubOrderStatuses(allStatuses, item.suborder_id, this.statusOptionsMapping.arrived_at_warehouse),
                            'Shipped': getSubOrderStatuses(allStatuses, item.suborder_id, this.statusOptionsMapping.shipped),
                            'Out For Delivery': getSubOrderStatuses(allStatuses, item.suborder_id, this.statusOptionsMapping.out_for_delivery),
                            'Delivered': getSubOrderStatuses(allStatuses, item.suborder_id, this.statusOptionsMapping.delivered),
                            'Canceled': getSubOrderStatuses(allStatuses, item.suborder_id, this.statusOptionsMapping.canceled),
                        };
                    });


                    this.exportService.downloadFile(csvData, csvHeaders);
                }
                this._isSpinning = false;
            }, (error) => {
                this._isSpinning = false;
            });


    }

    disabledDate = (current: Date): boolean => {
        // Can not select days before today and today
        return differenceInCalendarDays(current, this.today.valueOf()) > 0;
    };

    onDateRangeChange(result: any) {
        this.dateRangeFilter = {
            from: result[0],
            to: result[1],
        }
        this.page = 1;
        this.getSubOrderData();
    }
}
