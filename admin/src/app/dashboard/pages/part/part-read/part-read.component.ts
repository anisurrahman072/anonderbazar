import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subscription} from 'rxjs';
import {NzNotificationService} from 'ng-zorro-antd';
import {ActivatedRoute} from '@angular/router';

import {PartService} from "../../../../services/part.service";
import {environment} from "../../../../../environments/environment";

@Component({
    selector: 'app-part-read',
    templateUrl: './part-read.component.html',
    styleUrls: ['./part-read.component.css']
})
export class PartReadComponent implements OnInit, OnDestroy {
    sub: Subscription;
    id: number;
    data: any;
    IMAGE_ENDPOINT = environment.IMAGE_ENDPOINT;
    
    
    constructor(private route: ActivatedRoute,
                private _notification: NzNotificationService,
                private partService: PartService) {
    }
    
    ngOnInit() {
        this.sub = this.route.params.subscribe(params => {
            this.id = +params['id']; // (+) converts string 'id' to a number
            this.partService.getById(this.id)
                .subscribe(result => {
                    this.data = result;
                    
                });
        });
    }
    
    ngOnDestroy(): void {
        this.sub ? this.sub.unsubscribe() : '';
    
    }
}
