import {Component, OnInit} from '@angular/core';
import {CmsService, OfferService, ProductService} from '../../../services';
import {AppSettings} from '../../../config/app.config';
import {ActivatedRoute, Router} from '@angular/router';
import {GLOBAL_CONFIGS} from "../../../../environments/global_config";
import {Title} from "@angular/platform-browser";
import {timer} from "rxjs/observable/timer";
import * as moment from "moment";

@Component({
    selector: 'app-offers-page',
    templateUrl: './offers-page.component.html',
    styleUrls: ['./offers-page.component.scss']
})
export class OffersPageComponent implements OnInit {
    array = [];
    IMAGE_ENDPOINT = AppSettings.IMAGE_LIST_ENDPOINT;
    IMAGE_LIST_ENDPOINT = AppSettings.IMAGE_LIST_ENDPOINT;
    start: number;
    end: number;
    cms_length: number;
    regularOfferData: any = [];
    p: any;
    IMAGE_EXT = GLOBAL_CONFIGS.otherImageExtension;

    /** Timer */
    presentTime;
    offerStartTime = [];
    offerEndTime = [];
    offerRemainingTimeToEnd: any[] = [];
    offerRemainingTimeToEndInDigit: any[] = [];
    subscription;

    constructor(
        private cmsService: CmsService,
        private productservice: ProductService,
        private router: Router,
        private route: ActivatedRoute,
        private title: Title,
        private offerService: OfferService
    ) {
        this.start = 0;

        this.end = 9;
        if (this.cms_length < 1) {
            this.end = this.cms_length;
        }
    }

    ngOnInit() {
        this.presentTime = new Date().getTime();
        this.getAllRegularOffer();
        this.addPageTitle();
    }


    onScroll(event) {
        this.end += 3;
    }

    //Event method for getting all the cms data for the page
    getAllRegularOffer() {
        this.offerService.getWebRegularOffers().subscribe(result => {
            this.regularOfferData = result.data;

            this.regularOfferData.forEach(offer => {
                this.offerStartTime[offer.id] = new Date(offer.start_date).getTime();
                this.offerEndTime[offer.id] = new Date(offer.end_date).getTime();

                this.offerRemainingTimeToEnd[offer.id] = this.offerEndTime[offer.id] - this.presentTime;
            })
            this.offerEndsIn();
        })
    }


    private addPageTitle() {
        this.title.setTitle('Offers - Anonderbazar');
    }

    offerEndsIn() {
        this.regularOfferData.forEach(offer => {
            this.subscription = timer(0, 1000)
                .subscribe(data => {
                    if (this.offerRemainingTimeToEnd[offer.id] - 1000 <= 0) {
                        this.offerRemainingTimeToEnd[offer.id] = 0;
                        this.offerRemainingTimeToEndInDigit[offer.id] = `00000000`;
                        this.offerRemainingTimeToEndInDigit[offer.id] = this.offerRemainingTimeToEndInDigit[offer.id].split("");
                    } else {
                        this.offerRemainingTimeToEnd[offer.id] -= 1000;
                    }

                    let seconds = moment.duration(this.offerRemainingTimeToEnd[offer.id]).seconds();
                    let minutes = moment.duration(this.offerRemainingTimeToEnd[offer.id]).minutes();
                    let hours = moment.duration(this.offerRemainingTimeToEnd[offer.id]).hours();
                    let days = moment.duration(this.offerRemainingTimeToEnd[offer.id]).days();

                    let sec;
                    if (seconds.toString().length <= 1) {
                        sec = '0' + seconds.toString();
                    } else {
                        sec = seconds.toString();
                    }

                    let min;
                    if (minutes.toString().length <= 1) {
                        min = '0' + minutes.toString();
                    } else {
                        min = minutes.toString();
                    }

                    let hrs;
                    if (hours.toString().length <= 1) {
                        hrs = '0' + hours.toString();
                    } else {
                        hrs = hours.toString();
                    }

                    let dys;
                    if (days.toString().length <= 1) {
                        dys = '0' + days.toString();
                    } else {
                        dys = days.toString();
                    }

                    this.offerRemainingTimeToEndInDigit[offer.id] = `${dys}${hrs}${min}${sec}`;
                    this.offerRemainingTimeToEndInDigit[offer.id] = this.offerRemainingTimeToEndInDigit[offer.id].split("");
                })
        });
    }

    ngOnDestroy(): void {
        this.subscription ? this.subscription.unsubscribe() : '';
    }

}
