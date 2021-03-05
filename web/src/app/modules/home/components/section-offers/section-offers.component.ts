import {Component, OnInit} from '@angular/core';
import {CmsService} from '../../../../services';
import {AppSettings} from "../../../../config/app.config";
import {ProductService} from '../../../../services';

@Component({
    selector: 'app-section-offers',
    templateUrl: './section-offers.component.html',
    styleUrls: ['./section-offers.component.scss']
})
export class OfferComponent implements OnInit {
    homeOfferData: any = [];

    IMAGE_ENDPOINT = AppSettings.IMAGE_ENDPOINT;
    IMAGE_LIST_ENDPOINT = AppSettings.IMAGE_LIST_ENDPOINT;
    products: any = [];
    offers: any = [];

    constructor(private cmsService: CmsService, private productservice: ProductService) {
    }

    //Event method for getting all the data for the page
    ngOnInit() {
        this.cmsService
            .getBySubSectionName('POST', 'HOME', 'PARENTOFFER')
            .subscribe(result => {

                this.homeOfferData = result;

                this.homeOfferData.filter((element) => (element && element.data_value && Array.isArray(element.data_value) && element.data_value.length > 0))
                    .forEach(element => {

                        if (element.data_value[0].offers && element.data_value[0].offers.length > 0) {
                            element.data_value[0].alloffers = [];
                            this.cmsService.getByIds(element.data_value[0].offers)
                                .subscribe(result => {
                                    console.log(' this.cmsService.getByIds', result);
                                    element.data_value[0].alloffers = result;
                                }, (err) => {
                                    console.log(err);
                                });
                        }

                        if (element.data_value[0].products && element.data_value[0].products.length > 0) {
                            element.data_value[0].allproducts = [];
                            this.productservice.getByIds(element.data_value[0].products)
                                .subscribe(result => {
                                    element.data_value[0].allproducts = result;
                                }, (err) => {
                                    console.log(err);
                                });
                        }
                    });

            });
    }

}
