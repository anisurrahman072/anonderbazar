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
    p: any;
    private queryParams: any;

    constructor(
        private route: ActivatedRoute,
        private cmsService: CmsService,
        private productservice: ProductService,
        private title: Title,
        private router: Router,
        private offerService: OfferService
    ) {
    }

    // init the component
    ngOnInit() {
        this.route.queryParams.subscribe(queryparams => {
            if(queryparams['page']){
                this.p = +queryparams['page'];
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
                this.regularOffer = result.data[0];
                this.regularOfferedProducts = result.data[1];

                /*console.log('regularOffer', this.regularOffer);
                console.log('regularOfferedProducts', this.regularOfferedProducts);*/

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
        }else {
            this.title.setTitle('Offer Detail - Anonderbazar');
        }
    }

    onPageChange(event) {
        window.scroll(0, 0);
        let query: any = {};
        query.page = event;

        this.router.navigate(['/cms/cms-details', this.route.snapshot.params], {queryParams: query});
        this.p = event;
    }
}
