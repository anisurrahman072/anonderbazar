import {Component, OnInit, ViewChild} from '@angular/core';
import { CmsService } from '../../../../services/cms.service';
import {AppSettings} from "../../../../config/app.config";

import {
    SwiperComponent,
    SwiperDirective
} from "ngx-swiper-wrapper";
@Component({
    selector: 'home-banner',
    templateUrl: './banner.component.html',
    styleUrls: ['./banner.component.scss']
})
export class BannerComponent implements OnInit {

    // Swiper config
    // public config: SwiperConfigInterface;

    @ViewChild(SwiperComponent)
    componentRef: SwiperComponent;
    @ViewChild(SwiperDirective)
    directiveRef: SwiperDirective;
    activeSlideIndex = 0;
    myInterval = 5000;
    showNavigationArrows = false;
    showNavigationIndicators = false;
    private cmsBANNERData: any;
    private cmsHEADERData: any;

    private carousalList: any;
    private IMAGE_ENDPOINT = AppSettings.IMAGE_ENDPOINT;

    constructor(private cmsService: CmsService) {
    }
  //Event method for getting all the data for the page
    ngOnInit() {
        this.cmsService.getBySectionName('HOME','BANNER').subscribe(result => {
            this.cmsBANNERData = result.data_value[0];

        });
        this.cmsService.getBySectionName('LAYOUT','HEADER').subscribe(result => {
            this.cmsHEADERData = result.data_value;
        });
        this.cmsService.getBySectionName('HOME', "CAROUSEL").subscribe(result => {
            this.carousalList = result.data_value;
            this.carousalList.forEach(element => {
                element.description = JSON.parse(element.description);
            });
        });
    }

}
