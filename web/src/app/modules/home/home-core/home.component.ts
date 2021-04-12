import {Component, OnInit} from '@angular/core';
import {CmsService, ProductService} from "../../../services";
import {Observable} from "rxjs/Observable";
import {forkJoin} from "rxjs/observable/forkJoin";
import * as ___ from "lodash";

@Component({
    selector: 'app-home-page',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

    featureProducts$: Observable<any>;
    cmsDataForPageSection: any;
    cmsDataForPageSectionSubsection: any;

    constructor(
        private productService: ProductService,
        private cmsService: CmsService
    ) {
    }

    // init the component
    ngOnInit() {
        this.getFeatureProducts();
        this.fetchCmsData();
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
        this.featureProducts$ = this.productService.getFlashDealsProducts();
    }

}
