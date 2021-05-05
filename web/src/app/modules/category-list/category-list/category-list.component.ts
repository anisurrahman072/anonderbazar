import {Component, Input, OnInit} from '@angular/core';
import {CategoryProductService} from '../../../services';
import {Title} from "@angular/platform-browser";

@Component({
    selector: 'app-category-list',
    templateUrl: './category-list.component.html',
    styleUrls: ['./category-list.component.scss'],
})

export class CategoryListComponent implements OnInit {
    dataCategoryList;
    @Input() dataTitle;

    constructor(
        private categoryProductService: CategoryProductService,
        private title: Title
    ) {
    }

    // init the component
    ngOnInit() {
        this.categoryProductService.getAllCategory().subscribe(result => {
            this.dataCategoryList = result;
        });

        this.addPageTitle();
    }

    private addPageTitle() {
        this.title.setTitle('Categories - Anonderbazar');
    }
}
