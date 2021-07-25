import {Component, OnDestroy, OnInit} from '@angular/core';
import {Store} from "@ngrx/store";
import {Observable} from "rxjs/Observable";
import {forkJoin} from "rxjs/observable/forkJoin";
import * as ___ from "lodash";
import {OfferService} from "../../../services";
import {CmsService, ProductService} from "../../../services";
import * as fromStore from "../../../state-management";
import {Offer} from "../../../models";
import {Subscription} from "rxjs/Subscription";
import { Title } from '@angular/platform-browser';
import {ToastrService} from "ngx-toastr";
import {AppSettings} from "../../../config/app.config";

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
    anonderJhorInfo;
    IMAGE_ENDPOINT = AppSettings.IMAGE_ENDPOINT;

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
        private toastr: ToastrService,
    ) {
    }

    // init the component
    ngOnInit() {
        this.getFeatureProducts();
        this.fetchCmsData();
        this.addPageTitleNMetaTag();

        this.offer$ = this.store.select<any>(fromStore.getOffer);
        this.offerSubscription = this.offer$.subscribe(offerData => {
             /*console.log('offer store data: ', offerData);*/
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
        forkJoin([this.cmsService.getByPageNSection(), this.cmsService.getByPageNSectionNSubSection(), this.offerService.getAnonderJhorInfo()])
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
                if (!___.isUndefined(results[2])) {
                    this.anonderJhorInfo = results[2].data;
                    /*console.log('anonder jhor ifno: ', this.anonderJhorInfo);*/
                }
            }, (error) => {
                console.log(error);
                this.toastr.error('Sorry! There was a problem!', 'Sorry!');
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
