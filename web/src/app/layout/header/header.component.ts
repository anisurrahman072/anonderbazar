import {Component, HostListener, Inject, OnInit} from '@angular/core';
import {Store} from '@ngrx/store';
import {Observable} from 'rxjs/Observable';
import * as fromStore from '../../state-management';
import {LoginModalService} from '../../services/ui/loginModal.service';
import {AuthService, CartItemService, ProductService, UserService} from '../../services';
import {Router} from '@angular/router';
import {AppSettings} from '../../config/app.config';
import {NotificationsService} from 'angular2-notifications';
import {NgProgress} from '@ngx-progressbar/core';
import {UIService} from '../../services/ui/ui.service';
import {FormControl} from '@angular/forms';
import {FavouriteProduct, Product} from '../../models';
import 'rxjs/add/operator/startWith';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import {MatAutocompleteSelectedEvent} from '@angular/material';
import {CmsService} from '../../services';
import {FilterUiService} from '../../services/ui/filterUi.service';
import {ShoppingModalService} from '../../services/ui/shoppingModal.service';
import {DOCUMENT} from "@angular/common";
import * as ___ from 'lodash';


// import {NgbModal, ModalDismissReasons} from '@ng-bootstrap/ng-bootstrap';
@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

    stateCtrl: FormControl;
    filteredProducts: Observable<Product[]>;

    IMAGE_ENDPOINT = AppSettings.IMAGE_ENDPOINT;
    ADMIN_ENDPOINT = AppSettings.ADMIN_ENDPOINT;
    ADMIN_ENDPOINT1 = AppSettings.ADMIN_ENDPOINT;

    searchInputValue: any = null;

    user_id: any;
    cart$: Observable<any>;
    favourites$: Observable<FavouriteProduct>;
    compare$: Observable<any>;
    currentUser$: Observable<any>;
    cartShow: boolean = false;
    clicked: false;
    private cmsLogoData: any;

    isUser: boolean = false;

    /*
    * constructor for header component
    */
    constructor(@Inject(DOCUMENT) document,
                private store: Store<fromStore.HomeState>,
                private router: Router,
                private authService: AuthService,
                private cartItemService: CartItemService,
                public progress: NgProgress,
                private _notify: NotificationsService,
                private userService: UserService,
                private uiService: UIService,
                private productService: ProductService,
                private loginModalService: LoginModalService,
                private shoppingModalService: ShoppingModalService,
                private cmsService: CmsService,
                private FilterUiService: FilterUiService
    ) {
        this.stateCtrl = new FormControl();

        // this.products = this.productService.getAll();
    }

    // init the component
    ngOnInit() {
        this.store.dispatch(new fromStore.LoadCart());
        this.currentUser$ = this.store.select<any>(fromStore.getCurrentUser);
        if (this.authService.getCurrentUserId()) {
            this.isUser = true;
        }

        this.cart$ = this.store.select<any>(fromStore.getCart);
        this.favourites$ = this.store.select<any>(fromStore.getFavouriteProduct);
        this.compare$ = this.store.select<any>(fromStore.getCompare);

        this.cmsService.getBySectionName('LAYOUT', 'LOGO').subscribe((result: any) => {
            this.cmsLogoData = '';
            if (!___.isUndefined(result) && !___.isUndefined(result.data_value) && ___.isArray(result.data_value)) {
                this.cmsLogoData = result.data_value[0].image;
            }
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

    /*    filter(val: string) {
            return this.products.map(response =>
                response.filter(option => {
                    return option.name.toLowerCase().indexOf(val.toLowerCase()) === 0;
                })
            );
        }*/

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

    //Event method for showing sidebar menu
    showSidebar() {
        this.uiService.showSidebar(true);
    }

    //Event method for removing item from cart
    //params cart id
    removeCartItem(id) {
        this.progress.start('mainLoader');
        this.cartItemService.delete(id).subscribe(result => {
            this.store.dispatch(new fromStore.LoadCart());
            this._notify.error('remove from cart succeeded');
            this.progress.complete('mainLoader');
        });
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
            this.get_search_result(event.target.value)
        } else {
            this.filteredProducts = null
        }
    }

    //Event for search enter press
    onPressEnter(event) {
        if (event.target !== undefined && event.target.value !== undefined) {
            this.router.navigate(['/products'], {queryParams: {search: event.target.value}});
        }else {
            this.router.navigate(['/products'], {queryParams: {search: event}});
        }
    }

    clickEvent() {
        this.onPressEnter(this.searchInputValue);
    }

    //Event method for getting search result
    private get_search_result(data: any) {
        this.productService.serach_result(data).subscribe(result => {
            this.filteredProducts = result.data;
        });
    }
}
