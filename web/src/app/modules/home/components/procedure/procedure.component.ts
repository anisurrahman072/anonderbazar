import {Component, Input, OnInit} from '@angular/core';
import {CmsService} from '../../../../services';
import {AppSettings} from "../../../../config/app.config";
import {GLOBAL_CONFIGS} from "../../../../../environments/global_config";
import * as ___ from "lodash";

@Component({
    selector: 'home-procedure',
    templateUrl: './procedure.component.html',
    styleUrls: ['./procedure.component.scss']
})
export class Promo1Component implements OnInit {
    @Input() private cmsCarouselData: any;
    cmsCarouselList: any;
    IMAGE_ENDPOINT = AppSettings.IMAGE_ENDPOINT;
    IMAGE_EXT = GLOBAL_CONFIGS.bannerImageExtension;

    constructor() {
    }

    //Event method for getting all the data for the page
    ngOnInit() {

        this.cmsCarouselList = [];
        if (!___.isUndefined(this.cmsCarouselData) && !___.isUndefined(this.cmsCarouselData.data_value)) {
            if (___.isString(this.cmsCarouselData.data_value)) {
                this.cmsCarouselList = JSON.parse(this.cmsCarouselData.data_value);
            } else if (___.isArray(this.cmsCarouselData.data_value)) {
                this.cmsCarouselList = this.cmsCarouselData.data_value;
            }
        }
/*
        this.cmsService.getBySectionName('HOME', 'CAROUSEL').subscribe(result => {
            this.cmsCarouselList = result.data_value;
        });
*/
    }

}
