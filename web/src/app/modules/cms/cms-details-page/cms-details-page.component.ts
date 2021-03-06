import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router, NavigationEnd} from '@angular/router';
import {CmsService, OfferService, ProductService} from '../../../services';
import {AppSettings} from '../../../config/app.config';
import {Title} from "@angular/platform-browser";
import {NotificationsService} from "angular2-notifications";

@Component({
    selector: 'app-page-cms_details',
    templateUrl: './cms-details-page.component.html',
    styleUrls: ['./cms-details-page.component.scss']
})
export class CmsDetailsPageComponent implements OnInit {
    IMAGE_ENDPOINT = AppSettings.IMAGE_ENDPOINT;
    id: any;
    regularOffer;
    regularOfferedProducts: any = [];
    page: any;
    private queryParams: any;

    /**offer related variables*/
    calculationType;
    discountAmount;
    originalPrice;
    currentTitle: any;

    changeStatusN = false;
    changeStatusPr = false;

    changeStatusN_ASC = false;
    changeStatusPr_ASC = false;

    constructor(
        private route: ActivatedRoute,
        private cmsService: CmsService,
        private productservice: ProductService,
        private title: Title,
        private router: Router,
        private offerService: OfferService,
        private _notify: NotificationsService
    ) {
        router.events.forEach((event) => {
            if(event instanceof NavigationEnd) {
                if(!this.title.getTitle()){
                    this.title.setTitle(`${this.currentTitle}`);
                }
            }
        });
    }

    // init the component
    ngOnInit() {
        this.route.queryParams.subscribe(queryparams => {
            if (queryparams['page']) {
                this.page = +queryparams['page'];
            }
        });

        this.route.params.subscribe(params => {
            this.id = +params['id'];
            this.get_cms_by_id();
        });
    }

    //Method for cms data by ids
    private get_cms_by_id() {

        let sortData = null;
        if(this.changeStatusN){
            sortData = {
                code: "newest",
                order: "DESC"
            }
            if(this.changeStatusN_ASC){
                sortData.order = "ASC";
            }
        } else if(this.changeStatusPr){
            sortData = {
                code: "price",
                order: "DESC"
            }
            if(this.changeStatusPr_ASC){
                sortData.order = "ASC";
            }
        }

        if (this.id) {
            this.offerService.getWebRegularOfferById(this.id, sortData)
                .subscribe(result => {
                    /**info related to this offer*/
                    this.regularOffer = result.data[0];

                    /** setting discount to every products exists in this offer */
                    if (this.regularOffer.selection_type === "individual_product") {
                        result.data[1].forEach(product => {
                            this.calculationType = product.calculation_type;
                            this.discountAmount = product.discount_amount;
                            this.originalPrice = product.product_id.price;

                            product.product_id.offerPrice = this.offerService.calculateOfferPrice(this.calculationType, this.originalPrice, this.discountAmount);

                            product.product_id.calculationType = this.calculationType;
                            product.product_id.discountAmount = this.discountAmount;
                            this.regularOfferedProducts.push(product.product_id);
                        });
                        this.regularOfferedProducts.sort((a, b) => (a.frontend_position > b.frontend_position) ? 1 : -1);
                    } else {
                        /**stored products in this offer*/
                        this.regularOfferedProducts = result.data[1];
                        this.regularOfferedProducts.forEach(product => {
                            this.calculationType = this.regularOffer.calculation_type;
                            this.discountAmount = this.regularOffer.discount_amount;
                            this.originalPrice = product.price;

                            product.offerPrice = this.offerService.calculateOfferPrice(this.calculationType, this.originalPrice, this.discountAmount);

                            product.calculationType = this.calculationType;
                            product.discountAmount = this.discountAmount;
                        })
                        this.regularOfferedProducts.sort((a, b) => (a.frontend_position > b.frontend_position) ? 1 : -1);
                    }

                    if (!(this.regularOfferedProducts && Array.isArray(this.regularOfferedProducts) && this.regularOfferedProducts.length > 0)) {
                        return false;
                    }

                    this.addPageTitle();
                }, error => {
                    this._notify.error('Expired', 'Offer does not exists anymore');
                });
        }

    }

    private addPageTitle() {
        if (this.regularOffer) {
            this.title.setTitle(this.regularOffer.title + ' - Anonderbazar');
            this.currentTitle = this.title.getTitle();
        } else {
            this.title.setTitle('Offer Detail - Anonderbazar');
            this.currentTitle = this.title.getTitle();
        }
    }

    onPageChange(event) {
        window.scroll(0, 0);
        let query: any = {};
        query.page = event;

        this.router.navigate(['/cms/cms-details', this.route.snapshot.params], {queryParams: query});
        this.page = event;
    }

    showNewest() {
        this.changeStatusN = true;
        this.changeStatusPr = false;

        this.changeStatusN_ASC = !this.changeStatusN_ASC;
        this.changeStatusPr_ASC = false;
        this.get_cms_by_id();
    }

    showPrice() {
        this.changeStatusN = false;
        this.changeStatusPr = true;

        this.changeStatusN_ASC = false;
        this.changeStatusPr_ASC = !this.changeStatusPr_ASC;
        this.get_cms_by_id();
    }
}
