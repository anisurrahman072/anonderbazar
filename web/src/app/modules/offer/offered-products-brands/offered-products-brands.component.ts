import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router, NavigationEnd} from '@angular/router';
import {CmsService, OfferService, ProductService} from '../../../services';
import {AppSettings} from '../../../config/app.config';
import {Title} from "@angular/platform-browser";
import {NotificationsService} from "angular2-notifications";

@Component({
    selector: 'app-offered-products-brands',
    templateUrl: './offered-products-brands.component.html',
    styleUrls: ['./offered-products-brands.component.scss']
})
export class OfferedProductsBrandsComponent implements OnInit {

    IMAGE_ENDPOINT = AppSettings.IMAGE_ENDPOINT;
    private id: any;
    page: any;
    private queryParams: any;
    offeredProductsBrands;
    regularOfferInfo;

    private currentTitle: any;

    constructor(
        private route: ActivatedRoute,
        private title: Title,
        private router: Router,
        private offerService: OfferService,
        private _notify: NotificationsService,
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
        this.getOfferedProductsBrands();
    }

    getOfferedProductsBrands() {
        if(this.id) {
            this.offerService.getOfferedProductsBrands(this.id)
                .subscribe(result => {
                    this.offeredProductsBrands = result.data[0];
                    this.regularOfferInfo = result.data[1];
                    console.log('this.offeredProductsBrands ', this.offeredProductsBrands);
                    console.log('this.regularOfferInfo ', this.regularOfferInfo);
                }, (err) => {
                    console.log(err);
                    this._notify.error('Sorry!', 'Something went wrong');
                })
        }
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
