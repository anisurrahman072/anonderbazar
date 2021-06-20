import {Component, OnInit} from '@angular/core';
import {CmsService, ProductService} from "../../../services";
import {Observable} from "rxjs/Observable";
import {forkJoin} from "rxjs/observable/forkJoin";
import * as ___ from "lodash";
import { Title } from '@angular/platform-browser';
import {error} from "util";

@Component({
    selector: 'app-home-page',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

    featureProducts: any = null;
    cmsDataForPageSection: any;
    cmsDataForPageSectionSubsection: any;

    constructor(
        private productService: ProductService,
        private cmsService: CmsService,
        private title: Title,
    ) {
    }

    // init the component
    ngOnInit() {
        this.getFeatureProducts();
        this.fetchCmsData();
        this.addPageTitleNMetaTag();
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
        this.productService.getFlashDealsProducts()
            .subscribe(data => {
                this.featureProducts = data.filter(product => {
                    return product.warehouse_id.status == 2;
                }).slice(0,4);
            }, error => {
                console.log("Error occurred!", error);
            })
    }

    private addPageTitleNMetaTag() {
        this.title.setTitle('Home - Anonderbazar');
    }

}
