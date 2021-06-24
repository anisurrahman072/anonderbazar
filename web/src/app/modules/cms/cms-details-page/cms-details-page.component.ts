import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {CmsService, OfferService, ProductService} from '../../../services';
import {AppSettings} from '../../../config/app.config';
import {Title} from "@angular/platform-browser";

@Component({
    selector: 'app-page-cms_details',
    templateUrl: './cms-details-page.component.html',
    styleUrls: ['./cms-details-page.component.scss']
})
export class CmsDetailsPageComponent implements OnInit {
    IMAGE_ENDPOINT = AppSettings.IMAGE_ENDPOINT;
    id: any;
    regularOffer;
    regularOfferedProducts;
    products: any = [];
    offers: any = [];
    page: any;
    private queryParams: any;

    /**offer related variables*/
    calculationType;
    discountAmount;
    originalPrice;

    constructor(
        private route: ActivatedRoute,
        private cmsService: CmsService,
        private productservice: ProductService,
        private title: Title,
        private router: Router,
        private offerService: OfferService,
    ) {
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

        if (this.id) {
            this.offerService.getWebRegularOfferById(this.id).subscribe(result => {
                /**info related to this offer*/
                this.regularOffer = result.data[0];

                /**stored products in this offer*/
                this.regularOfferedProducts = result.data[1];

                /** setting discount to every products exists in this offer*/
                this.regularOfferedProducts.forEach(product => {
                    this.calculationType = this.regularOffer.calculation_type;
                    this.discountAmount = this.regularOffer.discount_amount;
                    this.originalPrice = product.price;

                    product.offerPrice = this.offerService.calculateOfferPrice(this.calculationType, this.originalPrice, this.discountAmount);

                    product.calculationType = this.calculationType;
                    product.discountAmount = this.discountAmount;
                })

                if (!(this.regularOfferedProducts && Array.isArray(this.regularOfferedProducts) && this.regularOfferedProducts.length > 0)) {
                    return false;
                }

                this.addPageTitle();
            });
        }

    }

    private addPageTitle() {
        if (this.regularOffer) {
            this.title.setTitle(this.regularOffer.title + ' - Anonderbazar');
        } else {
            this.title.setTitle('Offer Detail - Anonderbazar');
        }
    }

    onPageChange(event) {
        window.scroll(0, 0);
        let query: any = {};
        query.page = event;

        this.router.navigate(['/cms/cms-details', this.route.snapshot.params], {queryParams: query});
        this.page = event;
    }
}
