import {AfterViewInit, Component, OnDestroy, OnInit} from '@angular/core';
import {NzNotificationService} from 'ng-zorro-antd';
import {CmsService} from '../../../../services/cms.service';
import {OfferService} from "../../../../services/offer.service";
import moment from "moment";
import {Router} from "@angular/router";
import * as _moment from "moment";
import {GLOBAL_CONFIGS} from "../../../../../environments/global_config";

@Component({
    selector: 'app-offer-list',
    templateUrl: './offer-list.component.html',
    styleUrls: ['./offer-list.component.css']
})

export class OfferListComponent implements OnInit, AfterViewInit, OnDestroy {

    private offerProductIds: any = [];
    regularOfferData: any = [];
    currentProduct: any = {};
    currentOffer: any = {};

    private anonderJhorOffers: any = [];
    allOffers: any = [];
    allProducts: any = [];

    offers = [];
    presentTime = (new Date(Date.now())).getTime();

    homeOfferLimit: number = 10;
    homeOfferPage: number = 1;
    regularOfferTotal: number = 0;

    loading: boolean = false;
    _isSpinning: boolean = true;

    productOfferedLimit: number = 10;
    productOfferedPage: number = 1;

    orderedOfferedProducts;
    offerInfo;

    private statusOptions = GLOBAL_CONFIGS.ORDER_STATUSES_KEY_VALUE;

    constructor(
        private _notification: NzNotificationService,
        private cmsService: CmsService,
        private offerService: OfferService,
        private router: Router
    ) {

    }

    ngOnDestroy(): void {

    }

    ngAfterViewInit() {

    }

    // init the component
    ngOnInit() {
        this.getRegularOfferData();
    };

    /**Event method for getting all the data for the Regular offer*/
    getRegularOfferData() {
        this._isSpinning = true;
        this.offerService
            .allRegularOffer(this.homeOfferLimit, this.homeOfferPage)
            .subscribe(result => {
                this.loading = false;
                console.log('getRegularOfferData', result);
                this.regularOfferData = result.data;
                this.regularOfferTotal = result.total;
                this._isSpinning = false;
            }, error => {
                this._isSpinning = false;
                console.log(error);
            });
    };

    /**Event method for deleting regular offer*/
    deleteRegularOffer(index, id) {
        this._isSpinning = true;
        this.offerService.delete(id).subscribe(result => {
            this._notification.warning('Offer Delete', "Deleted Successfully");
            this._isSpinning = false;
            this.getRegularOfferData();
        }, (err) => {
            this._isSpinning = false;
        });
    };

    activeStatusChange(event, offerId, end_date) {
        let endTime = (new Date(end_date)).getTime();

        if(endTime < this.presentTime) {
            this._notification.error('Time ended', 'You can not CHANGE the status.You can delete if you dnt need this, but it will also delete the order history related to this offer');
            this.getRegularOfferData();
            return;
        }

        let data = {event, offerId}
        this.offerService.activeStatusChange(data)
            .subscribe(result => {
                this.getRegularOfferData();
            });
    }

    canEdit(offerId, end_date) {
        let endTime = (new Date(end_date)).getTime();
        if(endTime < this.presentTime) {
            this._notification.error('Time ended', 'You can not EDIT.You can delete if you dnt need this, but it will also delete the order history related to this offer');
            return;
        }
        this.router.navigate(['/dashboard/offer/edit', offerId]);
    }

