import {AfterViewInit, Component, OnDestroy, OnInit} from '@angular/core';
import {NzNotificationService} from 'ng-zorro-antd';
import {CmsService} from '../../../../services/cms.service';
import {ProductService} from '../../../../services/product.service';
import {OfferService} from "../../../../services/offer.service";

@Component({
    selector: 'app-offer-list',
    templateUrl: './offer-list.component.html',
    styleUrls: ['./offer-list.component.css']
})

export class OfferListComponent implements OnInit, AfterViewInit, OnDestroy {

    private offerProductIds: any = [];
    regularOfferData: any = [];
    anonderjhorOfferData: any = [];
    currentProduct: any = {};
    currentOffer: any = {};

    private anonderjhorOffers: any = [];
    allOffers: any = [];
    allProducts: any = [];

    offers = [];

    homeOfferLimit: number = 10;
    homeOfferPage: number = 1;
    regularOfferTotal: number = 0;

    loading: boolean = false;
    _isSpinning: boolean = true;

    productOfferedLimit: number = 10;
    productOfferedPage: number = 1;

    constructor(
        private productservice: ProductService,
        private _notification: NzNotificationService,
        private cmsService: CmsService,
        private offerService: OfferService
    ) {

    }

    ngOnDestroy(): void {

    }

    ngAfterViewInit() {

    }

    // init the component
    ngOnInit() {
        this.getRegularOfferData();
        this.getChildData();
    };

    // Event method for getting all the data for the Regular offer
    getRegularOfferData() {
        this._isSpinning = true;
        this.offerService
            .allRegularOffer(
                this.homeOfferLimit,
                this.homeOfferPage
            )
            .subscribe(result => {
                this.loading = false;
                console.log('result-getRegularOfferData', result);
                this.regularOfferData = result.data;
                this.regularOfferTotal = result.total;
                this._isSpinning = false;
            }, error => {
                this._isSpinning = false;
                console.log(error);
            });
    };

    // Event method for getting all child data for the page
    getChildData() {
        this._isSpinning = true;
        this.cmsService
            .getAllSearch({page: 'POST', section: 'HOME', subsection: 'OFFER'},
                this.homeOfferLimit,
                this.homeOfferPage)
            .subscribe(result1 => {
                this.loading = false;
                this.anonderjhorOfferData = result1.data;
                this._isSpinning = false;
            }, error => {
                this._isSpinning = false;
            });
    };

    //Event method for deleting offer product
    deleteConfirm(index, id) {

        let findValue = this.offerProductIds.indexOf(id);
        this.offerProductIds.splice(findValue, 1);
        this.currentProduct.data_value[0].products = this.offerProductIds;
        this._isSpinning = true;
        this.cmsService.offerProductUpdate(this.currentProduct).subscribe(result => {
            this._notification.warning('Offer Product Delete', "Deleted Successfully");
            this._isSpinning = false;
            this.allProducts = [];
            this.offerProductIds = [];

        }, (err) => {
            this._isSpinning = false;
        });

    };

    //Event method for deleting child offer
    deleteConfirmOffer(index, id) {

        let findValue = this.anonderjhorOffers.indexOf(id);
        this.anonderjhorOffers.splice(findValue, 1);
        this.currentOffer.data_value[0].offers = this.anonderjhorOffers;
        this._isSpinning = true;
        this.cmsService.updateOffer(this.currentOffer).subscribe(result => {
            this._notification.warning('Offer Delete', "Deleted Successfully");
            this._isSpinning = false;
            this.offers = [];
        }, (err) => {
            this._isSpinning = false;
            console.log(err);
        });
    };

    //Event method for deleting offer
    deleteOffer(index, id) {
        this._isSpinning = true;
        this.cmsService.delete(id).subscribe(result => {
            this._notification.warning('Parent Offer Delete', "Deleted Successfully");
            this._isSpinning = false;
            this.getRegularOfferData();
            this.getChildData();
        }, (err) => {
            this._isSpinning = false;
        });
    };
}


