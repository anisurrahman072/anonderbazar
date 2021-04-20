import {Component, Input, OnInit} from '@angular/core';
import {AppSettings} from "../../../../config/app.config";
import * as ___ from "lodash";

@Component({
    selector: 'app-business-oportunities',
    templateUrl: './business-oportunities.component.html',
    styleUrls: ['./business-oportunities.component.scss']
})
export class BusinessOportunitiesComponent implements OnInit {
    @Input() private serviceFooterData: any;
    serviceFooterList: any;
    IMAGE_ENDPOINT = AppSettings.IMAGE_ENDPOINT;

    constructor() {
    }

    //Event method for getting all the data for the page
    ngOnInit() {

        this.serviceFooterList = [];
        if (!___.isUndefined(this.serviceFooterData) && !___.isUndefined(this.serviceFooterData.data_value)) {
            if (___.isString(this.serviceFooterData.data_value)) {
                this.serviceFooterList = JSON.parse(this.serviceFooterData.data_value);
            } else if (___.isArray(this.serviceFooterData.data_value)) {
                this.serviceFooterList = this.serviceFooterData.data_value;
            }
        }

        /*
                this.cmsService.getBySectionName('LAYOUT', 'HEADER').subscribe(result => {
                    this.serviceFooterList = result.data_value;
                });
        */
    }

}
