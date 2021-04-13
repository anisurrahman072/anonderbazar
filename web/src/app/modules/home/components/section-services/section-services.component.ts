import {Component, Input, OnInit} from '@angular/core';
import {CmsService} from '../../../../services';
import {AppSettings} from "../../../../config/app.config";

@Component({
    selector: 'app-section-service',
    templateUrl: './section-services.component.html',
    styleUrls: ['./section-services.component.scss']
})

export class ServiceComponent implements OnInit {
    @Input() serviceFooterList: any;
    IMAGE_ENDPOINT = AppSettings.IMAGE_ENDPOINT;

    constructor(private cmsService: CmsService) {
    }

    // Event method for getting all the data for the page
    ngOnInit() {
        this.serviceFooterList = this.serviceFooterList[0].data_value;

        /*this.cmsService.getBySubSectionName('LAYOUT', 'FOOTER', "FEATURE").subscribe(result => {
            this.serviceFooterList = result[0].data_value;
            console.log('aaarrrr', this.serviceFooterList);
        });*/
    }
}
