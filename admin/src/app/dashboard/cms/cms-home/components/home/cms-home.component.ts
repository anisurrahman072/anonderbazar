import { Component, OnInit } from '@angular/core';
import { CmsService } from '../../../../../services/cms.service';

@Component({
  selector: 'app-cms-home',
  templateUrl: './cms-home.component.html',
  styleUrls: ['./cms-home.component.css']
})
export class CmsHomeComponent implements OnInit {
  cmsData: any;
  constructor(private cmsService: CmsService) {}
  //Event method for getting all the data for the page

  ngOnInit() {
    this.cmsService.getBySectionName('HOME').subscribe(result => {
      this.cmsData = result;
      });
    }
  }
