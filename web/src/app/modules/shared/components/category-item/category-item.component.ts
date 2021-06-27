import {Component, ElementRef, Input, OnInit} from '@angular/core';
import {AppSettings} from "../../../../config/app.config";
import {NotificationsService} from "angular2-notifications";
import {FilterUiService} from "../../../../services/ui/filterUi.service";
import {Router} from "@angular/router";


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

    selectedCategoryId: any;
    subCategoryList: any[];

    /*
    * constructor for CategoryItemComponent
    */
    constructor(
        private _notify: NotificationsService,
        private filterUIService: FilterUiService,
        private router: Router,
    ) {
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

    categoryClickEvent(category: any) {
        this.selectedCategoryId = category.id;
        this.subCategoryList = category.subCategory;
        this.isDisplay = false;
        this.changeCurrentCategory(category.id, category.type_id, category.name);
    }

    //Call if change in category
    changeCurrentCategory(id: number, type: String, name: String) {
        this.filterUIService.changeCurrentCategories(id);
        this.filterUIService.changeCategoryId(id);
        this.filterUIService.changeCategoryType(type);
        this.filterUIService.changeCategoryName(name);

        this.router.routeReuseStrategy.shouldReuseRoute = () => false;
        this.router.onSameUrlNavigation = 'reload';
        this.router.navigate(['/products', {type: 'category', id: id}], {
            queryParams: {
                category: id
            }
        });
    }
}
