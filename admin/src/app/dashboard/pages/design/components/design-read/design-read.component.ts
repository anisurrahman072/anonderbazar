import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subscription} from 'rxjs';
import {ActivatedRoute} from '@angular/router';
import {DesignService} from "../../../../../services/design.service";
import {DesignCategoryService} from '../../../../../services/design-category.service';
import {GenreService} from '../../../../../services/genre.service';
import {environment} from "../../../../../../environments/environment";
import {NzNotificationService} from "ng-zorro-antd";


@Component({
    selector: 'app-design-read',
    templateUrl: './design-read.component.html',
    styleUrls: ['./design-read.component.css']
})
export class DesignReadComponent implements OnInit, OnDestroy {
    sub: Subscription;
    id: number;
    data: {
        design_category_id: any,
        design_subcategory_id: any,
        genre_id: any,
    };
    designCategory: any = [];
    designSubCategory: any = [];
    designGenre: any = [];
    IMAGE_ENDPOINT = environment.IMAGE_ENDPOINT;

    constructor(private route: ActivatedRoute,
                private _notification: NzNotificationService,
                private designService: DesignService,
                private designCategoryService: DesignCategoryService,
                private designGenreService: GenreService) {
    }

    // init the component
    ngOnInit() {
        this.sub = this.route.params.subscribe(params => {
            this.id = +params['id']; // (+) converts string 'id' to a number
            this.designService.getById(this.id)
                .subscribe(result => {
                    if (result) {
                        this.data = result;
                        this.loadData();
                    }
                });
        });

    }

    //Event method for getting all the data for the page
    loadData() {
        this.data.design_category_id.forEach(element => {
            this.designCategoryService.getById(element)
                .subscribe(result => {
                    this.designCategory.push(result);
                });
        });

        this.data.design_subcategory_id.forEach(element => {
            this.designCategoryService.getById(element)
                .subscribe(result => {
                    this.designSubCategory.push(result);


                });
        });

        this.data.genre_id.forEach(element => {
            this.designGenreService.getById(element)
                .subscribe(result => {
                    this.designGenre.push(result);

                });
        });
    }

    ngOnDestroy(): void {
        this.sub ? this.sub.unsubscribe() : '';

    }

}