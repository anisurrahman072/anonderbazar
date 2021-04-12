import {Component, OnInit} from '@angular/core';
import {CmsService} from '../../../../services';
import {AppSettings} from "../../../../config/app.config";

@Component({
    selector: 'app-business-oportunities',
    templateUrl: './business-oportunities.component.html',
    styleUrls: ['./business-oportunities.component.scss']
})
export class BusinessOportunitiesComponent implements OnInit {
    serviceFooterList: any;
    IMAGE_ENDPOINT = AppSettings.IMAGE_ENDPOINT;

    constructor(private cmsService: CmsService) {
    }

    //Event method for getting all the data for the page
    ngOnInit() {
        this.cmsService.getBySectionName('LAYOUT', 'HEADER').subscribe(result => {
            this.serviceFooterList = result.data_value;
        });


    }

}
