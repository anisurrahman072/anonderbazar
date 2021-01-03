import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subscription} from 'rxjs';
import {NzNotificationService} from 'ng-zorro-antd';
import {ActivatedRoute} from '@angular/router';

import {GenreService} from "../../../../services/genre.service";
import {environment} from "../../../../../environments/environment";

@Component({
    selector: 'app-genre-read',
    templateUrl: './genre-read.component.html',
    styleUrls: ['./genre-read.component.css']
})
export class GenreReadComponent implements OnInit, OnDestroy {
    sub: Subscription;
    id: number;
    data: any;
  IMAGE_ENDPOINT = environment.IMAGE_ENDPOINT;


    constructor(private route: ActivatedRoute,
                private _notification: NzNotificationService,
                private genreService: GenreService) {
    }
    // For initiating the section element with data
    ngOnInit() {
        this.sub = this.route.params.subscribe(params => {
            this.id = +params['id']; // (+) converts string 'id' to a number
          
            this.genreService.getById(this.id)
                .subscribe(result => {
                    this.data = result;
                });
        });
    }

    ngOnDestroy(): void {
        this.sub ? this.sub.unsubscribe() : '';
    
    }
}
