import {Component, Input, OnInit} from '@angular/core';
import {AppSettings} from "../../../../config/app.config";
import {NotificationsService} from "angular2-notifications";


@Component({
    selector: 'app-category-item',
    templateUrl: './category-item.component.html',
    styleUrls: ['./category-item.component.scss']
})
//This is a child component for category component
//Included in category component view
export class CategoryItemComponent implements OnInit {
    IMAGE_ENDPOINT = AppSettings.IMAGE_ENDPOINT;
    @Input() dataCategory;
    category: any;
    isDisplay: boolean;

    /*
    * constructor for CategoryItemComponent
    */
    constructor(private _notify: NotificationsService) {
        this.isDisplay = false;
    }

    //init the component
    ngOnInit() {
        this.category = this.dataCategory;
    }

    // Method called in error
    erroralert() {
        this._notify.error('compare list is full, delete first!!!');
    }
}
