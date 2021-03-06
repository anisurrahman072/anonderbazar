import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {OrderService} from "../../../../services/order.service";
import {NzNotificationService} from "ng-zorro-antd";
import {GLOBAL_CONFIGS, ORDER_TYPE} from "../../../../../environments/global_config";
import * as ___ from 'lodash';
import {AuthService} from "../../../../services/auth.service";
import * as _moment from "moment";
import {default as _rollupMoment} from "moment";
import {ExportService} from "../../../../services/export.service";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {FileHolder, ImageUploadComponent, UploadMetadata} from "angular2-image-upload";
import {PaymentService} from "../../../../services/payment.service";
import {environment} from "../../../../../environments/environment";
import {DesignImagesService} from "../../../../services/design-images.service";
const moment = _rollupMoment || _moment;

@Component({
    selector: 'app-canceled-order',
    templateUrl: './canceled-order.component.html',
    styleUrls: ['./canceled-order.component.css']
})
export class CanceledOrderComponent implements OnInit {

    page: number = 1;
    limit: number = 20;
    total: any;
    cancelledOrders: any = null;
    _isSpinning = true;

    options: any[] = GLOBAL_CONFIGS.REFUND_STATUS;
    statusSearchValue: any = null;

    currentUser: any;
    PAYMENT_STATUS_CHANGE_ADMIN_USER = GLOBAL_CONFIGS.PAYMENT_STATUS_CHANGE_ADMIN_USER;
    isAllowedToUpdateRefundStatus: boolean = false;

    isCancelOrdersBulkVisible = false;
    searchStartDateOrdersBulk: any;
    searchEndDateOrdersBulk: any;

    private statusOptions = GLOBAL_CONFIGS.ORDER_STATUSES_KEY_VALUE;

    remove_zero_payment:boolean = false;
    isMakePaymentModalVisible: boolean = false;
    validateForm: FormGroup;

    ImageFrontFile = [];
    storeImageFileName: File[] = [];

    currentOrderId: any;
    currentOrderDueAmount: any;

    orderNumberFilter: string = '';
    searchStartDate: any;
    searchEndDate: any;
    dateSearchValue = {
        from: null,
        to: null,
    }
    customerNameFilter: string = '';

    submittingMakePayment: boolean = false;
    IMAGE_ENDPOINT = environment.IMAGE_ENDPOINT;

    @ViewChild('ImageUploadComponent') ImageUploadComponent: ImageUploadComponent;

    constructor(
        private orderService: OrderService,
        private _notification: NzNotificationService,
        private authService: AuthService,
        private exportService: ExportService,
        private fb: FormBuilder,
        private paymentService: PaymentService,
        private designImagesService: DesignImagesService
    ) {
    }

    ngOnInit() {
        this.validateForm = this.fb.group({
            dueAmount: ['', [Validators.required]]
        });

        this.getPageData();
        this.currentUser = this.authService.getCurrentUser();
        if(this.currentUser.id == this.PAYMENT_STATUS_CHANGE_ADMIN_USER){
            this.isAllowedToUpdateRefundStatus = true;
        }
    }

    getPageData($event?: any) {
        this._isSpinning = true;
        if ($event) {
            this.page = $event;
        }

        if (this.searchStartDate) {
            if (this.searchStartDate.constructor.name === 'Moment') {
                this.dateSearchValue.from = this.searchStartDate.startOf('day').format('YYYY-MM-DD 00:00:00');
            } else {
                this.dateSearchValue.from = this.searchStartDate;
            }
        } else {
            this.dateSearchValue.from = moment().subtract(50, 'years').startOf('day').format('YYYY-MM-DD 00:00:00');
        }

        if (this.searchEndDate) {
            if (this.searchEndDate.constructor.name === 'Moment') {
                this.dateSearchValue.to = this.searchEndDate.endOf('day').format('YYYY-MM-DD 23:59:59');
            } else {
                this.dateSearchValue.to = this.searchEndDate;
            }
        } else {
            this.dateSearchValue.to = moment().endOf('day').format('YYYY-MM-DD 23:59:59');
        }

        console.log(this.page, this.limit);

        this.orderService.getCancelledOrder(this.page, this.limit, {
            status: this.statusSearchValue,
            removeZeroPayment: this.remove_zero_payment,
            orderIdSearchValue: this.orderNumberFilter,
            date: JSON.stringify(this.dateSearchValue),
            customerName: this.customerNameFilter
        })
            .subscribe(orders => {
                this._isSpinning = false;
                this.total = orders.totalOrder;
                this.cancelledOrders = orders.data;
            });
    }

    refundCancelOrder($event, id, status) {
        this._isSpinning = true;
        console.log('The status', id, status);
        if (status == 0) {
            this._notification.create('error', 'This order already has been refunded!', 'Already refunded!');
            return false;
        }
        this.orderService.refundCancelOrder(id, status).subscribe(() => {
            this._notification.create('success', 'Refund completed successfully', 'Succeeded');
            this.getPageData();
            this._isSpinning = false;
        }, error => {
            this._notification.create('error', 'Error occurred while refunding for the order!', error.error);
            this._isSpinning = false;
        })
    }

