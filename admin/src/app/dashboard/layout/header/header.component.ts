import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AuthService } from '../../../services/auth.service';

import { Router } from '@angular/router';
import { UIService } from '../../../services/ui/ui.service';
import { ChatService } from '../../../services/chat.service';
import { Subscription } from 'rxjs';
import {environment} from "../../../../environments/environment";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  isCollapsed: Boolean;
  @Input() currentUser: any = {};

  @Output() logout = new EventEmitter();

  IMAGE_ENDPOINT = environment.IMAGE_ENDPOINT;
  currentWarehouseSubscriprtion: Subscription;
  currentWarehouseId: any;
  listOfNotifications = [];
  totalnotification: number;

  constructor(
    private chatService: ChatService,
    private authService: AuthService,
    private router: Router,
    private uiService: UIService
  ) {}
  //Event method for getting all the data for the page

  ngOnInit() {
    this.currentWarehouseSubscriprtion = this.uiService.currentSelectedWarehouseInfo.subscribe(
      warehouseId => { 
        this.currentWarehouseId = warehouseId || '';
      }
    );
    this.uiService.currentSidebarIsCollapsed.subscribe((res: Boolean) => {
      this.isCollapsed = res;
    });
    this.chatService.getAllChatByWarehouse(this.currentWarehouseId).subscribe(result=>{
      this.listOfNotifications = result.data;
      this.totalnotification = +result.totalnotification;
    });
  }
  
  isCollapsedToggle() {
    this.uiService.sidebarIsCollapsedChange(!this.isCollapsed);
  }

  search() {}

  logOutClick() {
    this.logout.emit();
  }
}
