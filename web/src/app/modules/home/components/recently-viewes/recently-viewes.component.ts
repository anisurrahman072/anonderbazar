import {Component, Input, OnInit} from '@angular/core';
import {AppSettings} from "../../../../config/app.config";
import {Observable} from "rxjs";

@Component({
  selector: 'app-recently-viewes',
  templateUrl: './recently-viewes.component.html',
  styleUrls: ['./recently-viewes.component.scss']
})
export class RecentlyViewesComponent implements OnInit {
  private middleblogList: any;
  private IMAGE_ENDPOINT = AppSettings.IMAGE_ENDPOINT;
  @Input() dataProductList: Observable<any>;
  constructor() { }

  ngOnInit() {
  }

}
