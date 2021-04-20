import {Component, OnInit} from '@angular/core';
import {CmsService} from '../../../../services';
import {AppSettings} from "../../../../config/app.config";
import {GLOBAL_CONFIGS} from "../../../../../environments/global_config";

@Component({
    selector: 'app-section-blog',
    templateUrl: './section-blog.component.html',
    styleUrls: ['./section-blog.component.scss']
})
export class SectionBlogComponent implements OnInit {

    bottomblogList: any;
    IMAGE_ENDPOINT = AppSettings.IMAGE_ENDPOINT;
    IMAGE_EXT = GLOBAL_CONFIGS.otherImageExtension;

    constructor(private cmsService: CmsService) {
    }

    //Event method for getting all the data for the page
    ngOnInit() {
        this.cmsService.getBySubSectionName('POST', 'HOME', "BOTTOM")
            .subscribe(result => {
                this.bottomblogList = result;
                for (let i = 0; i < this.bottomblogList.length; i++) {
                    let inputWords = this.bottomblogList[i].data_value[0].description.replace(/<[^>]*>/g, '').split(' ');
                    if (inputWords.length > 50)
                        this.bottomblogList[i].data_value[0].description = inputWords.slice(0, 50).join(' ') + ' ...';
                    else
                        this.bottomblogList[i].data_value[0].description = inputWords.join(' ');
                }
            });
    }

}
