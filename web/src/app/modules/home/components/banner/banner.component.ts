import {Component, OnInit} from '@angular/core';
import {CmsService} from '../../../../services';
import {AppSettings} from "../../../../config/app.config";
import {GLOBAL_CONFIGS} from "../../../../../environments/global_config";
import {NgxCarousel} from 'ngx-carousel';

/*import {
    SwiperComponent,
    SwiperDirective
} from "ngx-swiper-wrapper";*/

@Component({
    selector: 'home-banner',
    templateUrl: './banner.component.html',
    styleUrls: ['./banner.component.scss']
})
export class BannerComponent implements OnInit {

    public carouselBannerItems = null;
    public carouselBanner: NgxCarousel;

    // Swiper config
    // public config: SwiperConfigInterface;

/*    @ViewChild(SwiperComponent)
    componentRef: SwiperComponent;

    @ViewChild(SwiperDirective)
    directiveRef: SwiperDirective;*/

    cmsBANNERData: any;
    cmsHEADERData: any;

    IMAGE_ENDPOINT = AppSettings.IMAGE_ENDPOINT;
    IMAGE_EXT = ''; //GLOBAL_CONFIGS.bannerImageExtension;
    IMAGE_LIST_ENDPOINT = AppSettings.IMAGE_LIST_ENDPOINT;
    IMAGE_EXT_CAROUSEL = GLOBAL_CONFIGS.productImageExtension;


    carouselOffers: any;

    constructor(private cmsService: CmsService) {
    }

    //Event method for getting all the data for the page
    ngOnInit() {
        this.cmsService.getBySectionName('HOME', 'BANNER').subscribe(result => {
            this.cmsBANNERData = result.data_value[0];

        });
        this.cmsService.getBySectionName('LAYOUT', 'HEADER').subscribe(result => {
            this.cmsHEADERData = result.data_value;
        });
        this.cmsService.getBySectionName('HOME', "CAROUSEL").subscribe(result => {
            this.carouselBannerItems = result.data_value;
            this.carouselBannerItems.forEach(element => {
                element.description = JSON.parse(element.description);

                // console.log('this.carousalList-element ', element.description.link, element)
            });
        });

        this.carouselBanner = {
            grid: {xs: 1, sm: 1, md: 1, lg: 1, all: 0},
            slide: 1,
            speed: 800,
            interval: 4000,
            point: {visible: false},
            loop: true,
            custom: 'banner',
            touch: true,
            easing: 'ease-out',
        }

        this.cmsService.getBySubSectionName('POST', 'HOME', 'PARENTOFFER', true)
            .subscribe((offers) => {
                let cnt = 0;
                this.carouselOffers = offers.filter((offer) => {
                    return (offer && offer.data_value && Array.isArray(offer.data_value) &&
                        offer.data_value.length > 0 && offer.data_value[0].products &&
                        offer.data_value[0].products.length > 0 && offer.data_value[0].showInCarousel === 'true')
                });

                this.carouselOffers = this.carouselOffers.filter((offer) => {
                    if(cnt < 3){
                        cnt++;
                        return true;
                    }
                    else{
                        return false;
                    }
                })
            });
    }
}
