import {Component, OnInit} from '@angular/core';
import {Store} from "@ngrx/store";
import {Observable} from "rxjs/Observable";
import * as fromStore from "../../../state-management";
import {AppSettings} from "../../../config/app.config";
import {Product} from "../../../models";
import {NotificationsService} from "angular2-notifications";
import {CompareService} from "../../../services/compare.service";
import {Title} from "@angular/platform-browser";

@Component({
    selector: 'page-compare',
    templateUrl: './compare-page.component.html',
    styleUrls: ['./compare-page.component.scss']
})
export class ComparePageComponent implements OnInit {

    compare$: Observable<Product[]>;
    IMAGE_ENDPOINT = AppSettings.IMAGE_ENDPOINT;
    stepsLength: number = 0;

    constructor(private store: Store<fromStore.HomeState>,
                private compareService: CompareService,
                private _notify: NotificationsService,
                private title: Title
    ) {
    }

    // init the component
    ngOnInit() {
        this.compare$ = this.store.select<any>(fromStore.getCompare);
        this.addPageTitle();
    }

    //Method for all from compare section
    removeAllCompare() {
        this.store.dispatch(new fromStore.RemoveAllCompare());
        this.compareService.removeAllcompare();
        this._notify.error('all item has been removed from compare pages');

    }

    //Method for add to cart
    addToCart(product: Product) {
        alert('add:' + product.id);
    }

    //Method for add to favourite
    protected addToFavourite(product: Product) {
        alert('add:' + product.id);
    }

    //Method for remove from compare
    removeFromCompare(p: Product) {
        this.store.dispatch(new fromStore.RemoveFromCompare(p));
        this.compare$.subscribe(c => {
            this.compareService.setFullCompare(c);
        })
    }

    private addPageTitle() {
        this.title.setTitle('Compare Products - Anonderbazar');
    }
}
