import {Component, Input, OnInit} from '@angular/core';
import {AppSettings} from "../../../../config/app.config";
import {GLOBAL_CONFIGS} from "../../../../../environments/global_config";
import * as ___ from "lodash";
import {timer} from "rxjs/observable/timer";
import * as moment from "moment";

@Component({
    selector: 'app-section-offers',
    templateUrl: './section-offers.component.html',
    styleUrls: ['./section-offers.component.scss']
})
export class OfferComponent implements OnInit {
    @Input() homeOfferData: any;

    IMAGE_ENDPOINT = AppSettings.IMAGE_ENDPOINT;
    IMAGE_LIST_ENDPOINT = AppSettings.IMAGE_LIST_ENDPOINT;
    IMAGE_EXT = GLOBAL_CONFIGS.productImageExtension;

    products: any = [];
    offers: any = [];
    carouselOffers: any;
    allOffers: any;

    /** Timer */
    presentTime;
    offerStartTime = [];
    offerEndTime = [];
    offerRemainingTimeToEnd: any[] = [];
    offerRemainingTimeToEndInDigit: any[] = [];
    subscription;

    constructor() {
    }

    //Event method for getting all the data for the page
    /* ngOnInit() {
         console.log("rrrrrrrrrrr: ", this.homeOfferData);
         if (!___.isUndefined(this.homeOfferData) && !___.isEmpty(this.homeOfferData['POST_HOME_PARENTOFFER'])) {
             this.allOffers = this.homeOfferData['POST_HOME_PARENTOFFER'];
             this.allOffers = this.allOffers.filter(offer => {
                  return ((!___.isEmpty(offer.data_value[0].products) || !___.isEmpty(offer.data_value[0].offers)) && offer.data_value[0].showInHome === "true");
             }).slice(0, 4);
         }
     }*/

    ngOnInit() {
        this.presentTime = new Date().getTime();
        if (!___.isUndefined(this.homeOfferData) && !___.isEmpty(this.homeOfferData)) {
            this.allOffers = this.homeOfferData.filter(offer => {
                return (offer.show_in_homepage === true);
            }).slice(0, 4);
        }

        if (this.allOffers) {
            this.allOffers.forEach(offer => {
                this.offerStartTime[offer.id] = new Date(offer.start_date).getTime();
                this.offerEndTime[offer.id] = new Date(offer.end_date).getTime();

                this.offerRemainingTimeToEnd[offer.id] = this.offerEndTime[offer.id] - this.presentTime;
            })
            this.offerEndsIn();
        }
    }

    offerEndsIn() {
        this.allOffers.forEach(offer => {
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
