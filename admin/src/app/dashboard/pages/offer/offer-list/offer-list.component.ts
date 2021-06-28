import {AfterViewInit, Component, OnDestroy, OnInit} from '@angular/core';
import {NzNotificationService} from 'ng-zorro-antd';
import {CmsService} from '../../../../services/cms.service';
import {OfferService} from "../../../../services/offer.service";

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

    homeOfferLimit: number = 10;
    homeOfferPage: number = 1;
    regularOfferTotal: number = 0;

    loading: boolean = false;
    _isSpinning: boolean = true;

    productOfferedLimit: number = 10;
    productOfferedPage: number = 1;

    constructor(
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

    activeStatusChange(event, offerId) {
        console.log('event: ', event);
        let data = {event, offerId}
        this.offerService.activeStatusChange(data)
            .subscribe(result => {
                this.getRegularOfferData();
            });
    }
}