    generateRegularOfferExcelById(offerId) {
        this.offerService.generateOfferExcelById(1, offerId)
            .subscribe(result => {
                this.orderedOfferedProducts = result.data[0];
                if (this.orderedOfferedProducts && this.orderedOfferedProducts.length <= 0) {
                    this._notification.error('No Order', 'None of the products were ordered from this offer, no need to create a CSV file');
                    return;
                } else {
                    this.offerInfo = result.data[1];
                    console.log('this.orderedOfferedProducts: ', this.orderedOfferedProducts);
                    let excelData = [];
                    let isShowDiscountAmount = false;
                    this.orderedOfferedProducts.forEach(offerItem => {
                        let isFoundDiscountAmount = Object.keys(offerItem).find((value) => value === 'discountAmount' );
                        if(isFoundDiscountAmount){
                            isShowDiscountAmount = true;
                        }
                        let data = {
                            'Order Date': _moment(offerItem.orderCreatedAt).format('DD-MM-YYYY'),
                            'Order Time': _moment(offerItem.orderCreatedAt).format('h:m a'),
                            'Order id': offerItem.order_id,
                            'SubOrder Id': offerItem.suborder_id,
                            'Customer Name': offerItem.customer_name ? offerItem.customer_name.split(',').join('/').trim() : 'N/a',
                            'Customer Phone': (offerItem.customer_phone) ? offerItem.customer_phone : 'N/a',
                            'Customer Division': offerItem.division_name ? offerItem.division_name.split(',').join('/').trim() : 'N/a',
                            'Customer District': offerItem.zila_name ? offerItem.zila_name.split(',').join('/').trim() : 'N/a',
                            'Customer Upazila': offerItem.upazila_name ? offerItem.upazila_name.split(',').join('/').trim() : 'N/a',
                            'Customer House/Road/Block/Village': offerItem.address ? offerItem.address.split(',').join('/').trim() : 'N/a',
                            'Category': offerItem.categoryName ? offerItem.categoryName.split(',').join('-').trim() : 'N/a',
                            'product name': offerItem.product_name ? offerItem.product_name.split(',').join('-').trim() : 'N/a',
                            'Product SKU': offerItem.product_code,
                            'MRP': offerItem.originalPrice,
                            'Vendor Price': offerItem.vendorPrice,
                            'Quantity': offerItem.product_quantity,
                            'Shipping Charge': offerItem.courier_charge,
                            'Total': offerItem.product_total_price,
                            'Grand Total': offerItem.total_price,
                            'Payment Method': offerItem.paymentType,
                            'Transaction ID': offerItem.transactionKey,
                            'Payment Amount': offerItem.paymentAmount,
                            'Transaction Time': _moment(offerItem.transactionTime).format('DD-MM-YYYY h:m a'),
                            'Remaining Amount': offerItem.dueAmount ? offerItem.dueAmount : 0,
                            'Vendor Name': offerItem.warehouse_name ? offerItem.warehouse_name.split(',').join('-').trim() : 'N/a',
                            'Vendor Phone': (offerItem.vendor_phone) ? offerItem.vendor_phone : 'N/a',
                            'Vendor Address': offerItem.vendor_address ? offerItem.vendor_address.split(',').join('/').trim() : 'N/a',
                            'Suborder Status': typeof this.statusOptions[offerItem.sub_order_status] !== 'undefined' ? this.statusOptions[offerItem.sub_order_status] : 'Unrecognized Status',
                            'Suborder Changed By': ((offerItem.suborder_changed_by_name) ? offerItem.suborder_changed_by_name : ''),
                            'Order Status': typeof this.statusOptions[offerItem.order_status] !== 'undefined' ? this.statusOptions[offerItem.order_status] : 'Unrecognized Status',
                            'Order Status Changed By': ((offerItem.order_changed_by_name) ? offerItem.order_changed_by_name : '')
                        }
                        if(isShowDiscountAmount){
                            data['Discount Type'] = offerItem.discountType;
                            data['Discount Amount'] = offerItem.discountAmount;
                        }
                        excelData.push(data);
                    });
                    console.log("isShowDiscountAmount: ", isShowDiscountAmount);

                    let header = [
                        'Order Date',
                        'Order Time',
                        'Order id',
                        'SubOrder Id',
                        'Customer Name',
                        'Customer Phone',
                        'Customer Division',
                        'Customer District',
                        'Customer Upazila',
                        'Customer House/Road/Block/Village',
                        'Category',
                        'product name',
                        'Product SKU',
                        'MRP',
                        'Vendor Price',
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
                    if(isShowDiscountAmount){
                        header.push('Discount Type');
                        header.push('Discount Amount');
                    }

                    let offer_id = this.offerInfo.id;
                    let offerName = 'Regular offer';
                    let offer_calculation_type = this.offerInfo.calculation_type;
                    let offer_discount_amount = this.offerInfo.discount_amount;
                    let offer_start_date = moment(this.offerInfo.start_date).format('DD-MM-YYYY HH:mm:ss');
                    let offer_end_date = moment(this.offerInfo.end_date).format('DD-MM-YYYY HH:mm:ss');
                    let selection_type = this.offerInfo.selection_type;

                    let fileName = 'Regular Offer Orders';

                    this.offerService.downloadFile(excelData, header, fileName, offer_id, offerName, offer_calculation_type, offer_discount_amount, offer_start_date, offer_end_date, selection_type);
                }
            })
    }
}


