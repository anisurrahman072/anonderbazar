import {Component, Input, OnInit} from '@angular/core';
import {CmsService} from '../../../../services';
import {AppSettings} from "../../../../config/app.config";
import {ProductService} from '../../../../services';
import {GLOBAL_CONFIGS} from "../../../../../environments/global_config";
import * as ___ from "lodash";

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
        if (!___.isUndefined(this.homeOfferData) && !___.isEmpty(this.homeOfferData)) {
            this.allOffers = this.homeOfferData.filter(offer => {
                console.log("show: ", offer.show_in_homepage);
                return (offer.show_in_homepage === true);
            }).slice(0, 4);
        }
    }
}
