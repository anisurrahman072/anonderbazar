import {Component, OnInit} from '@angular/core';
import {Subscription} from 'rxjs';
import {NzNotificationService} from 'ng-zorro-antd';
import {ActivatedRoute} from '@angular/router';
import {CraftsmanService} from '../../../../services/craftsman.service';
import { CraftmanPriceService } from '../../../../services/craftman-price.service';
import {environment} from "../../../../../environments/environment";
import {UserService} from "../../../../services/user.service";
import moment from "moment";



@Component({
    selector: 'app-brand-read',
    templateUrl: './craftsman-read.component.html',
    styleUrls: ['./craftsman-read.component.css']
})
export class CraftsmanReadComponent implements OnInit {
    sub: Subscription;
    id: number;
    data: any;
    craftsmanproducts:any=[];
    designs: any = [];
    IMAGE_ENDPOINT = environment.IMAGE_ENDPOINT;

    constructor(private route: ActivatedRoute,
                private _notification: NzNotificationService,
                private craftsmanService: CraftsmanService,
                private userService: UserService) {
    }
    // init the component
    ngOnInit() {
        this.sub = this.route.params.subscribe(params => {
            this.id = +params['id']; // (+) converts string 'id' to a number
            this.userService.getById(this.id).subscribe((result) => {
                if (result) {
                    this.data = result;
                    this.data.dob = this.data.dob ? moment(this.data.dob).format('d/M/yyyy') : '';
                }
            });

/*            this.craftsmanService.getAllCraftsmanBycraftsmanId(this.id).subscribe(result=>{
                this.craftsmanproducts = result;
            });

            this.craftmanPriceService.getByCraftmanId(this.id).subscribe(result=>{
                this.designs = result;
            });*/
        });
    }

}
