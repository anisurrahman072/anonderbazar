import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

import { EventService } from "../../../../services/event.service";
import { EventPriceService } from '../../../../services/event-price.service';
import {environment} from "../../../../../environments/environment";

@Component({
    selector: 'app-event-read',
    templateUrl: './event-read.component.html',
    styleUrls: ['./event-read.component.css']
})
export class EventReadComponent implements OnInit {
    sub: Subscription;
    id: number;
    data: any;
    IMAGE_ENDPOINT = environment.IMAGE_ENDPOINT;
    status_id: any;
    addedPrices:any;
    constructor(private route: ActivatedRoute,
        private eventService: EventService,
        private eventPriceService:EventPriceService) { }
 // init the component
    ngOnInit() {
        this.status_id = this.route.snapshot.paramMap.get('status');
        this.sub = this.route.params.subscribe(params => {
            this.id = +params['id']; // (+) converts string 'id' to a number
            this.eventService.getById(this.id)
                .subscribe(result => {
                    this.data = result;
                    this.eventPriceService.getSelectedPrices(result.event_price_ids).subscribe(result => {
                        this.addedPrices = result.data;
                      });
                    
                });
        });
        
    }

    ngOnDestroy(): void {
        this.sub ? this.sub.unsubscribe() : '';

    }

}
