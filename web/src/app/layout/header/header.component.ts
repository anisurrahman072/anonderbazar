import {Component, HostListener, Inject, OnInit} from '@angular/core';
import {Store} from '@ngrx/store';
import {Observable} from 'rxjs/Observable';
import * as fromStore from '../../state-management';
import {LoginModalService} from '../../services/ui/loginModal.service';
import {AuthService, ProductService} from '../../services';
import {Router} from '@angular/router';
import {AppSettings} from '../../config/app.config';
import {FormControl} from '@angular/forms';
import {FavouriteProduct} from '../../models';
import 'rxjs/add/operator/startWith';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import {MatAutocompleteSelectedEvent} from '@angular/material';
import {CmsService} from '../../services';
import {FilterUiService} from '../../services/ui/filterUi.service';
import {ShoppingModalService} from '../../services/ui/shoppingModal.service';
import {DOCUMENT} from "@angular/common";


@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

    stateCtrl: FormControl;
    filteredProducts: any [];

    IMAGE_ENDPOINT = AppSettings.IMAGE_ENDPOINT;
    ADMIN_ENDPOINT1 = AppSettings.ADMIN_ENDPOINT;

    cart$: Observable<any>;
    favourites$: Observable<FavouriteProduct>;
    compare$: Observable<any>;
    currentUser$: Observable<any>;
    private cmsLogoData: any;
    private isUser: boolean = false;

    /*
    * constructor for header component
    */
    constructor(@Inject(DOCUMENT) document,
                private store: Store<fromStore.HomeState>,
                private router: Router,
                private authService: AuthService,
                private productService: ProductService,
                private loginModalService: LoginModalService,
                private shoppingModalService: ShoppingModalService,
                private cmsService: CmsService,
                private FilterUiService: FilterUiService
    ) {
        this.stateCtrl = new FormControl();
    }

    // init the component
    ngOnInit() {
        this.currentUser$ = this.store.select<any>(fromStore.getCurrentUser);
        if (this.authService.getCurrentUserId()) {
            this.isUser = true;
        }

        this.cart$ = this.store.select<any>(fromStore.getCart);
        this.favourites$ = this.store.select<any>(fromStore.getFavouriteProduct);
        this.compare$ = this.store.select<any>(fromStore.getCompare);

        this.cmsService.getBySectionName('LAYOUT', 'LOGO').subscribe(result => {
            this.cmsLogoData = result.data_value[0].image;
        });
    }

    @HostListener('window:scroll', ['$event'])
    onWindowScroll(e) {
        if (window.pageYOffset > 0) {
            let element = document.getElementById('anonder-bazar-sticky-menu');
            element.classList.add('sticky-header-fixed');
        } else {
            let element = document.getElementById('anonder-bazar-sticky-menu');
            element.classList.remove('sticky-header-fixed');
        }
    }

    //Event method for logout
    logOut() {
        this.authService.logout();
        this.store.dispatch(new fromStore.LoadCurrentUserSuccess(null));
        this.store.dispatch(new fromStore.LoadCartSuccess(null));
        this.store.dispatch(new fromStore.LoadFavouriteProductSuccess([]));
        this.router.navigate(['/']);
    }

    //Event method for showing login modal
    showLoginModal() {
        this.loginModalService.showLoginModal(true);
    }

    //Event method for showing shopping cart modal
    showShoppingCartModal() {
        this.shoppingModalService.showshoppingModal(true);
    }

    //Event method for searching product
    dda($event: MatAutocompleteSelectedEvent) {
        if ($event.option.value) {
            this.router.navigate(['/product-details/', $event.option.value.id]);
        }
    }

    displayFn(val) {
        return val ? val.name : val;
    }

    //Event method for search filter
    mainSearch(event: any) {
        if (event.target.value && event.target.value.length > 0) {
            this.FilterUiService.changesearchterm(event.target.value);
            this.getSearchResult(event.target.value)
        } else {
            this.filteredProducts = null
        }
    }

    //Event for search enter press
    onPressEnter(event) {
        this.router.navigate(['/products'], {queryParams: {search: event.target.value}});
    }

    //Event method for getting search result
    private getSearchResult(data: any) {
        this.productService.serach_result(data).subscribe(result => {
            this.filteredProducts = result.data;
        });
    }
}
