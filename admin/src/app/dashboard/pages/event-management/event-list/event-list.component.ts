import { Component, OnInit } from '@angular/core';

import { AuthService } from '../../../../services/auth.service';
import { EventService } from '../../../../services/event.service';
import { NzNotificationService } from 'ng-zorro-antd';
import { Subscription } from 'rxjs';
import { UIService } from '../../../../services/ui/ui.service';
import { ActivatedRoute } from "@angular/router";
import {environment} from "../../../../../environments/environment";
@Component({
  selector: 'app-event-list',
  templateUrl: './event-list.component.html',
  styleUrls: ['./event-list.component.css']
})
export class EventListComponent implements OnInit {
  status:any;
  limit: number = 10;
  page: number = 1;
  total: number;
  data: any = [];
  _isSpinning: boolean;
  IMAGE_ENDPOINT = environment.IMAGE_ENDPOINT;
  currentUser: any;

  constructor(private route: ActivatedRoute,
              private uiService: UIService,
              private _notification: NzNotificationService,
              private eventService: EventService,
              private authService: AuthService
    ) { }
 // init the component
  ngOnInit() {
    this.route.queryParams.filter(params => params.status).subscribe(params => {
      this.status = params.status;
      this.getEventData();
    });
  }
    //Event method for getting all the data for the page
  getEventData(): void {
    this.currentUser = this.authService.getCurrentUser();

    this.eventService
      .getAllEventsByStatus(
        this.currentUser.userInfo.id,
        this.status,
        this.page,
        this.limit
      )
      .subscribe(
        result => {
          this.data = result.data;
          this.total = result.total;
          this._isSpinning = false;
          // temporary
        },
        result => {
          this._isSpinning = false;
        }
      );
  }
  //Event method for pagination change
  changePage(page: number, limit: number) {
    this.page = page;
    this.limit = limit;
    this.getEventData();
    return false;
  }
  //Event method for resetting all filters
  resetAllFilter() {
    this.limit = 10;
    this.page = 1;
    this.getEventData();
  }
  //Event method for deleting event
  deleteConfirm(index, id) {
    this.eventService.delete(id).subscribe(result => {
      this.getEventData();
      this._notification.create(
        'Successful Message',
        'Event has been removed successfully',
        ''
      );
    });
  }

}
