import {Component, OnInit} from '@angular/core';
import {CmsService, OfferService, ProductService} from '../../../services';
import {AppSettings} from '../../../config/app.config';
import {ActivatedRoute, Router} from '@angular/router';
import {GLOBAL_CONFIGS} from "../../../../environments/global_config";
import {Title} from "@angular/platform-browser";

@Component({
    selector: 'app-offers-page',
    templateUrl: './offers-page.component.html',
    styles: []
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
      this.getAllRegularOffer();
      this.addPageTitle();
    }


  onScroll(event) {

    this.end += 3;
  }

  //Event method for getting all the cms data for the page
  getAllRegularOffer() {
    this.offerService.getWebRegularOffers()
        .subscribe(result => {
          this.regularOfferData = result.data;
          /*console.log('regular offer data: ', this.regularOfferData);*/
        })
  }


  private addPageTitle() {
    this.title.setTitle('Offers - Anonderbazar');
  }

}
