import {Component, OnInit} from '@angular/core';
import {environment} from "../../../../../../environments/environment";

@Component({
    selector: 'app-cms-layout',
    templateUrl: './cms-layout.component.html',
    styleUrls: ['./cms-layout.component.css']
})
export class CmsLayoutComponent implements OnInit {
    cmsData: any;
    IMAGE_ENDPOINT = environment.IMAGE_ENDPOINT;

    constructor() {

    }
    //Event method for getting all the data for the page
    ngOnInit() {
/*        this.cmsService.getBySectionName("HOME").subscribe(result => {
            this.cmsData = result;
        });*/
    }
}
