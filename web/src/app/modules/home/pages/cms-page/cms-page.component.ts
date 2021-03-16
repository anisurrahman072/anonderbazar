import {Component, OnInit} from '@angular/core';
import {CmsService, ProductService} from '../../../../services';
import {AppSettings} from '../../../../config/app.config';
import {ActivatedRoute, Router} from '@angular/router';
import {GLOBAL_CONFIGS} from "../../../../../environments/global_config";

@Component({
    selector: 'app-page-cms',
    templateUrl: './cms-page.component.html',
    styleUrls: ['./cms-page.component.scss']
})

export class CmsPageComponent implements OnInit {
    array = [];
    all_cms_post: any;
    IMAGE_ENDPOINT = AppSettings.IMAGE_LIST_ENDPOINT;
    start: number;
    end: number;
    cms_length: number;
    homeOfferData: any = [];
    offerpage = false;
    cmspage = false;
    p: any;
    IMAGE_EXT = GLOBAL_CONFIGS.otherImageExtension;

    constructor(
        private cmsService: CmsService,
        private productservice: ProductService,
        private router: Router,
        private route: ActivatedRoute,
    ) {
        this.start = 0;

        this.end = 9;
        if (this.cms_length < 1) {
            this.end = this.cms_length;
        }
    }

    // init the component
    ngOnInit() {
        console.log('this.route.snapshot.data["title"]', this.route.snapshot.data["title"]);
        if (this.route.snapshot.data["title"] == "OFFERS") {
            this.get_all_offer_cms();
            this.offerpage = true;
            this.cmspage = false;

        }
        if (this.route.snapshot.data["title"] == "CMS") {
            this.get_all_cms();
            this.cmspage = true;
            this.offerpage = false;

        }
    }

    onScroll(event) {

        this.end += 3;
    }

    //Event method for getting all the cms data for the page
    private get_all_cms() {
        // this.cmsService.getRecentPost("POST", this.end, "id", "desc").subscribe(result => {
        this.cmsService.getBySubSectionName("POST", "NONE", "NONE").subscribe(result => {
            this.all_cms_post = result;
            for (let i = 0; i < this.all_cms_post.length; i++) {
                let inputWords = this.all_cms_post[i].data_value[0].description.replace(/<[^>]*>/g, '');
                inputWords = inputWords.replace("&nbsp;", "").split(' ');
                if (inputWords.length > 20)
                    this.all_cms_post[i].data_value[0].description = inputWords.slice(0, 20).join(' ') + ' ...';
                else
                    this.all_cms_post[i].data_value[0].description = inputWords.join(' ');
            }
            this.cms_length = this.all_cms_post.length;

            console.log('get_all_cms', this.all_cms_post);
        });
        // });

    }

    //Event method for getting all the offer cms data for the page
    private get_all_offer_cms() {
        this.cmsService
            .getBySubSectionName('POST', 'HOME', 'PARENTOFFER')
            .subscribe(result => {


                if (!(result && Array.isArray(result) && result.length > 0)) {
                    return false;
                }

                this.homeOfferData = result;

                this.homeOfferData.filter((element) => element && element.data_value && Array.isArray(element.data_value) && element.data_value.length > 0)
                    .forEach(element => {
                        // console.log('title', element.data_value[0]);
                        if (element.data_value[0].offers && element.data_value[0].offers.length > 0) {

                            element.data_value[0].alloffers = [];

                            this.cmsService.getByIds(element.data_value[0].offers)
                                .subscribe(result => {
                                    element.data_value[0].alloffers = result;
                                }, (err) => {
                                    console.log(err);
                                });
                        }
                        if (element.data_value[0].products && element.data_value[0].products.length > 0) {

                            element.data_value[0].allproducts = [];

                            this.productservice.getByIds(element.data_value[0].products)
                                .subscribe(result => {
                                    element.data_value[0].allproducts = result;
                                }, (err) => {
                                    console.log(err);
                                });
                        }
                    });
            });
    }


}
