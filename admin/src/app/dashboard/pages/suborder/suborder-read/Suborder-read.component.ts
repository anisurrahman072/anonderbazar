import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subscription} from 'rxjs';
import {NzNotificationService} from 'ng-zorro-antd';
import {ActivatedRoute} from '@angular/router';
import {SuborderService} from '../../../../services/suborder.service';

@Component({
    selector: 'app-brand-read',
    templateUrl: './Suborder-read.component.html',
    styleUrls: ['./Suborder-read.component.css']
})
export class SuborderReadComponent implements OnInit, OnDestroy {
    sub: Subscription;
    id: number;
    data: any;
    options: any[];
    
    constructor(private route: ActivatedRoute,
                private _notification: NzNotificationService,
                private suborderService: SuborderService) {
    }
    
    ngOnInit() {
        this.sub = this.route.params.subscribe(params => {
            this.id = +params['id']; // (+) converts string 'id' to a number
            this.suborderService.getById(this.id)
                .subscribe(result => {
                    this.data = result;
                });
        });
    }
    
    ngOnDestroy(): void {
        this.sub ? this.sub.unsubscribe() : '';
    
    }
}
