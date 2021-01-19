import {Component, HostListener, Inject, OnInit} from '@angular/core';
import {State, Store} from '@ngrx/store';
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
import {FavouriteProduct, Product, User} from '../../models';
import 'rxjs/add/operator/startWith';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import {MatAutocompleteSelectedEvent} from '@angular/material';
import {CmsService} from '../../services/cms.service';
import {FilterUiService} from './../../services/ui/filterUi.service';
import {ShoppingModalService} from '../../services/ui/shoppingModal.service';
import {DOCUMENT} from "@angular/common";

export interface DialogData {
    user: 'user A' | 'user B' | 'user C';
}

// import {NgbModal, ModalDismissReasons} from '@ng-bootstrap/ng-bootstrap';
@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
    states: any[] = [
        {
            name: 'Arkansas',
            population: '2.978M',
            // https://commons.wikimedia.org/wiki/File:Flag_of_Arkansas.svg
            flag:
                'https://upload.wikimedia.org/wikipedia/commons/9/9d/Flag_of_Arkansas.svg'
        },
        {
            name: 'California',
            population: '39.14M',
            // https://commons.wikimedia.org/wiki/File:Flag_of_California.svg
            flag:
                'https://upload.wikimedia.org/wikipedia/commons/0/01/Flag_of_California.svg'
        },
        {
            name: 'Florida',
            population: '20.27M',
            // https://commons.wikimedia.org/wiki/File:Flag_of_Florida.svg
            flag:
                'https://upload.wikimedia.org/wikipedia/commons/f/f7/Flag_of_Florida.svg'
        },
        {
            name: 'Texas',
            population: '27.47M',
            // https://commons.wikimedia.org/wiki/File:Flag_of_Texas.svg
            flag:
                'https://upload.wikimedia.org/wikipedia/commons/f/f7/Flag_of_Texas.svg'
        }
    ];
    stateCtrl: FormControl;
    filteredProducts: Observable<Product[]>;

    IMAGE_ENDPOINT = AppSettings.IMAGE_ENDPOINT;
    ADMIN_ENDPOINT = AppSettings.API_ENDPOINT;
    ADMIN_ENDPOINT1 = AppSettings.API_ENDPOINT;
    user_id: any;
    cart$: Observable<any>;
    favourites$: Observable<FavouriteProduct>;
    compare$: Observable<any>;
    currentUser$: Observable<any>;
    cartShow: boolean = false;
    clicked: false;
    navCollapsed: boolean = false;
    private products: Observable<Product[]>;
    private cmsLogoData: any;
    serach_result: any;
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
                // private modalService: NgbModal,

                private FilterUiService: FilterUiService
    ) {
        this.stateCtrl = new FormControl();

        this.products = this.productService.getAll();
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

    filter(val: string) {
        return this.products.map(response =>
            response.filter(option => {
                return option.name.toLowerCase().indexOf(val.toLowerCase()) === 0;
            })
        );
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
    main_search(event: any) {
        this.FilterUiService.changesearchterm(event.target.value);
        this.get_search_result(event.target.value)
    }

    //Event for search enter press
    onPressEnter(event) {
        this.router.navigate(['/products'], {queryParams: {search: event.target.value}});
    }

    //Event method for getting search result
    private get_search_result(data: any) {
        this.productService.serach_result(data).subscribe(result => {
            this.filteredProducts = result.data;
        });
    }
}
