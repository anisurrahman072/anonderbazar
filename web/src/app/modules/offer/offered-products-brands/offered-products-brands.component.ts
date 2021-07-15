import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router, NavigationEnd} from '@angular/router';
import {CmsService, OfferService, ProductService} from '../../../services';
import {AppSettings} from '../../../config/app.config';
import {Title} from "@angular/platform-browser";
import {NotificationsService} from "angular2-notifications";

@Component({
    selector: 'app-offered-products-brands',
    templateUrl: './offered-products-brands.component.html',
    styles: []
})
export class OfferedProductsBrandsComponent implements OnInit {

    IMAGE_ENDPOINT = AppSettings.IMAGE_ENDPOINT;
    id: any;
    regularOffer;
    regularOfferedProducts: any = [];
    page: any;
    private queryParams: any;

    currentTitle: any;

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
            if (event instanceof NavigationEnd) {
                if (!this.title.getTitle()) {
                    this.title.setTitle(`${this.currentTitle}`);
                }
            }
        });
    }

    ngOnInit() {
        this.route.params.subscribe(params => {
            this.id = +params['id'];
        });

        this.addPageTitle();
    }

    private addPageTitle() {
        this.title.setTitle('Offered Brands - Anonderbazar');
        this.currentTitle = this.title.getTitle();
    }

    onPageChange(event) {
        window.scroll(0, 0);
        let query: any = {};
        query.page = event;

        this.router.navigate(['/offers/offered-products-brands', this.route.snapshot.params], {queryParams: query});
        this.page = event;
    }

}
