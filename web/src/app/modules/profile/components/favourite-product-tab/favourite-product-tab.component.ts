import {Component, OnInit, ViewChild} from '@angular/core';
import {Store} from "@ngrx/store";
import {MatPaginator} from "@angular/material";
import {AuthService, FavouriteProductService} from "../../../../services";
import * as fromStore from "../../../../state-management";
import {AppSettings} from "../../../../config/app.config";
import {Subscription} from "rxjs/Subscription";

@Component({
    selector: 'Favourite-product-tab',
    templateUrl: './favourite-product-tab.component.html',
    styleUrls: ['./favourite-product-tab.component.scss']
})
export class FavouriteProductTabComponent implements OnInit {

    IMAGE_ENDPOINT: string = AppSettings.IMAGE_ENDPOINT;
    favouriteProducts: any = null;

    @ViewChild(MatPaginator) paginator: MatPaginator;
    private sub: Subscription;

    /*
    * constructor for FavouriteProductTabComponent
    */
    constructor(private store: Store<fromStore.HomeState>,
                private authService: AuthService,
                private favouriteProductService: FavouriteProductService) {
    }

    //init the component
    ngOnInit(): void {

        this.sub = this.store.select<any>(fromStore.getFavouriteProduct).subscribe((ss) => {

            this.favouriteProductService.getByAuthUser()
                .subscribe((favProducts) => {
                    this.favouriteProducts = favProducts;
                    /*console.log(this.favouriteProducts);*/
                }, (error) => {
                    console.log(error);
                })

        });
    }

    ngOnDestroy() {
        this.sub ? this.sub.unsubscribe() : '';
    }

    //Event called for delete all favourite products
    onDeleteAll() {
        this.favouriteProductService.deleteAllByUserId(this.authService.getCurrentUserId()).subscribe(res => {
            this.store.dispatch(new fromStore.LoadFavouriteProduct());
        })
    }
}