    showCancelOrdersBalkModal() {
        this.isCancelOrdersBulkVisible = true;
    }

    handleOk = e => {
        this.isCancelOrdersBulkVisible = false;
        this.isMakePaymentModalVisible = false;
    };

    handleCancel = e => {
        this.isCancelOrdersBulkVisible = false;
        this.isMakePaymentModalVisible = false;
    };

    onSubmitOrdersBulkDownload() {
        this.isCancelOrdersBulkVisible = false;
        if (!this.searchStartDateOrdersBulk) {
            this._notification.error('Missing Start date!', 'Please provide start date!');
        }

        let dateSearchValue = {
            from: null,
            to: null,
        };


        if (this.searchStartDateOrdersBulk) {
            if (this.searchStartDateOrdersBulk.constructor.name === 'Moment') {
                dateSearchValue.from = this.searchStartDateOrdersBulk.startOf('day').format('YYYY-MM-DD HH:mm:ss');
            } else {
                dateSearchValue.from = this.searchStartDateOrdersBulk;
            }
        } else {
            dateSearchValue.from = moment().subtract(50, 'years').startOf('day').format('YYYY-MM-DD HH:mm:ss');
        }

        if (this.searchEndDateOrdersBulk) {
            if (this.searchEndDateOrdersBulk.constructor.name === 'Moment') {
                dateSearchValue.to = this.searchEndDateOrdersBulk.endOf('day').format('YYYY-MM-DD HH:mm:ss');
            } else {
                dateSearchValue.to = this.searchEndDateOrdersBulk;
            }
        } else {
            dateSearchValue.to = moment().endOf('day').format('YYYY-MM-DD HH:mm:ss');
        }


        this.orderService.getOrdersByDate({
            date: JSON.stringify(dateSearchValue)
        }, true)
            .subscribe(result => {
                console.log("result is: ", result);
                if (!(Array.isArray(result) && result.length > 0)) {
                    this._notification.info('Not found!', 'No product found in this time');
                    return false;
                }
                let csvData = [];
                let varients = "";
                result.forEach(suborderItem => {
                    csvData.push({
                        'Order Date': _moment(suborderItem.orderCreatedAt).format('DD-MM-YYYY'),
                        'Order Time': _moment(suborderItem.orderCreatedAt).format('h:m a'),
                        'Order Id': suborderItem.order_id,
                        'SubOrder Id': suborderItem.suborder_id,
                        'Customer Name': suborderItem.customer_name ? suborderItem.customer_name.split(',').join('-').trim() : 'N/a',
                        'Customer Phone': (suborderItem.customer_phone) ? suborderItem.customer_phone : 'N/a',
                        'Customer Division': suborderItem.division_name ? suborderItem.division_name.split(',').join('/').trim() : 'N/a',
                        'Customer District': suborderItem.zila_name ? suborderItem.zila_name.split(',').join('/').trim() : 'N/a',
                        'Customer Upazila': suborderItem.upazila_name ? suborderItem.upazila_name.split(',').join('/').trim() : 'N/a',
                        'Customer House/Road/Block/Village': suborderItem.address ? suborderItem.address.split(',').join('/').trim() : 'N/a',
                        'Category': suborderItem.categoryName ? suborderItem.categoryName.split(',').join('-').trim() : 'N/a',
                        'Product Name': suborderItem.product_name ? suborderItem.product_name.split(',').join('-').trim() : 'N/a',
                        'Product SKU': suborderItem.product_code,
                        'MRP': suborderItem.originalPrice,
                        'Vendor Price': suborderItem.vendorPrice,
                        'Discount Price': suborderItem.discountPrice,
                        'Quantity': suborderItem.product_quantity,
                        'Shipping Charge': suborderItem.courier_charge,
                        'Total': suborderItem.product_total_price,
                        'Grand Total': suborderItem.total_price,
                        'Payment Method': suborderItem.paymentType,
                        'Transaction ID': suborderItem.transactionKey,
                        'Payment Amount': suborderItem.order_type === ORDER_TYPE.REGULAR_ORDER_TYPE ? suborderItem.paid_amount : suborderItem.paymentAmount,
                        'Transaction Time': _moment(suborderItem.transactionTime).format('DD-MM-YYYY h:m a'),
                        'Remaining Amount': suborderItem.dueAmount,
                        'Vendor Name': (suborderItem.vendor_name) ? suborderItem.vendor_name.split(',').join('-').trim() : 'N/a',
                        'Vendor Phone': (suborderItem.vendor_phone) ? suborderItem.vendor_phone : 'N/a',
                        'Vendor Address': suborderItem.vendor_address ? suborderItem.vendor_address.split(',').join('/').trim() : 'N/a',
                        'Suborder Status': typeof this.statusOptions[suborderItem.sub_order_status] !== 'undefined' ? this.statusOptions[suborderItem.sub_order_status] : 'Unrecognized Status',
                        'Suborder Changed By': ((suborderItem.suborder_changed_by_name) ? suborderItem.suborder_changed_by_name : ''),
                        'Order Status': typeof this.statusOptions[suborderItem.order_status] !== 'undefined' ? this.statusOptions[suborderItem.order_status] : 'Unrecognized Status',
                        'Order Status Changed By': ((suborderItem.order_changed_by_name) ? suborderItem.order_changed_by_name : ''),
                    });
                });
                const header = [
                    'Order Date',
                    'Order Time',
                    'Order Id',
                    'SubOrder Id',
                    'Customer Name',
                    'Customer Phone',
                    'Customer Division',
                    'Customer District',
                    'Customer Upazila',
                    'Customer House/Road/Block/Village',
                    'Category',
                    'Product Name',
                    'Product SKU',
                    'MRP',
                    'Vendor Price',
                    'Discount Price',
                    'Quantity',
                    'Shipping Charge',
                    'Total',
                    'Grand Total',
                    'Payment Method',
                    'Transaction ID',
                    'Payment Amount',
                    'Transaction Time',
                    'Remaining Amount',
                    'Vendor Name',
                    'Vendor Phone',
                    'Vendor Address',
                    'Suborder Status',
                    'Suborder Changed By',
                    'Order Status',
                    'Order Status Changed By'
                ];
                this.exportService.downloadFile(csvData, header);
                this._notification.success('Success', 'Successfully fetched all products.');

            }, error => {
                console.log("Error: ", error);
                this._notification.error('Error occurred!', 'Something wrong happened!');
            })
    }

