import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {CmsService, ProductService} from '../../../services';
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
    cms_post_by_id: any;
    cms_detail: any;
    products: any = [];
    offers: any = [];
    p: any;
    private queryParams: any;

    constructor(
        private route: ActivatedRoute,
        private cmsService: CmsService,
        private productservice: ProductService,
        private title: Title,
        private router: Router
    ) {
    }

    // init the component
    ngOnInit() {
        this.route.queryParams.subscribe(queryparams => {
            if (queryparams['page']) {
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
            this.cmsService.getById(this.id).subscribe(result => {
                this.cms_post_by_id = result;

                if (!(this.cms_post_by_id && this.cms_post_by_id.data_value && Array.isArray(this.cms_post_by_id.data_value) && this.cms_post_by_id.data_value.length > 0)) {
                    return false;
                }

                this.cms_detail = this.cms_post_by_id.data_value[0];
                console.log('this.cms_detail', this.cms_detail);
                console.log('title', this.cms_detail.title);
                this.addPageTitle();

                if (this.cms_detail.offers.length > 0) {
                    this.cms_detail.alloffers = [];

                    this.cmsService.getByIds(this.cms_detail.offers)
                        .subscribe(result => {
                            this.cms_detail.alloffers = result;
                        }, (err) => {
                            console.log(err);
                        });

                }
                if (this.cms_detail.products.length > 0) {
                    this.cms_detail.allproducts = [];

                    this.productservice.getByIds(this.cms_detail.products)
                        .subscribe(result => {
                            this.cms_detail.allproducts = result.filter(product => {
                                return product.warehouse_id.status == 2;
                            });
                        }, (err) => {
                            console.log(err);
                        });
                }
            });
        }

    }

    private addPageTitle() {
        if (this.cms_detail) {
            this.title.setTitle(this.cms_detail.title + ' - Anonderbazar');
        } else {
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
