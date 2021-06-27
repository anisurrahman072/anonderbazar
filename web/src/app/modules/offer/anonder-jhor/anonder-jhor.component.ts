import {Component, OnDestroy, OnInit} from '@angular/core';
import {OfferService} from "../../../services";
import {AppSettings} from "../../../config/app.config";
import {timer} from "rxjs/observable/timer";
import * as moment from "moment";


@Component({
    selector: 'app-anonder-jhor',
    templateUrl: './anonder-jhor.component.html',
    styleUrls: ['./anonder-jhor.component.scss']
})
export class AnonderJhorComponent implements OnInit, OnDestroy {
    anonderJhor;
    anonderJhorOffers;
    IMAGE_ENDPOINT = AppSettings.IMAGE_ENDPOINT;
    banner_name;

    jhorStartDate;
    jhorEndDate;
    jhorRemainingTimeToStart;
    jhorRemainingTimeToEnd;
    presentTime;

    jhorRemainingTimeToEndInDigit;
    jhorRemainingTimeToStartInDigit;
    remainingOfferTime: any[] = [];

    expire: Boolean = false;
    sub1;
    sub2;

    constructor(
        private offerService: OfferService
    ) {
    }

    ngOnInit() {
        this.presentTime = new Date().getTime();
        this.offerService.getAnonderJhorAndOffers()
            .subscribe(result => {
                console.log('jhor and offers result: ', result);
                if (result && result.data) {
                    if (result.data[0]) {
                        this.anonderJhor = result.data[0];

                        this.jhorStartDate = new Date(this.anonderJhor.start_date).getTime();
                        this.jhorEndDate = new Date(this.anonderJhor.end_date).getTime();

                        this.jhorRemainingTimeToStart = this.jhorStartDate - this.presentTime;
                        this.jhorRemainingTimeToEnd = this.jhorEndDate - this.presentTime;

                        if (this.jhorRemainingTimeToStart > 0) {
                            this.jhorStartsIn();
                        } else {
                            this.jhorEndsIn();
                        }
                    }
                    if (result.data[1]) {
                        this.anonderJhorOffers = result.data[1];
                        console.log('anonder jhor offers', this.anonderJhorOffers);

                        this.anonderJhorOffers.forEach(offers => {
                            if (offers.sub_sub_category_id) {
                                offers.banner_name = offers.sub_sub_category_id.name;
                            } else if (offers.sub_category_id) {
                                offers.banner_name = offers.sub_category_id.name;
                            } else if (offers.category_id) {
                                offers.banner_name = offers.category_id.name;
                            }


                        })
                        console.log('banner name added: ', this.anonderJhorOffers);
                    }
                }
            })
    }

    jhorStartsIn() {
        this.sub1 = timer(0, 1000)
            .subscribe(data => {
                this.jhorRemainingTimeToStart -= 1000;
                this.convertToHours();
            })
    }

    convertToHours() {
        if (this.jhorRemainingTimeToStart === 0) {
            this.jhorRemainingTimeToStartInDigit = `0 : 0 : 0 `;
        } else {
            let seconds = moment.duration(this.jhorRemainingTimeToStart).seconds();
            let minutes = moment.duration(this.jhorRemainingTimeToStart).minutes();
            let hours = Math.trunc(moment.duration(this.jhorRemainingTimeToStart).asHours());
            this.jhorRemainingTimeToStartInDigit = `${hours} : ${minutes} : ${seconds} `;
        }
    }

    jhorEndsIn() {
        this.sub2 = timer(0, 1000)
            .subscribe(data => {
                this.jhorRemainingTimeToEnd -= 1000;
                this.convertMilliSecondToHourMinuteSec();
            })
    }

    convertMilliSecondToHourMinuteSec() {
        if (this.jhorRemainingTimeToEnd === 0) {
            this.jhorRemainingTimeToEndInDigit = `0 : 0 : 0 `;
        } else {
            let seconds = moment.duration(this.jhorRemainingTimeToEnd).seconds();
            let minutes = moment.duration(this.jhorRemainingTimeToEnd).minutes();
            let hours = Math.trunc(moment.duration(this.jhorRemainingTimeToEnd).asHours());
            this.jhorRemainingTimeToEndInDigit = `${hours} : ${minutes} : ${seconds} `;
        }
    }

    ngOnDestroy(): void {
            this.sub1 ? this.sub1.unsubscribe() : '';
            this.sub2 ? this.sub2.unsubscribe() : '';
    }

}
