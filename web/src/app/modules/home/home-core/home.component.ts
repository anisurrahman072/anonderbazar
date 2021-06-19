import {Component, OnInit} from '@angular/core';
import {CmsService, ProductService} from "../../../services";
import {Observable} from "rxjs/Observable";
import {forkJoin} from "rxjs/observable/forkJoin";
import * as ___ from "lodash";
import { Title } from '@angular/platform-browser';
import {OfferService} from "../../../services/offer.service";

@Component({
    selector: 'app-home-page',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

    featureProducts: any = null;
    cmsDataForPageSection: any;
    cmsDataForPageSectionSubsection: any;
    regularOfferData;

    constructor(
        private productService: ProductService,
        private cmsService: CmsService,
        private title: Title,
        private offerService: OfferService,
    ) {
    }

    // init the component
    ngOnInit() {
        this.getFeatureProducts();
        this.fetchCmsData();
        this.addPageTitleNMetaTag();
        this.offerService.getWebRegularOffers()
            .subscribe(result => {
                this.regularOfferData = result.data;
                console.log('regular offer data: ', this.regularOfferData);
            })
    }

    //get all cms data that are need in the home page
    private fetchCmsData() {
        forkJoin([this.cmsService.getByPageNSection(), this.cmsService.getByPageNSectionNSubSection()])
            .subscribe((results: any) => {
                console.log('Combined CMS API: ', results);

                if (!___.isUndefined(results[0])) {
                    console.log('getByPageNSection', results[0]);
                    this.cmsDataForPageSection = results[0];
                }
                if (!___.isUndefined(results[1])) {
                    console.log('getByPageNSectionNSubSection', results[1]);
                    this.cmsDataForPageSectionSubsection = results[1];
                }
            });
    }


    //Event method for getting all the data for the page
    private getFeatureProducts() {
        this.featureProducts = this.productService.fetchFlashDealsProducts();
    }

    private addPageTitleNMetaTag() {
        this.title.setTitle('Home - Anonderbazar');
    }

}
