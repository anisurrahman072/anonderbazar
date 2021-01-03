import {
    Component,
    OnInit, QueryList, ViewChildren, ViewEncapsulation
} from '@angular/core';
import {SuborderService} from '../../../../services/suborder.service';
import {AuthService} from '../../../../services/auth.service';
import {RequisitionService} from '../../../../services/requisition.service';
import {NzNotificationService} from "ng-zorro-antd";
import { Subscription } from 'rxjs';
import { UIService } from '../../../../services/ui/ui.service';
import { ExportService } from '../../../../services/export.service';
import { StatusChangeService } from '../../../../services/statuschange.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import pdfMake from "pdfmake/build/pdfmake";  
import pdfFonts from "pdfmake/build/vfs_fonts";  
pdfMake.vfs = pdfFonts.pdfMake.vfs;
import * as moment from 'moment';
import { JsonPipe } from '@angular/common';
import { CourierService } from '../../../../services/courier.service';


@Component({
    selector: 'app-warehouse',
    templateUrl: './Suborder.component.html',
    encapsulation: ViewEncapsulation.None,
    styleUrls: ['./Suborder.component.css'],
})
export class SuborderComponent implements OnInit {
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
    dataPR = [];
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
        console.log(this.currentUser);
        
        this.currentWarehouseSubscriprtion = this.uiService.currentSelectedWarehouseInfo.subscribe(
            warehouseId => {
              this.currentWarehouseId = warehouseId || '';
              this.getPageData();
            }
          ); 
    }
    //Event method for getting all the data for the page
    getPageData() {
        this.suborderService.getAllsuborder(
            this.currentWarehouseId,
            this.page,
            this.limit,
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
                    this.data = result.data;
                    console.log(result);
                    
                    this.total = result.total;
                    this._isSpinning = false;
                },
                result => {
                    
                    this._isSpinning = false;
                });
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
        this.getPageData();
        
    }
      //Event method for setting up filter data
    sort(sortName, sortValue) {
        this.page = 1;
        this.sortValue[sortName] = sortValue;
        this.getPageData()
    }
      //Event method for pagination change
    changePage(page: number, limit: number) {
        
        this.page = page;
        this.limit = limit;
        this.getPageData();
        return false;
    }
     
    categoryIdChange($event) {
        this.page = 1;
        const query = encodeURI($event);
        
        this.subcategorySearchOptions = [];
        this.subcategoryId = null;
        this.getPageData();
    }
      //Method for download csv

    dowonloadCSV(data){
        let csvData = [];    
        
        data.forEach(suborder => {
            suborder.items.forEach(item => {
                let i=0, varients = "";
                item.suborderItemVariants.forEach(element => {
                    varients += element.variant_id.name + ': '+ element.product_variant_id.name+ ' '
                }); 
                
                csvData.push({
                    'SL'                        : ++i,
                    'Order Id'                  : suborder.product_order_id.id,
                    'SubOrder Id'               : suborder.id,
                    'Vandor Name'               : (item.warehouse_id) ? item.warehouse_id.name : 'N/a',
                    'Vandor Phone'              : (item.warehouse_id) ? item.warehouse_id.phone : 'N/a',
                    'Customer Name'             : suborder.order.user_id.first_name+' '+ suborder.order.user_id.last_name,
                    'Customer Phone'            : (suborder.order.user_id) ? suborder.order.user_id.phone : 'N/a',
                    'Product Description'       : item.product_id.name + ' | ' + varients,
                    'Price'                     : item.product_id.price,
                    'Quantity'                  : item.product_quantity,
                    'Total'                     : item.product_total_price,
                    'Suborder Status'           : this.statusOptions[suborder.status-1],
                    'Suborder Changed By'       : ((suborder.changed_by)?suborder.changed_by.first_name:'')+' '+ ((suborder.changed_by)?suborder.changed_by.last_name:''),
                    'Order Status'              : this.statusOptions[suborder.order.status-1],
                    'Order Status Changed By'   : ((suborder.order.changed_by)?suborder.order.changed_by.first_name:'')+' '+ ((suborder.order.changed_by)?suborder.order.changed_by.last_name:''),
                    'Date'                      : (item.date) ? item.date: 'N/a',
                    'Pending'                   : (item.pending) ? moment(item.pending.date).format('YYYY-MM-DD') + '-' + item.pending.changed_by.first_name+' '+ item.pending.changed_by.last_name: 'N/a',
                    'Processing'                : (item.processing) ? moment(item.processing.date).format('YYYY-MM-DD') + '-' + item.processing.changed_by.first_name+' '+ item.processing.changed_by.last_name: 'N/a',
                    'Prepared'                  : (item.prepared) ? moment(item.prepared.date).format('YYYY-MM-DD') + '-' + item.prepared.changed_by.first_name+' '+ item.prepared.changed_by.last_name: 'N/a',
                    'Departure'                 : (item.departure) ? moment(item.departure.date).format('YYYY-MM-DD') + '-' + item.departure.changed_by.first_name+' '+ item.departure.changed_by.last_name: 'N/a',
                    'Pickup'                    : (item.pickup) ? moment(item.pickup.date).format('YYYY-MM-DD') + '-' + item.pickup.changed_by.first_name+' '+ item.pickup.changed_by.last_name: 'N/a',
                    'In the Air'                : (item.in_the_air) ? moment(item.in_the_air.date).format('YYYY-MM-DD') + '-' + item.in_the_air.changed_by.first_name+' '+ item.in_the_air.changed_by.last_name: 'N/a',
                    'Landed'                    : (item.landed) ? moment(item.landed.date).format('YYYY-MM-DD') + '-' + item.landed.changed_by.first_name+' '+ item.landed.changed_by.last_name: 'N/a',
                    'Arrived At Warehouse'      : (item.arrival_at_warehouse) ? moment(item.arrival_at_warehouse.date).format('YYYY-MM-DD') + '-' + item.arrival_at_warehouse.changed_by.first_name+' '+ item.arrival_at_warehouse.changed_by.last_name: 'N/a',
                    'Shipped'                   : (item.shipped) ? moment(item.shipped.date).format('YYYY-MM-DD') + '-' + item.shipped.changed_by.first_name+' '+ item.shipped.changed_by.last_name: 'N/a',
                    'Out For Delivery'          : (item.out_for_delivery) ? moment(item.out_for_delivery.date).format('YYYY-MM-DD') + '-' + item.out_for_delivery.changed_by.first_name+' '+ item.out_for_delivery.changed_by.last_name: 'N/a',
                    'Delivered'                 : (item.delivered) ? moment(item.delivered.date).format('YYYY-MM-DD') + '-' + item.delivered.changed_by.first_name+' '+ item.delivered.changed_by.last_name: 'N/a',
                    'Canceled'                  : (item.canceled) ? moment(item.canceled.date).format('YYYY-MM-DD') + '-' + item.canceled.changed_by.first_name+' '+ item.canceled.changed_by.last_name: 'N/a',
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
    categoryIdSearchChange($event) {
    
    }
    
    subcategoryIdChange($event) {
        this.page = 1;
        this.getPageData();
        
    }
    
    subcategoryIdSearchChange($event) {
    
    }
    
    
    changeStatusConfirm($event, id, oldStatus) {
        
        this.suborderService.update(id, {status: $event,changed_by: this.currentUser.id}).subscribe((res) => {
            this._notification.create('success', 'Successful Message', 'suborder has been removed successfully');
            this.courierService.updateSuborder($event, id)
                .subscribe(arg => {});
            
            this.getPageData();
        }, (err) => {
            this._notification.create('error', 'Error', 'Something is missing');
            $event = oldStatus;
        })

        this.statusChangeService.updateStatus({ order_id: $event.product_order_id, suborder_id: id,status: $event, changed_by: this.currentUser.id  })
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
            this.page = 1;
            this.getPageData()
        }
        
    }
    daterange1Change() {
        console.log('called');
        
        if (this.dateSearchValue1.from && this.dateSearchValue1.to) { 
            this.page = 1;
            this.allOders = this.getPageData();
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
        this.suborderService.getAllsuborder(
            this.currentWarehouseId,
            this.page,
            200,
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
                    this.allOders = result.data; 

                    console.log(result); 
                });
        console.log(this.allOders);
        
        this.isProductVisible = true; 
        this.isProductVisiblePR = false; 
    };
    //Event method for submitting the form
    submitForm = ($event, value) => {
        let newlist = this.storeOrderIds; 
    
        this.isProductVisible = false;   
        this.dowonloadCSV(newlist);
      }
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

    handleOkPR = e => { 
        this.isProductVisiblePR = false; 
    };
    
    handleCancelPR = e => { 
        this.isProductVisiblePR = false;
        this.validateFormPR.reset(); 
    };
    //Method for showing the modal
    showPRModal = data => {  
        this.suborderService.getAllSuborderWithPR(
            this.currentWarehouseId,
            this.page,
            200,
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
                    this.dataPR = result.data;  
            });
        this.isProductVisiblePR = true; 
    };
    //Event method for submitting the form
    submitFormPR = ($event, value) => {
        let newlist = this.storeOrderIdsPR; 
        let pdfData = [];   
        console.log(newlist); 

        var i=0;
        newlist.forEach(suborder => {
            
            
            this.suborderService.update(suborder.id,{PR_status: 1}).subscribe(arg =>{

            });
            suborder.items.forEach(item => {
                let varients = "";

                item.suborderItemVariants.forEach(element => {
                    varients += element.product_variant_id.name+ ','
                }); 
                pdfData.push({
                    'SL'                        : ++i,
                    'Vendor'                    : item.warehouse_id.name,
                    'Title'                     : item.product_id.name,
                    'SKU'                       : item.product_id.code,
                    'Size'                      : varients,
                    'Count'                     : item.product_quantity,
                    'Rate'                      : item.product_id.price,
                    'Amount'                    : item.product_total_price,
                });
            });
            let payload = { 
                warehouse_id: suborder.items[0].warehouse_id.id,
                total_quantity: pdfData.reduce(function (total, currentValue) { return total + currentValue.Count;}, 0),
                total_amount: pdfData.reduce(function (total, currentValue) { return total + currentValue.Amount;}, 0),
                info: JSON.stringify({
                    total_order: value.total_order,
                    pickup_carrier_name: value.pickup_carrier_name,
                    payment_method: value.payment_method,
                    pickup_slot: value.pickup_slot,
                    pickup_rider_name: value.pickup_rider_name,
                    pickup_rider_contact_number: value.pickup_rider_contact_number
                }),
                items: JSON.stringify(pdfData),
                created_by: this.currentUser.id,
                date: new Date()
            };

            this.requisitionService.insert(payload)
                .subscribe(arg => {

                });
        }); 
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
                            ['Total Orders', value.total_order], 
                            ['Pickup Carrier Name', value.pickup_carrier_name], 
                            ['Seller Name', value.seller_name], 
                            ['Seller Phone', value.seller_phone], 
                            ['Seller Address', value.seller_address], 
                            ['Seller Address', value.k_a_m], 
                            ['Payment Method', value.payment_method], 
                            ['Pickup Slot', value.pickup_slot], 
                            ['Pickup Rider Name', value.pickup_rider_name], 
                            ['Pickup Rider Contact Number', value.pickup_rider_contact_number], 
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
                            ...pdfData.map(p => ([p.SL, p.Vendor,p.Title, p.SKU, p.Size, p.Count, p.Rate ,(p.Amount).toFixed(2)])),  
                            [{ text: 'Total Amount', colSpan:7 }, {}, {}, {},{},{},{}, pdfData.reduce((sum, p) => sum + (p.Amount), 0).toFixed(2)]  
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
         
        pdfMake.createPdf(docDefinition).download();
        this.isProductVisiblePR = false; 
        this.validateFormPR.reset(); 
    }
    _refreshStatusPR($event, value) { 
        console.log($event);
        if ($event !== 'undefined') {
            if ($event) { 
                this.storeOrderIdsPR.push(value); 
                console.log(value);

            } else {
                let findValue = this.storeOrderIdsPR.indexOf(value); 
                this.storeOrderIdsPR.splice(findValue, 1);
                this.warehouse = value;
                console.log(this.warehouse);
                
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
        }else{
            this.validateFormPR.patchValue({
                total_order: '', 
                seller_name: '', 
                seller_phone: '', 
                seller_address: '', 
                k_a_m: '', 
            });
        }
    };
}
