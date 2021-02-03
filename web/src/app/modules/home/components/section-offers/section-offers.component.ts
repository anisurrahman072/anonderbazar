import { Component, OnInit } from '@angular/core';
import { CmsService } from '../../../../services';
import {AppSettings} from "../../../../config/app.config";
import { ProductService } from '../../../../services';
@Component({
  selector: 'app-section-offers',
  templateUrl: './section-offers.component.html',
  styleUrls: ['./section-offers.component.scss']
})
export class OfferComponent implements OnInit {
    private middleblogList: any;
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
            this.homeOfferData.forEach(element => {
              if (element.data_value[0].offers.length>0) {

                let newOffers = [];
                element.data_value[0].offers.forEach(element => {
                  this.cmsService.getById(element)
                    .subscribe(result => {
                      newOffers.push(result.data_value[0]);
                  });
                });
                element.data_value['alloffers'] = newOffers;
              }
              if (element.data_value[0].products.length>0) {
                let newProducts = [];
                element.data_value[0].products.forEach(element => {
                  this.productservice.getById(element)
                    .subscribe(result => {
                      newProducts.push(result);
                  });
                });
              element.data_value['allproducts'] = newProducts;
              }
            });
        });
  }

}
