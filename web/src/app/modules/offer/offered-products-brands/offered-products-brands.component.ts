import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router, NavigationEnd} from '@angular/router';
import {CmsService, OfferService, ProductService} from '../../../services';
import {AppSettings} from '../../../config/app.config';
import {Title} from "@angular/platform-browser";
import {NotificationsService} from "angular2-notifications";
import {timer} from "rxjs/observable/timer";
import * as moment from "moment";

@Component({
    selector: 'app-offered-products-brands',
    templateUrl: './offered-products-brands.component.html',
    styleUrls: ['./offered-products-brands.component.scss']
})
export class OfferedProductsBrandsComponent implements OnInit {

    IMAGE_ENDPOINT = AppSettings.IMAGE_ENDPOINT;
    private id: any;
    page: any;
    private queryParams: any;
    offeredProductsBrands;
    regularOfferInfo;

    private currentTitle: any;

    /** Timer */
    presentTime;
    offerStartTime;
    offerEndTime;
    offerRemainingTimeToEnd;
    offerRemainingTimeToEndInDigit;
    subscription;

    constructor(
        private route: ActivatedRoute,
        private title: Title,
        private router: Router,
        private offerService: OfferService,
        private _notify: NotificationsService,
    ) {
        router.events.forEach((event) => {
            if (event instanceof NavigationEnd) {
                if (!this.title.getTitle()) {
                    this.title.setTitle(`${this.currentTitle}`);
                }
            }
        });
    }

    ngOnInit() {
        this.presentTime = new Date().getTime();
        this.route.params.subscribe(params => {
            this.id = +params['id'];
        });

        this.addPageTitle();
        this.getOfferedProductsBrands();
    }

    getOfferedProductsBrands() {
        if (this.id) {
            this.offerService.getOfferedProductsBrands(this.id)
                .subscribe(result => {
                    this.offeredProductsBrands = result.data[0];
                    this.regularOfferInfo = result.data[1];

                    this.offerStartTime = new Date(this.regularOfferInfo.start_date).getTime();
                    this.offerEndTime = new Date(this.regularOfferInfo.end_date).getTime();

                    this.offerRemainingTimeToEnd = this.offerEndTime - this.presentTime;
                    this.offerEndsIn();

                }, (err) => {
                    console.log(err);
                    this._notify.error('Sorry!', 'Something went wrong');
                })
        }
    }


    private addPageTitle() {
        this.title.setTitle('Offered Brands - Anonderbazar');
        this.currentTitle = this.title.getTitle();
    }

    onPageChange(event) {
        window.scroll(0, 0);
        let query: any = {};
        query.page = event;

        this.router.navigate(['/offers/offered-products-brands', this.route.snapshot.params], {queryParams: query});
        this.page = event;
    }

    offerEndsIn() {
        this.subscription = timer(0, 1000)
            .subscribe(data => {
                if (this.offerRemainingTimeToEnd - 1000 <= 0) {
                    this.offerRemainingTimeToEnd = 0;
                    this.offerRemainingTimeToEndInDigit = `00000000`;
                    this.offerRemainingTimeToEndInDigit = this.offerRemainingTimeToEndInDigit.split("");
                } else {
                    this.offerRemainingTimeToEnd -= 1000;
                }

                let seconds = moment.duration(this.offerRemainingTimeToEnd).seconds();
                let minutes = moment.duration(this.offerRemainingTimeToEnd).minutes();
                let hours = moment.duration(this.offerRemainingTimeToEnd).hours();
                let days = moment.duration(this.offerRemainingTimeToEnd).days();

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

                this.offerRemainingTimeToEndInDigit = `${dys}${hrs}${min}${sec}`;
                this.offerRemainingTimeToEndInDigit = this.offerRemainingTimeToEndInDigit.split("");
            })
    }

    ngOnDestroy(): void {
        this.subscription ? this.subscription.unsubscribe() : '';
    }

}
