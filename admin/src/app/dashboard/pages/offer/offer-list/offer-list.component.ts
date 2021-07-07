import {AfterViewInit, Component, OnDestroy, OnInit} from '@angular/core';
import {NzNotificationService} from 'ng-zorro-antd';
import {CmsService} from '../../../../services/cms.service';
import {OfferService} from "../../../../services/offer.service";
import moment from "moment";
import {Router} from "@angular/router";

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
                            'Order id': offerItem.order_id,
                            'Sub Order id': offerItem.suborder_id,
                            'product code': offerItem.product_code,
                            'product name': offerItem.product_name,
                            'product quantity': offerItem.product_quantity,
                            'product total price': offerItem.product_total_price,
                            'warehouse name': offerItem.warehouse_name
                        }
                        if(isShowDiscountAmount){
                            data['Discount Amount'] = offerItem.discountAmount
                        }
                        excelData.push(data);
                    });
                    console.log("isShowDiscountAmount: ", isShowDiscountAmount);

                    let header = [
                        'Order id',
                        'Sub Order id',
                        'product code',
                        'product name',
                        'product quantity',
                        'product total price',
                        'warehouse name',
                    ];
                    if(isShowDiscountAmount){
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


