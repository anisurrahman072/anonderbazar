import { Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { OrderService } from '../../../../services/order.service';
import { AuthService } from '../../../../services/auth.service';
import { NzNotificationService } from "ng-zorro-antd";
import { Subscription } from 'rxjs';
import { UIService } from '../../../../services/ui/ui.service';
import { ExportService } from '../../../../services/export.service';
import { StatusChangeService } from '../../../../services/statuschange.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { SuborderService } from '../../../../services/suborder.service';
// @ts-ignore
import moment from "moment";

@Component({
    selector: 'app-warehouse',
    templateUrl: './Order.component.html',
    styleUrls: ['./Order.component.css']
})
export class OrderComponent implements OnInit {
    @ViewChildren('dataFor') dataFor: QueryList<any>;

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
    maxDate:any;

    pageOrder: number = 1;
    pageAllCheckedStatusOrder: any = {};
    dataORDER = [];
    storeOrderIdsORDER: any = [];
    warehouse: any;
    validateFormORDER: FormGroup;

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
            this.maxDate = moment().format('YYYY-MM-DD');
    }
 // init the component
    ngOnInit(): void {

        this.options = [
            { value: 1, label: 'Pending', icon: 'anticon-spin anticon-loading' },
            { value: 2, label: 'Processing', icon: 'anticon-spin anticon-hourglass' },
            { value: 11, label: 'Delivered', icon: 'anticon-check-circle' },
            { value: 12, label: 'Canceled', icon: 'anticon-close-circle' }
        ];

        this.currentUser = this.authService.getCurrentUser();
        this.getData();


    }

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
        this.orderService.update(id, { status: $event,changed_by: this.currentUser.id }).subscribe((res) => {
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

        this.statusChangeService.updateStatus({ order_id: id, order_status: $event, changed_by: this.currentUser.id  })
            .subscribe(arg => this.statusData = arg);

    }
      //Method for csv download

    dowonloadCSV(data){
        let csvData = [];
        data.forEach(element => {
            element.suborders.forEach(suborder => {
                suborder.items.forEach(item => {
                    let i=0, varients = "";
                    item.suborderItemVariants.forEach(element => {
                        varients += element.variant_id.name + ': '+ element.product_variant_id.name+ ' '
                    });

                    csvData.push({
                        'SL'                        : i++,
                        'Order Id'                  : element.id,
                        'SubOrder Id'               : suborder.id,
                        'Vandor Name'               : (item.warehouse_id) ? item.warehouse_id.name : 'N/a',
                        'Vandor Phone'              : (item.warehouse_id) ? item.warehouse_id.phone : 'N/a',
                        'Customer Name'             : element.user_id.first_name+' '+ element.user_id.last_name,
                        'Customer Phone'            : (element.user_id) ? element.user_id.phone : 'N/a',
                        'Product Description'       : item.product_id.name + ' | ' + varients,
                        'Price'                     : item.product_id.price,
                        'Quantity'                  : item.product_quantity,
                        'Total'                     : item.product_total_price,
                        'Suborder Status'           : this.statusOptions[suborder.status-1],
                        'Suborder Changed By'       : ((element.changed_by)?element.changed_by.first_name:'')+' '+ ((element.changed_by)?element.changed_by.last_name:''),
                        'Order Status'              : this.statusOptions[element.status-1],
                        'Order Status Changed By'   : ((element.changed_by)?element.changed_by.first_name:'')+' '+ ((element.changed_by)?element.changed_by.last_name:''),
                        'Date'                      : (item.date) ? item.date: 'N/a'
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
      //Event method for getting all the data for the page
    getData(){

        this.orderService.getAllOrders({
            date:this.dateSearchValue?JSON.stringify(this.dateSearchValue):''
        })
        .subscribe(result => {
            this.data = result;
            console.log(this.data);

            this._isSpinning = false;
        });
    }
      //Event method for resetting all filters
    resetAllFilter() {
        this.dateSearchValue='';
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
    orderStatusChange($event){
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
