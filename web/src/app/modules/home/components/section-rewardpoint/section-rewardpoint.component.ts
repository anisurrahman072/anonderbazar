import { Component, Input, OnInit } from '@angular/core';

import { CmsService } from '../../../../services/cms.service';
import {AppSettings} from "../../../../config/app.config";
import { Observable } from 'rxjs';
@Component({
  selector: 'app-section-rewardpoint',
  templateUrl: './section-rewardpoint.component.html',
  styleUrls: ['./section-rewardpoint.component.scss']
})
export class RewardPointComponent implements OnInit {  
    @Input() dataProductList: Observable<any>;


    constructor(private cmsService: CmsService) {
    }
  ngOnInit() { 
  }

}
