import { Component, OnInit } from '@angular/core';
import {InvestorService} from "../../../../services/investor.service";
import {GLOBAL_CONFIGS} from "../../../../../environments/global_config";
import {concatMap} from 'rxjs/operators/concatMap';

@Component({
  selector: 'app-investor',
  templateUrl: './investor.component.html',
  styleUrls: ['./investor.component.css']
})
export class InvestorComponent implements OnInit {

  _isSpinning = true;
  investors: any;
  page: number = 1;
  limit: number = 20;
  total: any;
  statusSearchValue: any;
  options: any[] = GLOBAL_CONFIGS.INVESTOR_STATUS;

  constructor(private investorService: InvestorService) { }

  ngOnInit() {
    this.getPageData();
  }

  getPageData($event?: any){
    this._isSpinning = true;
    if($event){
      this.page = $event;
    }
    this.investorService.getAllInvestor(this.page, this.limit, this.statusSearchValue || '')
        .subscribe(investors => {
          this._isSpinning = false;
          this.total = investors.total;
          this.investors = investors.data;
        })
  }

    updateStatus($event, id, status){
      this._isSpinning = true;
      this.investorService.updateInvestorStatus({
        id: id,
        status: status
      }).subscribe(() => {
        this.getPageData();
        this._isSpinning = false;
      })
    }

}
