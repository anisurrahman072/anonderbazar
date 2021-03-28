import {Component, OnDestroy, OnInit} from '@angular/core';
import { UIService } from '../../services/ui/ui.service';
import { AuthService } from '../../services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AccessControl } from '../../auth/core/guard/AccessControl.guard';

@Component({
  selector: 'app-core',
  templateUrl: './dashboard-core.component.html',
  styleUrls: ['./dashboard-core.component.css']
})
export class DashboardCoreComponent implements OnInit, OnDestroy {
  currentUser: any;
  isCollapsed: boolean;

  constructor(
    private uiService: UIService,
    private router: Router,
    private authService: AuthService,
    private route: ActivatedRoute,
    private canActivateGuard: AccessControl
  ) {}

  ngOnInit() {
    this.uiService.currentSidebarIsCollapsed.subscribe((res: boolean) => {
      this.isCollapsed = res;
    });

    this.currentUser = this.authService.getCurrentUserInfo();
    if (this.authService.getCurrentUserAccessName() === 'owner') {
      this.uiService.selectedWarehouseUpdate(this.currentUser.warehouse_id.id);
    }
    else if (this.currentUser.group_id.name === 'craftsman') {
      this.uiService.selectedWarehouseUpdate(this.currentUser.warehouse_id.id);
    }
  }

  ngOnDestroy() {
  }
  logOut($event) {
    this.uiService.selectedWarehouseUpdate(null);
    this.authService.logout();
    this.canActivateGuard.canActivate(this.route.snapshot);

    this.router.navigate(['/']);
  }
}
