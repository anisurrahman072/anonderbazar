import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subscription} from 'rxjs';
import {NzNotificationService} from 'ng-zorro-antd';
import {ActivatedRoute} from '@angular/router';
import {VariantService} from '../../../../services/variant.service';

@Component({
    selector: 'app-variant-read',
    templateUrl: './variant-read.component.html',
    styleUrls: ['./variant-read.component.css']
})
export class VariantReadComponent implements OnInit, OnDestroy {
    sub: Subscription;
    id: number;
    data: any;
    typeSearchOptions = [
        {label: 'abstract', value: 0},
        {label: 'material', value: 1}
    ];


    constructor(private route: ActivatedRoute,
                private _notification: NzNotificationService,
                private variantService: VariantService) {
    }
 // init the component
    ngOnInit() {
        this.sub = this.route.params.subscribe(params => {
            this.id = +params['id']; // (+) converts string 'id' to a number
            this.variantService.getById(this.id)
                .subscribe(result => {
                    this.data = result;
                });
        });

    }

    ngOnDestroy(): void {
        this.sub ? this.sub.unsubscribe() : '';
    
    }

}
