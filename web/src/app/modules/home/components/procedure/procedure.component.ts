import {Component, OnInit} from '@angular/core';
import {CmsService} from '../../../../services/cms.service';
import {AppSettings} from "../../../../config/app.config";
import {GLOBAL_CONFIGS} from "../../../../../environments/global_config";

@Component({
    selector: 'home-procedure',
    templateUrl: './procedure.component.html',
    styleUrls: ['./procedure.component.scss']
})
export class Promo1Component implements OnInit {

    cmsCarouselData: any;
    IMAGE_ENDPOINT = AppSettings.IMAGE_ENDPOINT;
    IMAGE_EXT = GLOBAL_CONFIGS.bannerImageExtension;

    constructor(private cmsService: CmsService) {
    }

    //Event method for getting all the data for the page
    ngOnInit() {
        this.cmsService.getBySectionName('HOME', 'CAROUSEL').subscribe(result => {
            this.cmsCarouselData = result.data_value;
        });
    }

}
