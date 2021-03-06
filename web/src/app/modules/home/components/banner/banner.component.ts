import {Component, Input, OnInit} from '@angular/core';
import {AppSettings} from "../../../../config/app.config";
import {GLOBAL_CONFIGS} from "../../../../../environments/global_config";
import {NgxCarousel} from 'ngx-carousel';
import * as ___ from 'lodash';

@Component({
    selector: 'home-banner',
    templateUrl: './banner.component.html',
    styleUrls: ['./banner.component.scss']
})
export class BannerComponent implements OnInit {
    @Input() carouselBannerData: any;
    @Input() carouselOffers: any;
    public carouselBannerItems = null;
    public carouselBanner: NgxCarousel;
    /*
        cmsBANNERData: any;
        cmsHEADERData: any;
    */

    IMAGE_ENDPOINT = AppSettings.IMAGE_ENDPOINT;
    IMAGE_EXT = ''; //GLOBAL_CONFIGS.bannerImageExtension;
    IMAGE_LIST_ENDPOINT = AppSettings.IMAGE_LIST_ENDPOINT;

    constructor() {
    }

    //Event method for getting all the data for the page
    ngOnInit() {

        this.carouselBannerItems = [];
        if (!___.isUndefined(this.carouselBannerData) && !___.isUndefined(this.carouselBannerData.data_value)) {
            if (___.isString(this.carouselBannerData.data_value)) {
                this.carouselBannerItems = JSON.parse(this.carouselBannerData.data_value).sort((a, b) => (parseInt(a.frontend_position) > parseInt(b.frontend_position)) ? 1 : -1);
            } else if (___.isArray(this.carouselBannerData.data_value)) {
                this.carouselBannerItems = this.carouselBannerData.data_value.sort((a, b) => (parseInt(a.frontend_position) > parseInt(b.frontend_position)) ? 1 : -1);
            }

            this.carouselBannerItems.forEach(element => {
                element.description = JSON.parse(element.description);
            });
        }

        /*        this.cmsService.getBySectionName('HOME', 'BANNER').subscribe(result => {
                    this.cmsBANNERData = [];
                    if (!___.isUndefined(result) && !___.isUndefined(result.data_value) && ___.isArray(result.data_value)) {
                        this.cmsBANNERData = result.data_value[0];
                    }
                });
        */

        /*
                 this.cmsService.getBySectionName('LAYOUT', 'HEADER').subscribe(result => {
                    this.cmsHEADERData = [];
                    if (!___.isUndefined(result) && !___.isUndefined(result.data_value) && ___.isArray(result.data_value)) {
                        this.cmsHEADERData = result.data_value;
                    }
                });
        */

        /*        this.cmsService.getBySectionName('HOME', "CAROUSEL").subscribe(result => {
                    this.carouselBannerItems = [];
                    if (!___.isUndefined(result) && !___.isUndefined(result.data_value) && ___.isArray(result.data_value)) {
                        this.carouselBannerItems = result.data_value;
                        this.carouselBannerItems.forEach(element => {
                            element.description = JSON.parse(element.description);
                        });
                    }
                });
        */

        if(!(___.isUndefined(this.carouselOffers) && ___.isEmpty(this.carouselOffers))){
            this.carouselOffers = this.carouselOffers.filter(offer => {
                return ((!___.isUndefined(offer.image)) && (!___.isUndefined(offer.image.small_image)) && offer.showInCarousel === true);
            }).slice(0,3);
        }

        /*this.cmsService.getBySubSectionName('POST', 'HOME', 'PARENTOFFER', true)
            .subscribe((offers) => {
                let cnt = 0;
                this.carouselOffers = offers.filter((offer) => {
                    return (offer && offer.data_value && Array.isArray(offer.data_value) &&
                        offer.data_value.length > 0 && offer.data_value[0].products &&
                        offer.data_value[0].products.length > 0 && offer.data_value[0].showInCarousel === 'true')
                });

                this.carouselOffers = this.carouselOffers.filter((offer) => {
                    if (cnt < 3) {
                        cnt++;
                        return true;
                    } else {
                        return false;
                    }
                })
            });*/
    }
}
