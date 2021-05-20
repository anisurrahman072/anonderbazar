import {Component, HostListener, OnInit} from '@angular/core';
import {CmsService} from '../../services';
import {AppSettings} from '../../config/app.config';
import {ShoppingModalService} from '../../services/ui/shoppingModal.service';
import * as fromStore from "../../state-management";
import {Store} from "@ngrx/store";
import {Observable} from "rxjs/Observable";
import {forkJoin} from "rxjs/observable/forkJoin";
import * as _ from "lodash";

@Component({
    selector: 'app-footer',
    templateUrl: './footer.component.html',
    styleUrls: ['./footer.component.scss', './footer.component.css'],
})
export class FooterComponent implements OnInit {
    title = 'footer';
    IMAGE_ENDPOINT = AppSettings.IMAGE_ENDPOINT;
    cmsFeatureData: any;
    cmsFooterData: any;
    cmsFooterDataFurther: any;
    cmsFooterDataCustomer: any;
    cmsFooterDataShops: any;
    cmsFooterDataBrands: any;
    cmsFooterDataSocial: any;
    cart$: Observable<any>;
    showTopToBottom: boolean = false
    cmsPostData: any;

    /*
    * constructor for footer component
    */
    constructor(
        private cmsService: CmsService,
        private shoppingModalService: ShoppingModalService,
        private store: Store<fromStore.HomeState>,
    ) {
    }

    // init the component
    ngOnInit() {

        forkJoin([
            this.cmsService.getBySubSectionName('LAYOUT', 'FOOTER', 'FEATURE'),
            this.cmsService.getBySubSectionName('LAYOUT', 'FOOTER', 'FOOTER'),
            this.cmsService.getBySubSectionName('LAYOUT', 'FOOTER', 'FEATURE'),
            this.cmsService.getBySubSectionName('LAYOUT', 'FOOTER', 'FOOTER'),
            this.cmsService.getAllBottomFooter('FOOTER')
        ]).subscribe((results: any) => {

            if (!_.isNil(results[0]) && !_.isNil(results[0][0])) {
                this.cmsFeatureData = results[0][0].data_value;
            }

            if (!_.isNil(results[1]) && !_.isNil(results[1][0])) {
                this.cmsFooterData = results[1][0].data_value[0];
                this.cmsFooterDataFurther = results[1][0].data_value[1];
                this.cmsFooterDataCustomer = results[1][0].data_value[2];
                this.cmsFooterDataShops = results[1][0].data_value[3];
                this.cmsFooterDataBrands = results[1][0].data_value[4];
                this.cmsFooterDataSocial = results[1][0].data_value[5];
            }

            if (!_.isNil(results[2]) && !_.isNil(results[2][0])){
                this.cmsFeatureData = results[2][0].data_value;
            }

            if (!_.isNil(results[3]) && !_.isNil(results[3][0])){
                this.cmsFooterData = results[3][0].data_value[0];
                this.cmsFooterDataFurther = results[3][0].data_value[1];
                this.cmsFooterDataCustomer = results[3][0].data_value[2];
                this.cmsFooterDataShops = results[3][0].data_value[3];
                this.cmsFooterDataBrands = results[3][0].data_value[4];
                this.cmsFooterDataSocial = results[3][0].data_value[5];
            }

            if (!_.isNil(results[4]) && !_.isNil(results[4][0])){
                this.cmsPostData = results[4][0].data_value[6];
            }

        }, error => {
            console.log('Error occurred while fetching data, ',error);
        });

        //getting the footer feature data
        // this.getFeatureData();

        //getting the footer link data
        // this.getFooterData();

        //getting the footer post data
        // this.getPostData();

        //getting the cart value
        this.cart$ = this.store.select<any>(fromStore.getCart);
    }

    @HostListener('window:scroll', ['$event']) // for window scroll events
    onScroll(event) {
        if (document.body.scrollTop > 100 || document.documentElement.scrollTop > 100) {
            this.showTopToBottom = true
        } else {
            this.showTopToBottom = false
        }
    }

    //Event method for getting footer feature data
    /*getFeatureData() {
        this.cmsService.getBySubSectionName('LAYOUT', 'FOOTER', 'FEATURE').subscribe(result => {
            this.cmsFeatureData = result[0].data_value;

        });
    }*/

    getPostData(){
        this.cmsService.getAllBottomFooter('FOOTER').subscribe(result => {
            this.cmsPostData = result[0].data_value[6];
        });
    }

    //Method for showing shopping cart modal
    /*showShoppingCartModal() {
        this.shoppingModalService.showshoppingModal(true);
    }*/

    //Event method for getting footer links data
    /*getFooterData() {
        this.cmsService.getBySubSectionName('LAYOUT', 'FOOTER', 'FOOTER').subscribe(result => {
            this.cmsFooterData = result[0].data_value[0];
            this.cmsFooterDataFurther = result[0].data_value[1];
            this.cmsFooterDataCustomer = result[0].data_value[2];
            this.cmsFooterDataShops = result[0].data_value[3];
            this.cmsFooterDataBrands = result[0].data_value[4];
            this.cmsFooterDataSocial = result[0].data_value[5];
        });
    }*/

    //Event method for scrolling top to bottom
    bottom_to_top(event) {
        window.scroll(0, 0);
    }

}

