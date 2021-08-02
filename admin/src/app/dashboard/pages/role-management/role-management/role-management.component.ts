import {Component, OnInit} from '@angular/core';
import {NzNotificationService} from "ng-zorro-antd";
import {Router} from "@angular/router";
import {RoleManagementService} from "../../../../services/role-management.service";

@Component({
    selector: 'app-role-management',
    templateUrl: './role-management.component.html',
    styleUrls: ['./role-management.component.css']
})
export class RoleManagementComponent implements OnInit {

    _isSpinning: boolean = true;
    loading: boolean = false;
    groupsLimit: number = 10;
    groupsPage: number = 1;
    totalGroups: number = 0;
    groupsData: any = [];

    constructor(
        private _notification: NzNotificationService,
        private roleManagementService: RoleManagementService,
        private router: Router
    ) {
    }

    ngOnInit() {
        this.getAllGroups();
    }

    getAllGroups() {
        this._isSpinning = true;
        this.roleManagementService.getAllGroups(this.groupsLimit, this.groupsPage)
            .subscribe(result => {
                this.loading = false;
                this.groupsData = result.data;
                /*console.log('grouip data: ', this.groupsData);*/
                this.totalGroups = result.total;
                this._isSpinning = false
            }, error => {
                this._isSpinning = false;
                this._notification.error('Sorry!', 'Something went wrong while getting groups data');
                console.log('Group error: ', error);
            })
    }

    /**Event method for deleting Groups*/
    deleteGroup(index, id) {
        if (id == 1 || id === 2 || id === 4) {
            this._notification.warning('Stop!', "No one can delete Admin, Customer or Owner group, rather you can change edit their permissions");
            return;
        }
        this._isSpinning = true;
        this.roleManagementService.deleteGroup(id).subscribe(result => {
            this._notification.warning('Group Delete', "Deleted Successfully");
            this._isSpinning = false;
            this.getAllGroups();
        }, (err) => {
            this._isSpinning = false;
            this._notification.error('Sorry!!', 'Failed to delete group');
            console.log('group delete error: ', err);
        });
    };

}
