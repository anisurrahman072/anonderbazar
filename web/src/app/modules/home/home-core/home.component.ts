import {Component, OnDestroy, OnInit} from '@angular/core';
import {Store} from "@ngrx/store";
import {Observable} from "rxjs/Observable";
import {forkJoin} from "rxjs/observable/forkJoin";
import * as ___ from "lodash";
import {Title} from '@angular/platform-browser';
import {OfferService} from "../../../services";
import {CmsService, ProductService} from "../../../services";
import * as fromStore from "../../../state-management";
import {Offer} from "../../../models";
import {Subscription} from "rxjs/Subscription";

@Component({
    selector: 'app-home-page',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {

    featureProducts: any = null;
    cmsDataForPageSection: any;
    cmsDataForPageSectionSubsection: any;
    regularOfferData;

    /** offer related variables */
    offer$: Observable<Offer>;
    offerData: Offer;

    private offerSubscription: Subscription;

    constructor(
        private productService: ProductService,
        private cmsService: CmsService,
        private title: Title,
        private offerService: OfferService,
        private store: Store<fromStore.HomeState>,
    ) {
    }

    // init the component
    ngOnInit() {
        this.getFeatureProducts();
        this.fetchCmsData();
        this.addPageTitleNMetaTag();

        this.offer$ = this.store.select<any>(fromStore.getOffer);
        this.offerSubscription = this.offer$.subscribe(offerData => {
             console.log('offer store data: ', offerData);
            this.offerData = offerData;
        })

        this.offerService.getWebRegularOffers()
            .subscribe(result => {
                this.regularOfferData = result.data;
                // console.log('regular offer data: ', this.regularOfferData);
            });
    }

    ngOnDestroy(): void {
        this.offerSubscription ? this.offerSubscription.unsubscribe() : null;
    }

    //get all cms data that are need in the home page
    private fetchCmsData() {
        forkJoin([this.cmsService.getByPageNSection(), this.cmsService.getByPageNSectionNSubSection()])
            .subscribe((results: any) => {
                // console.log('Combined CMS API: ', results);

                if (!___.isUndefined(results[0])) {
                    // console.log('getByPageNSection', results[0]);
                    this.cmsDataForPageSection = results[0];
                }
                if (!___.isUndefined(results[1])) {
                    // console.log('getByPageNSectionNSubSection', results[1]);
                    this.cmsDataForPageSectionSubsection = results[1];
                }
            }, (error) => {
                // TODO: handle error
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
