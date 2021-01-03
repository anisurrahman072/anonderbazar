import { Component, Input, OnInit } from '@angular/core'; 
import { CmsService } from '../../../../services/cms.service';
import {AppSettings} from "../../../../config/app.config";
import { Observable } from 'rxjs';
@Component({
  selector: 'app-section-wholesale',
  templateUrl: './section-wholesale.component.html',
  styleUrls: ['./section-wholesale.component.scss']
})
export class WholeSaleComponent implements OnInit { 
    private IMAGE_ENDPOINT = AppSettings.IMAGE_ENDPOINT;
    @Input() dataProductList: Observable<any>;


    constructor(private cmsService: CmsService) {
    }
  ngOnInit() { 
  }

}
