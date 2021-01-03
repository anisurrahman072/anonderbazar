import { Component, OnInit, Input } from '@angular/core';

import { CmsService } from '../../../../services/cms.service';
import { AppSettings } from "../../../../config/app.config";
import { ProductService } from '../../../../services';
import { Observable } from 'rxjs';
@Component({
    selector: 'app-section-feedback',
    templateUrl: './section-feedback.component.html',
    styleUrls: ['./section-feedback.component.scss']
})
export class FeedbackComponent implements OnInit {
    private feedbackProducts: any;
    private newProducts: any;
    public IMAGE_ENDPOINT = AppSettings.IMAGE_ENDPOINT; 
 
    constructor(private productService: ProductService,
        private cmsService: CmsService
    ) {
    }
      //Event method for getting all the data for the page
    ngOnInit() {
        this.productService.getFeedbackProducts().subscribe(arg => this.feedbackProducts = arg);
        this.productService.getNewProducts().subscribe(arg => this.newProducts = arg);
    }

}
