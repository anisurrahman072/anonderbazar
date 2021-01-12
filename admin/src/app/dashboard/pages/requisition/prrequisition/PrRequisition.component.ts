import {
    Component,
    OnInit, QueryList, ViewChildren, ViewEncapsulation
} from '@angular/core';
import {SuborderService} from '../../../../services/suborder.service';
import {AuthService} from '../../../../services/auth.service';
import {NzNotificationService} from "ng-zorro-antd";
import { Subscription } from 'rxjs';
import { UIService } from '../../../../services/ui/ui.service';
import { ExportService } from '../../../../services/export.service';
import { StatusChangeService } from '../../../../services/statuschange.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
pdfMake.vfs = pdfFonts.pdfMake.vfs;
import { RequisitionService } from '../../../../services/requisition.service';


@Component({
    selector: 'app-pr-requisition',
    templateUrl: './PrRequisition.component.html',
    encapsulation: ViewEncapsulation.None,
    styleUrls: ['./PrRequisition.component.css'],
})
export class PrRequisitionComponent implements OnInit {
    @ViewChildren('dataFor') dataFor: QueryList<any>;

    basicDemoValue = '2017-01-01';
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

    suborderNumberSearchValue: any = '';
    orderNumberSearchValue: string = '';
    suborderIdValue: string = '';
    quantitySearchValue: string = '';
    totalPriceSearchValue: string = '';
    dateSearchValue: any;
    dateSearchValue1: any;
    statusSearchValue: string = '';
    statusData: any;
    statusOptions = ['Pending','Processing', 'Prepared', 'Departure', 'Pickup', 'In the Air', 'landed', 'Arrived At Warehouse', 'Shipped', 'Out For Delivery', 'Delivered', 'Canceled'];
    _dateRange: any;
    private currentWarehouseSubscriprtion: Subscription;
    private currentWarehouseId: any;
    isProductVisible = false;
    validateProductForm: FormGroup;
    allOders: any = [];
    products = [];
    addNew: boolean;
    currentProduct: any = {};
    storeOrderIds: any = [];

    isProductVisiblePR = false;
    validateFormPR: FormGroup;
    storeOrderIdsPR: any = [];
    returndata: any;
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
            { value: 1, label: 'Pending', icon: 'anticon-spin anticon-loading' },
            { value: 2, label: 'Processing', icon: 'anticon-spin anticon-loading' },
            { value: 3, label: 'Prepared', icon: 'anticon-spin anticon-loading' },
            { value: 4, label: 'Departure', icon: 'anticon-spin anticon-loading' },
            { value: 5, label: 'Pickup', icon: 'anticon-spin anticon-loading' },
            { value: 6, label: 'In the Air', icon: 'anticon-spin anticon-loading' },
            { value: 7, label: 'Landed', icon: 'anticon-spin anticon-loading' },
            { value: 8, label: 'Arrived At Warehouse', icon: 'anticon-spin anticon-loading' },
            { value: 9, label: 'Shipped', icon: 'anticon-spin anticon-hourglass' },
            { value: 10, label: 'Out For Delivery', icon: 'anticon-check-circle' },
            { value: 11, label: 'Delivered', icon: 'anticon-check-circle' },
            { value: 12, label: 'Canceled', icon: 'anticon-close-circle' }
        ];

        this.currentUser = this.authService.getCurrentUser();

        /* console.log(this.currentUser); */

        this.currentWarehouseSubscriprtion = this.uiService.currentSelectedWarehouseInfo.subscribe(
            warehouseId => {
              this.currentWarehouseId = warehouseId || '';
            }
        );

        this.requisitionService.getAll()
            .subscribe(arg => {
                this.data = arg;
                console.log(this.data);
                this._isSpinning = false;
        });

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
      //Event method for resetting all filters
    resetAllFilter() {
        this.limit = 5;
        this.page = 1;
        this.dateSearchValue='';
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

    generatePDF(data){
        data.info = JSON.parse(data.info);
        data.items= JSON.parse(data.items);
        console.log(data);
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
                        widths: ['auto', 'auto','*', 'auto', 'auto', 'auto', 'auto', 'auto'],
                        body: [
                            ['SL', 'Vendor Name','Title', 'SKU', 'SIZE', 'COUNT', 'RATE', 'AMOUNT'],
                            // pdfData
                            ...data.items.map(p => ([p.SL, p.Vendor,p.Title, p.SKU, p.Size, p.Count, p.Rate ,(p.Amount).toFixed(2)])),
                            [{ text: 'Total Amount', colSpan:7 }, {}, {}, {},{},{},{}, data.items.reduce((sum, p) => sum + (p.Amount), 0).toFixed(2)]
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

    downloadPDF(id){
        this.requisitionService.getById(id)
            .subscribe(arg => {
                this.returndata = arg;
                this.generatePDF(this.returndata);
        });




    }
}
