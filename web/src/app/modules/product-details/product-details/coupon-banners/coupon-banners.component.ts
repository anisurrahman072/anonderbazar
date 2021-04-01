import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {AppSettings} from "../../../../config/app.config";
import {SwiperComponent, SwiperDirective} from "ngx-swiper-wrapper";

@Component({
    selector: 'coupon-product-banners',
    templateUrl: './coupon-banners.component.html',
    styleUrls: ['./coupon-banners.component.scss']
})
export class CouponBannersComponent implements OnInit {
    @Input() bannerImages: any;
    IMAGE_ENDPOINT = AppSettings.IMAGE_ENDPOINT;

    @ViewChild(SwiperComponent)
    componentRef: SwiperComponent;

    @ViewChild(SwiperDirective)
    directiveRef: SwiperDirective;

    activeSlideIndex = 0;
    myInterval = 1500;
    showNavigationArrows = false;
    showNavigationIndicators = false;

    ngOnInit() {
        console.log('bannerImages', this.bannerImages)
    }
}
