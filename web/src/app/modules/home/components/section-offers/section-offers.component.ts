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

    constructor(private cmsService: CmsService, private productservice: ProductService) {
    }

    //Event method for getting all the data for the page
    ngOnInit() {

        console.log('this.homeOfferData', this.homeOfferData);

        if (!___.isUndefined(this.homeOfferData) && !___.isEmpty(this.homeOfferData['POST_HOME_PARENTOFFER'])) {
            this.allOffers = this.homeOfferData['POST_HOME_PARENTOFFER'];
            this.allOffers = this.allOffers.filter(offer => {
                 return ((!___.isEmpty(offer.data_value[0].products) || !___.isEmpty(offer.data_value[0].offers)) && offer.data_value[0].showInHome === "true");
            });

            /*if (this.homeOfferData.data_value[0].offers && this.homeOfferData.data_value[0].offers.length > 0) {
                this.homeOfferData.data_value[0].alloffers = [];
                this.cmsService.getByIds(this.homeOfferData.data_value[0].offers)
                    .subscribe(result => {
                        this.homeOfferData.data_value[0].alloffers = result;
                    }, (err) => {
                        console.log(err);
                    });
            }

            if (!___.isEmpty(this.homeOfferData['POST_HOME_PARENTOFFER']) && this.homeOfferData['POST_HOME_BOTTOM'].length > 0) {
                console.log('aaaannn', this.homeOfferData['POST_HOME_BOTTOM']);
                this.homeOfferData.data_value[0].allproducts = [];
                this.productservice.getByIds(this.homeOfferData.data_value[0].products)
                    .subscribe(result => {
                        this.homeOfferData.data_value[0].allproducts = result;
                    }, (err) => {
                        console.log(err);
                    });
            }

            if (this.homeOfferData.data_value[0].products && this.homeOfferData.data_value[0].products.length > 0) {
                this.homeOfferData.data_value[0].allproducts = [];
                this.productservice.getByIds(this.homeOfferData.data_value[0].products)
                    .subscribe(result => {
                        this.homeOfferData.data_value[0].allproducts = result;
                    }, (err) => {
                        console.log(err);
                    });
            }*/
        }
    }
}
