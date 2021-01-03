import { Component, OnInit, Input } from '@angular/core';
import { AuthService } from '../../../services/auth.service';

import {environment} from "../../../../environments/environment";

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  currentUser: any;
  @Input() isCollapsed: boolean;
  IMAGE_ENDPOINT = environment.IMAGE_ENDPOINT;

  constructor(private authService: AuthService) {}
  //Event method for getting all the data for the page

  ngOnInit() {
      this.currentUser = this.authService.getCurrentUserInfo();
  }
}
