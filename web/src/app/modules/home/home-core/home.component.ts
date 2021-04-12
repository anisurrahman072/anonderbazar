import {Component, OnInit} from '@angular/core';
import {CmsService, ProductService} from "../../../services";
import {Observable} from "rxjs/Observable";

@Component({
    selector: 'app-home-page',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
    featureProducts$: Observable<any>;

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
        this.cmsService.getByPageNSection()
            .subscribe((results: any) => {
                console.log('Combined CMS API: ', results);
            });
    }

    //Event method for getting all the data for the page
    private getFeatureProducts() {
        this.featureProducts$ = this.productService.getFlashDealsProducts();
    }

}
