import {Component, OnInit} from '@angular/core';
import {Subscription} from 'rxjs';
import {ActivatedRoute} from '@angular/router';
import {AuthService} from '../../../../services/auth.service';
import {CraftsmanService} from '../../../../services/craftsman.service';
import {CraftmanPriceService} from '../../../../services/craftman-price.service';
import {environment} from "../../../../../environments/environment";
import {NzNotificationService} from "ng-zorro-antd";


@Component({
    selector: 'app-brand-read',
    templateUrl: './craftsman-read.component.html',
    styleUrls: ['./craftsman-read.component.css']
})
export class CraftsmanReadComponent implements OnInit {
    sub: Subscription;
    id: number;
    data: any;
    craftsmanproducts: any = [];
    designs: any = [];
    IMAGE_ENDPOINT = environment.IMAGE_ENDPOINT;
    private userID: any;


    constructor(private route: ActivatedRoute,
                private _notification: NzNotificationService,
                private craftsmanService: CraftsmanService,
                private authService: AuthService,
                private craftmanPriceService: CraftmanPriceService) {
    }

    // init the component
    ngOnInit() {
        this.sub = this.route.params.subscribe(params => {
            this.id = +params['id']; // (+) converts string 'id' to a number
            this.craftsmanService.getById(this.id).subscribe((result) => {
                if (result) {
                    this.data = result;
                }
            });

            this.craftsmanService.getAllCraftsmanBycraftsmanId(this.id).subscribe(result => {
                this.craftsmanproducts = result;
            });

            this.craftmanPriceService.getByCraftmanId(this.id).subscribe(result => {
                this.designs = result;
            });
        });
    }

}
