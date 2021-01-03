import {Component, OnInit} from '@angular/core';
import {Subscription} from 'rxjs';
import {NzNotificationService} from 'ng-zorro-antd';
import {ActivatedRoute} from '@angular/router';
import {BrandService} from '../../../../services/brand.service';

import {AuthService} from '../../../../services/auth.service';
import {UserService} from '../../../../services/user.service';
import {environment} from "../../../../../environments/environment";

@Component({
    selector: 'app-brand-read',
    templateUrl: './profile-read.component.html',
    styleUrls: ['./profile-read.component.css']
})
export class ProfileReadComponent implements OnInit {
    sub: Subscription;
    id: number;
    data: any;
    IMAGE_ENDPOINT = environment.IMAGE_ENDPOINT;
    private userID: any;
    

    constructor(private route: ActivatedRoute,
                private _notification: NzNotificationService,
                private userService: UserService,
                private authService: AuthService) {
    }
 // init the component
    ngOnInit() {
        const userId = this.authService.getCurrentUserId();
        if (userId) {
            this.userID = userId;

            this.userService.getById(this.userID).subscribe((result) => {
                if (result) {
                    this.data = result;
                }
            });
        }

    }

}
