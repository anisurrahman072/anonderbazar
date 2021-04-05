import {
    AfterViewChecked,
    AfterViewInit,
    ChangeDetectorRef,
    Component,
    Inject, OnDestroy,
    OnInit,
    PLATFORM_ID,
    Renderer2,
    ViewChild
} from '@angular/core';
import {ActivatedRoute, NavigationCancel, NavigationEnd, NavigationStart, Router} from "@angular/router";
import {Title} from "@angular/platform-browser";
import "rxjs/add/operator/filter";
import "rxjs/add/operator/mergeMap";
import {Observable} from "rxjs/Observable";
import {Store} from "@ngrx/store";
import {AuthService} from "../services";
import {CartService} from "../services";
import {NgProgressRef} from "@ngx-progressbar/core";
import {NgProgress} from "@ngx-progressbar/core";
import * as  fromStore from '../state-management';
import {Cart} from "../models";
import {isPlatformBrowser} from "@angular/common";
import {SyncStorage} from "../state-management";
import {UIService} from "../services/ui/ui.service";
import {CompareService} from "../services/compare.service";
import {LoaderService} from "../services/ui/loader.service";
import {NotificationsService} from "angular2-notifications";
import {Subscription} from "rxjs/Subscription";


@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, AfterViewInit, OnDestroy {
    title = 'app';
    currentUser: Observable<any>;
    cart: Observable<Cart>;
    user_id: any;
    moadlProgressRef: NgProgressRef;
    loading;
    sidebarOpened$: any = false;
    panelOpenState: boolean = false;

    private tokenExpiredNotiSub: Subscription;

    constructor(@Inject(PLATFORM_ID) private platformId: Object,
                private router: Router,
                private readonly renderer: Renderer2,
                public progress: NgProgress,
                private activatedRoute: ActivatedRoute,
                private authService: AuthService,
                private store: Store<fromStore.HomeState>,
                private cartService: CartService,
                private uiService: UIService,
                private compareService: CompareService,
                private titleService: Title,
                public loaderService: LoaderService,
                private _notify: NotificationsService,
                private cdr: ChangeDetectorRef) {
        this.loading = true;
    }

    // init the component
    ngOnInit() {
        this.renderer.listen('window', 'storage', event => {
            if (event.key === 'home') {
                this.store.dispatch(new SyncStorage(event.key));
            }
        });

        this.tokenExpiredNotiSub = this.uiService.tokenExpiredNotificationObservable.subscribe((message: string) => {
            this.store.dispatch(new fromStore.LoadCurrentUserSuccess(null));
            this.store.dispatch(new fromStore.LoadCartSuccess(null));
            this.store.dispatch(new fromStore.LoadFavouriteProductSuccess([]));
            this._notify.error(message);
        }, (err) => {
            console.log(err);
        })

        this.moadlProgressRef = this.progress.ref('loadingModal');

        this.user_id = this.authService.getCurrentUserId();

        this.initialize();
        this.scrollTopAndTitleChange();

        this.uiService.currentsidebarShowInfo.subscribe((r) => {
            this.sidebarOpened$ = r;
        });

        if (this.loaderService.loadingSubject) {
            this.loaderService.loadingSubject.subscribe((event) => {
                this.loading = event;
                this.cdr.detectChanges();
            });
        }

    }

    ngOnDestroy(): void {
        this.tokenExpiredNotiSub ? this.tokenExpiredNotiSub.unsubscribe() : "";
    }

    ngAfterViewInit() {
        this.router.events
            .subscribe((event) => {
                if (event instanceof NavigationStart) {
                    this.loading = true;
                } else if (
                    event instanceof NavigationEnd ||
                    event instanceof NavigationCancel
                ) {
                    this.loading = false;
                }
            });
    }

    initialize() {
        this.store.dispatch(new fromStore.LoadCart());
        this.store.dispatch(new fromStore.LoadCurrentUser());
        this.store.dispatch(new fromStore.LoadFavouriteProduct());
        this.store.dispatch(new fromStore.LoadCompare());

    }

    // scroll top function
    scrollTopAndTitleChange() {
        if (isPlatformBrowser(this.platformId)) {
            this.router.events
                .filter((event) => event instanceof NavigationEnd)
                .map(() => this.activatedRoute)
                .map((route) => {
                    while (route.firstChild) route = route.firstChild;
                    return route;
                })
                .filter((route) => route.outlet === 'primary')
                .mergeMap((route) => route.data)
                .subscribe((event) => {
                    window.scrollTo(0, 0);
                    this.titleService.setTitle(event['title'])
                });
        }
    }


}
