import {Component, OnDestroy, OnInit} from '@angular/core';
import {OfferService} from "../../../services";
import {AppSettings} from "../../../config/app.config";
import {timer} from "rxjs/observable/timer";
import * as moment from "moment";
import {Router} from "@angular/router";
import {ToastrService} from "ngx-toastr";


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

    jhorRemainingTimeToStart;
    jhorRemainingTimeToEnd;
    offerRemainingTimeToStart;
    offerRemainingTimeToEnd;
    presentTime;

    jhorRemainingTimeToEndInDigit;
    jhorRemainingTimeToStartInDigit;
    offerRemainingTimeToEndInDigit: any[] = [];
    jhorOffersRemainingTime: any[] = [];
    offerStartTime = [];
    offerEndTime = [];
    jhorStartDate;

    expire: Boolean = false;
    sub1;
    sub2;
    sub3;
    sub4;
    presentDate = new Date();

    constructor(
        private offerService: OfferService,
        private router: Router,
        private toastr: ToastrService
    ) {
    }

    ngOnInit() {
        this.presentTime = new Date().getTime();
        this.offerService.getAnonderJhorAndOffers()
            .subscribe(result => {
                /*console.log('jhor and offers result: ', result);*/
                if (result && result.data) {
                    if (result.data[0]) {
                        this.anonderJhor = result.data[0];

                        this.jhorStartDate = new Date(this.anonderJhor.start_date).getTime();
                        let jhorEndDate = new Date(this.anonderJhor.end_date).getTime();

                        this.jhorRemainingTimeToStart = this.jhorStartDate - this.presentTime;
                        this.jhorRemainingTimeToEnd = jhorEndDate - this.presentTime;

                        if (this.jhorRemainingTimeToStart > 0) {
                            this.jhorStartsIn();
                        } else {
                            this.jhorEndsIn();
                        }
                    }
                    if (result.data[1]) {
                        this.anonderJhorOffers = result.data[1];
                        /*console.log('anonder jhor offers', this.anonderJhorOffers);*/

                        this.anonderJhorOffers.forEach(offers => {
                            this.offerStartTime[offers.id] = new Date(offers.start_date).getTime();
                            this.offerEndTime[offers.id] = new Date(offers.end_date).getTime();
                            /*console.log('this.offerStartTime[offers.id]', offers.id, this.offerStartTime[offers.id]);*/

                            this.jhorOffersRemainingTime[offers.id] = this.offerEndTime[offers.id] - this.presentTime;
                            /*if (this.jhorOffersRemainingTime[offers.id] > 0) {
                                this.offerEndsIn();
                            }*/
                            /*if (offers.sub_sub_category_id) {
                                offers.banner_name = offers.sub_sub_category_id.name;
                            } else if (offers.sub_category_id) {
                                offers.banner_name = offers.sub_category_id.name;
                            } else if (offers.category_id) {
                                offers.banner_name = offers.category_id.name;
                            }*/
                        })
                        /*console.log('banner name added: ', this.anonderJhorOffers);*/
                        this.offerEndsIn();
                    }
                }
            })
    }

    jhorStartsIn() {
        this.sub1 = timer(0, 1000)
            .subscribe(data => {
                if (this.jhorRemainingTimeToStart <= 0) {
                    this.jhorRemainingTimeToStart = 0;
                } else {
                    this.jhorRemainingTimeToStart -= 1000;
                }
                this.convertJhorStartsInToTime();
            })
    }

    convertJhorStartsInToTime() {
        if (this.jhorRemainingTimeToStart === 0) {
            this.jhorRemainingTimeToStartInDigit = `000000`;
            this.jhorRemainingTimeToStartInDigit = this.jhorRemainingTimeToStartInDigit.split("");
        } else {
            let seconds = moment.duration(this.jhorRemainingTimeToStart).seconds();
            let minutes = moment.duration(this.jhorRemainingTimeToStart).minutes();
            let hours = Math.trunc(moment.duration(this.jhorRemainingTimeToStart).asHours());

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

            this.jhorRemainingTimeToStartInDigit = `${hrs}${min}${sec}`;
            this.jhorRemainingTimeToStartInDigit = this.jhorRemainingTimeToStartInDigit.split("");
        }
    }

    jhorEndsIn() {
        this.sub2 = timer(0, 1000)
            .subscribe(data => {
                if (this.jhorRemainingTimeToEnd <= 0) {
                    this.jhorRemainingTimeToEnd = 0;
                } else {
                    this.jhorRemainingTimeToEnd -= 1000;
                }
                this.convertJhorEndsInTime();
            })
    }

    convertJhorEndsInTime() {
        if (this.jhorRemainingTimeToEnd === 0) {
            this.jhorRemainingTimeToEndInDigit = `000000`;
            this.jhorRemainingTimeToEndInDigit = this.jhorRemainingTimeToEndInDigit.split("");
        } else {
            let seconds = moment.duration(this.jhorRemainingTimeToEnd).seconds();
            let minutes = moment.duration(this.jhorRemainingTimeToEnd).minutes();
            let hours = Math.trunc(moment.duration(this.jhorRemainingTimeToEnd).asHours());

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

            this.jhorRemainingTimeToEndInDigit = `${hrs}${min}${sec}`;
            this.jhorRemainingTimeToEndInDigit = this.jhorRemainingTimeToEndInDigit.split("");
        }
    }

    offerEndsIn() {
        this.anonderJhorOffers.forEach(offer => {
            this.sub3 = timer(0, 1000)
                .subscribe(data => {
                    if (this.jhorOffersRemainingTime[offer.id] - 1000 <= 0) {
                        this.jhorOffersRemainingTime[offer.id] = 0;
                        this.offerRemainingTimeToEndInDigit[offer.id] = `000000`;
                        this.offerRemainingTimeToEndInDigit[offer.id] = this.offerRemainingTimeToEndInDigit[offer.id].split("");
                    } else {
                        this.jhorOffersRemainingTime[offer.id] -= 1000;
                    }

                    let seconds = moment.duration(this.jhorOffersRemainingTime[offer.id]).seconds();
                    let minutes = moment.duration(this.jhorOffersRemainingTime[offer.id]).minutes();
                    let hours = Math.trunc(moment.duration(this.jhorOffersRemainingTime[offer.id]).asHours());

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

                    this.offerRemainingTimeToEndInDigit[offer.id] = `${hrs}${min}${sec}`;
                    this.offerRemainingTimeToEndInDigit[offer.id] = this.offerRemainingTimeToEndInDigit[offer.id].split("");
                })
        });
    }

    routerLinkToOfferDetail(id) {
        if (this.offerEndTime[id] && this.offerEndTime[id] < this.presentTime && this.offerEndTime[id] > this.jhorStartDate) {
            this.toastr.error('Offer Expired', 'Sorry!!');
        } else if (this.offerStartTime[id] && this.offerStartTime[id] > this.presentTime) {
            this.toastr.error('Please wait for the offer to start', 'Not started yet');
        } else {
            this.router.navigate(['/offers/anonder-jhor-detail/', id]);
        }
    }

    ngOnDestroy(): void {
        this.sub1 ? this.sub1.unsubscribe() : '';
        this.sub2 ? this.sub2.unsubscribe() : '';
        this.sub3 ? this.sub3.unsubscribe() : '';
        this.sub4 ? this.sub4.unsubscribe() : '';
    }

}
