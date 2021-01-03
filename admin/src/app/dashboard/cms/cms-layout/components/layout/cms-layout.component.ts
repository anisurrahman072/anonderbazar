import {Component, OnInit} from '@angular/core';
import {CmsService} from "../../../../../services/cms.service";
import {environment} from "../../../../../../environments/environment";

@Component({
    selector: 'app-cms-layout',
    templateUrl: './cms-layout.component.html',
    styleUrls: ['./cms-layout.component.css']
})
export class CmsLayoutComponent implements OnInit { 
    cmsData: any;
    IMAGE_ENDPOINT = environment.IMAGE_ENDPOINT;
 
    constructor(private cmsService: CmsService) {
    
    } 
    //Event method for getting all the data for the page
    ngOnInit() { 
        this.cmsService.getBySectionName("HOME").subscribe(result => {
            this.cmsData = result;       
        });
    }
}
