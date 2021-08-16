import {
    Component,
    OnInit, QueryList, ViewChildren, ViewEncapsulation
} from '@angular/core';
import {SuborderService} from '../../../../services/suborder.service';
import {AuthService} from '../../../../services/auth.service';
import {Subscription} from 'rxjs';
import {UIService} from '../../../../services/ui/ui.service';
import {ExportService} from '../../../../services/export.service';
import {StatusChangeService} from '../../../../services/statuschange.service';
import {FormBuilder} from '@angular/forms';
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";

pdfMake.vfs = pdfFonts.pdfMake.vfs;
import {RequisitionService} from '../../../../services/requisition.service';
import {NzNotificationService} from "ng-zorro-antd";

@Component({
    selector: 'app-pr-requisition',
    templateUrl: './PrRequisition.component.html',
    encapsulation: ViewEncapsulation.None,
    styleUrls: ['./PrRequisition.component.css'],
})
export class PrRequisitionComponent implements OnInit {
    @ViewChildren('dataFor') dataFor: QueryList<any>;
    modelValueAsDate: Date = new Date();
    dateTimeValue: Date = new Date();
    multiDates: Date[] = [new Date(), (new Date() as any)['fp_incr'](10)];
    rangeValue: { from: Date; to: Date } = {
        from: new Date(),
        to: (new Date() as any)['fp_incr'](10)
    };
    inlineDatePicker: Date = new Date();

    options: any[];
    data = [];
    _isSpinning = true;
    currentUser: any;
    selectedOption: any[] = [];
    viewNotRendered: boolean = true;


    limit: number = 10;
    page: number = 1;
    total: number;
    nameSearchValue: string = '';

    sortValue = {
        name: null,
        price: null,
    };
    categoryId: any = null;
    subcategoryId: any = null;

    subcategorySearchOptions: any;
    categorySearchOptions: any[] = [];

    dateSearchValue: any;
    statusOptions = ['Pending', 'Processing', 'Returned', 'Lost', 'Refund Processing', 'Refunded', 'Processed', 'Arrived At Warehouse', 'Shipped', 'Delivered', 'Canceled'];
    private currentWarehouseSubscriprtion: Subscription;
    private currentWarehouseId: any;
    isProductVisible = false;
    products = [];

    currentProduct: any = {};
    storeOrderIds: any = [];

    isProductVisiblePR = false;

    storeOrderIdsPR: any = [];
    returndata: any;
    loading: boolean = false;

    constructor(private suborderService: SuborderService,
                private _notification: NzNotificationService,
                private fb: FormBuilder,
                private requisitionService: RequisitionService,
                private exportService: ExportService,
                private statusChangeService: StatusChangeService,
                private uiService: UIService,
                private authService: AuthService) {
    }

    // init the component
    //Event method for getting all the data for the page
    ngOnInit(): void {

        this.options = [
            {value: 1, label: 'Pending', icon: 'anticon-spin anticon-loading'},
            {value: 2, label: 'Processing', icon: 'anticon-spin anticon-loading'},
            {value: 3, label: 'Returned', icon: 'anticon-spin anticon-loading'},
            {value: 4, label: 'Lost', icon: 'anticon-spin anticon-loading'},
            {value: 5, label: 'Refund Processing', icon: 'anticon-spin anticon-loading'},
            {value: 6, label: 'Refunded', icon: 'anticon-spin anticon-loading'},
            {value: 7, label: 'Processed', icon: 'anticon-spin anticon-loading'},
            {value: 8, label: 'Arrived At Warehouse', icon: 'anticon-spin anticon-loading'},
            {value: 9, label: 'Shipped', icon: 'anticon-spin anticon-hourglass'},
            {value: 11, label: 'Delivered', icon: 'anticon-check-circle'},
            {value: 12, label: 'Canceled', icon: 'anticon-close-circle'}
        ];

        this.currentUser = this.authService.getCurrentUser();

        /* console.log(this.currentUser); */

        this.currentWarehouseSubscriprtion = this.uiService.currentSelectedWarehouseInfo.subscribe(
            warehouseId => {
                this.currentWarehouseId = warehouseId || '';
            }
        );

        this.getPageData();
    }

    getPageData() {
        this.loading = true;
        this.requisitionService.getAll(this.page, this.limit)
            .subscribe(arg => {
                this.loading = false;
                this.total = arg.total;
                this.data = arg.data;
                /*console.log(this.data);*/
                this._isSpinning = false;
            }, error => {
                this.loading = false;
            });
    }

    //Event method for resetting all filters
    resetAllFilter() {
        this.limit = 5;
        this.page = 1;
        this.dateSearchValue = '';
        this.nameSearchValue = '';
        this.sortValue = {
            name: null,
            price: null
        };
        this.categoryId = null;
        this.subcategoryId = null;
        this.subcategorySearchOptions = [];

    }

    //Event method for setting up filter data
    sort(sortName, sortValue) {
        this.page = 1;
        this.sortValue[sortName] = sortValue;
    }

    //Event method for pagination change
    changePage(page: number, limit: number) {

        this.page = page;
        this.limit = limit;
        return false;
    }

    ngAfterViewInit() {
        this.dataFor.changes.subscribe(t => {
            this.viewNotRendered = false;
        })
    }

    //Method for generate PDF

    generatePDF(data) {
        data.info = JSON.parse(data.info);
        data.items = JSON.parse(data.items);
        /*console.log(data);*/
        let docDefinition = {
            content: [
                {
                    text: 'Product Requisition',
                    fontSize: 16,
                    alignment: 'center',
                    color: '#000000'
                },
                {
                    text: `Data: ${new Date(data.date).toDateString()}`,
                    alignment: 'left'
                },
                {
                    table: {
                        headerRows: 1,
                        widths: ['auto', 'auto'],
                        body: [
                            ['Total Orders', data.info.total_order],
                            ['Pickup Carrier Name', data.info.pickup_carrier_name],
                            ['Seller Name', data.warehouse_id.name],
                            ['Seller Phone', data.warehouse_id.phone],
                            ['Seller Address', data.warehouse_id.address],
                            ['Seller Address', data.warehouse_id.name],
                            ['Payment Method', data.info.payment_method],
                            ['Pickup Slot', data.info.pickup_slot],
                            ['Pickup Rider Name', data.info.pickup_rider_name],
                            ['Pickup Rider Contact Number', data.info.pickup_rider_contact_number],
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
                            // pdfData
                            ...data.items.map(p => ([p.SL, p.Vendor, p.Title, p.SKU, p.Size, p.Count, p.Rate, (p.Amount).toFixed(2)])),
                            [{
                                text: 'Total Amount',
                                colSpan: 7
                            }, {}, {}, {}, {}, {}, {}, data.items.reduce((sum, p) => sum + (p.Amount), 0).toFixed(2)]
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
        console.log(docDefinition);

        pdfMake.createPdf(docDefinition).download();
    }

    //Method for download PDF

    downloadPDF(id) {
        this.requisitionService.getById(id)
            .subscribe(arg => {
                this.returndata = arg;
                this.generatePDF(this.returndata);
            });


    }
}
