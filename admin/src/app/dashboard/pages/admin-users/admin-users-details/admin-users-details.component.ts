import {Component, OnInit} from '@angular/core';
import {Subscription} from 'rxjs';
import {ActivatedRoute} from '@angular/router';
import {CraftsmanService} from '../../../../services/craftsman.service';
import {environment} from "../../../../../environments/environment";
import {NzNotificationService} from "ng-zorro-antd";

@Component({
    selector: 'app-admin-users-details',
    templateUrl: './admin-users-details.component.html',
    styleUrls: ['./admin-users-details.component.css']
})
export class AdminUsersDetailsComponent implements OnInit {
    sub: Subscription;
    id: number;
    data: any;
    IMAGE_ENDPOINT = environment.IMAGE_ENDPOINT;

    constructor(
        private route: ActivatedRoute,
        private _notification: NzNotificationService,
        private craftsmanService: CraftsmanService,
    ) {
    }

    ngOnInit() {
        this.sub = this.route.params.subscribe(params => {
            this.id = +params['id']; // (+) converts string 'id' to a number
            this.craftsmanService.getById(this.id).subscribe((result) => {
                if (result) {
                    this.data = result;
                    console.log('user data: ', this.data);
                }
            });
        });
    }

}
