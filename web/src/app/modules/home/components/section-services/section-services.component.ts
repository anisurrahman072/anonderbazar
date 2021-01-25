import {Component, OnInit} from '@angular/core';
import {CmsService} from '../../../../services/cms.service';
import {AppSettings} from "../../../../config/app.config";

@Component({
    selector: 'app-section-service',
    templateUrl: './section-services.component.html',
    styleUrls: ['./section-services.component.scss']
})
export class ServiceComponent implements OnInit {
    serviceFooterList: any;
    IMAGE_ENDPOINT = AppSettings.IMAGE_ENDPOINT;


    constructor(private cmsService: CmsService) {
    }

    //Event method for getting all the data for the page
    ngOnInit() {
        this.cmsService.getBySubSectionName('LAYOUT', 'FOOTER', "FEATURE").subscribe(result => {
            this.serviceFooterList = result[0].data_value;
        });


    }

}