    showMakePaymentModal(order){
        this.currentOrderId = order.id;
        this.currentOrderDueAmount = order.total_price - order.paid_amount;
        this.isMakePaymentModalVisible = true;
    }

    getFormControl(name) {
        return this.validateForm.controls[name];
    }

    onRemovedFront(_file: FileHolder) {
        this.submittingMakePayment = true;

        if(this.ImageFrontFile.length > 0){
            let imagePath = this.ImageFrontFile[this.storeImageFileName.findIndex(e => e.name === _file.file.name)];


            let formData = new FormData();
            formData.append('oldImagePath', `${imagePath.split(this.IMAGE_ENDPOINT)[1]}`);

            this.designImagesService.deleteImage(formData)
                .subscribe(data => {
                    this.ImageFrontFile.splice(this.storeImageFileName.findIndex(e => e.name === _file.file.name), 1);
                    this.storeImageFileName.splice(this.storeImageFileName.findIndex(e => e.name === _file.file.name), 1);

                    this._notification.success("Success", "Successfully deleted image");
                    this.submittingMakePayment = false;

                }, error => {
                    console.log("Error occurred: ", error);
                    this._notification.success("Error", "Error occurred while deleting image");
                    this.submittingMakePayment = false;
                })
        }

    }

    onBeforeUploadFront = (metadata: UploadMetadata) => {
        this.submittingMakePayment = true;

        let formData = new FormData();
        formData.append('image', metadata.file, metadata.file.name);

        this.designImagesService.insertImage(formData)
            .subscribe(data => {
                this.ImageFrontFile.push(this.IMAGE_ENDPOINT + data.path);
                this.storeImageFileName.push(metadata.file);
                this.submittingMakePayment = false;
                this._notification.success("Success", "Successfully uploaded image");

            }, error => {
                console.log("Error occurred: ", error);
                this.submittingMakePayment = false;
                this._notification.error("Error", "Unstable Internet connection while uploading image");

            })
        return metadata;
    }

    submitForm($event, value){
        this.submittingMakePayment = true;
        if(!value.dueAmount){
            this._notification.error("Due Amount Missing", "Must provide due amount");
            return false;
        }
        const formData: FormData = new FormData();
        formData.append('dueAmount', value.dueAmount);
        formData.append('orderId', this.currentOrderId);
        if (this.ImageFrontFile.length > 0) {
            this.ImageFrontFile = this.ImageFrontFile.map(image => image.split(this.IMAGE_ENDPOINT)[1]);
            formData.append('image', JSON.stringify(this.ImageFrontFile));
        }

        this.paymentService.makeAdminPayment(formData)
            .subscribe(data => {
                this.submittingMakePayment = false;
                this.isMakePaymentModalVisible = false;
                console.log("Success: ", data);
                this.getPageData();
                this._notification.success("Success", "Successfully added payment for the order");
                this.ImageFrontFile = [];
                this.storeImageFileName = [];
                this.ImageUploadComponent.deleteAll();
            }, error => {
                this.submittingMakePayment = false;
                this.isMakePaymentModalVisible = false;
                console.log("Error occurred: ", error);
                this._notification.error("Error", "Error occurred while making admin payment");
            })
    }

}
