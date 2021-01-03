import {Component, OnInit} from '@angular/core';
import { EventService } from '../../../services/event.service';

import { AuthService } from '../../../services/auth.service';
import {environment} from "../../../../environments/environment";


@Component({
  selector: 'app-home',
  templateUrl: './dashboard-home.component.html',
  styleUrls: ['./dashboard-home.component.css']
})
export class DashboardHomeComponent implements OnInit {
  array = [ 1, 2, 3, 4 ];
  limit: number = 10;
  page: number = 1;
  status: number;
  data: any;
  IMAGE_ENDPOINT = environment.IMAGE_ENDPOINT;
  currentUser: any;

  constructor(private eventService: EventService,
    private authService: AuthService) {
  }
 // init the component
  ngOnInit() {
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
        }

      );
  }
}
