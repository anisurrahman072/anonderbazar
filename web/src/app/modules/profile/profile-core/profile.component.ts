import {Component, OnDestroy, OnInit} from "@angular/core";
import * as fromStore from "../../../state-management";
import {Store} from "@ngrx/store";
import {Observable} from "rxjs/Observable";
import {User} from "../../../models/";
import {AuthService, FavouriteProductService, UserService} from "../../../services";
import {ActivatedRoute, Router} from '@angular/router';
import {PaymentAddressService} from "../../../services/payment-address.service";
import {NotificationsService} from "angular2-notifications";
import {FileHolder, UploadMetadata} from "angular2-image-upload";
import {AppSettings} from "../../../config/app.config";
import {LoaderService} from "../../../services/ui/loader.service";
import {ToastrService} from "ngx-toastr";


@Component({
    selector: "app-profile",
    templateUrl: "./profile.component.html",
    styleUrls: ["./profile.component.scss"]
})
export class ProfileComponent implements OnInit, OnDestroy  {
    currentUser$: Observable<User>;
    user: any;
    id: any;
    dashboardData: any;

    isDisabled: boolean;
    step = 0;
    pendingCount = 0;
    processingCount = 0;
    deliveredCount = 0;
    canceledCount = 0;
    totalCount = 0;
    isDashboard: boolean;
    isOrder: boolean;
    isWishlist: boolean;
    isProfile: boolean;
    isAddress: boolean;
/*    favouriteProducts$: Observable<FavouriteProduct[]>;
    favouriteProducts: FavouriteProduct[];
    profileRouterLink = [
        {label: "Favourites", path: "/profile/favourites"},
        {label: "Orders", path: "/profile/orders"}
    ];*/
    options: { value: number; label: string; icon: string }[];
    view: any[] = [700, 400];
    IMAGE_ENDPOINT = AppSettings.IMAGE_ENDPOINT;

    showLegend = true;
    style: any = {
        top: "10px"
    };
    single: any = [];
    customColors: any = [];
    isMessage: boolean;
    addresses: any = [];
    imageShow: any;
    imageUpload: any;
    imageDone: any;
    imageEdit: any;
    ImageFileEdit: any[] = [];
    ImageFile: File;

    constructor(
        private route: ActivatedRoute,
        private store: Store<fromStore.HomeState>,
        private authService: AuthService,
        private paymentAddressService: PaymentAddressService,
        private router: Router,
        private userService: UserService,
        private _notify: NotificationsService,
        private favouriteProductService: FavouriteProductService,
        public loaderService: LoaderService,
        private toastService: ToastrService,

    ) {
        this.options = [
            {
                value: 1,
                label: "pending",
                icon: "anticon-spin anticon-loading"
            },
            {
                value: 2,
                label: "processing",
                icon: "anticon-spin anticon-hourglass"
            },
            {
                value: 3,
                label: "delivered",
                icon: "anticon-check-circle"
            },
            {
                value: 4,
                label: "canceled",
                icon: "anticon-close-circle"
            }
        ];
        this.customColors = [
            {
                name: "pending",
                value: "#108EE9"
            },
            {
                name: "processing",
                value: "#FFE741"
            },
            {
                name: "delivered",
                value: "#1DBB99"
            },
            {
                name: "canceled",
                value: "#F04723"
            }
        ];

    }
    ngOnDestroy() {
    }
    //init the component
    ngOnInit(): void {

        this.isDisabled = true;
        this.isDashboard = true;
        this.isOrder = false;
        this.isWishlist = false;
        this.isProfile = false;
        this.isMessage = false;
        this.isAddress = false;
        this.imageShow = true;
        this.imageDone = false;
        this.imageEdit = true;
        this.imageUpload = false;
        this.currentUser$ = this.store.select<any>(fromStore.getCurrentUser);

        this.loaderService.showLoader();
        this.userService.getByIdForDashBoard(this.authService.getCurrentUserId()).subscribe(result => {
            this.dashboardData = result;
            console.log(' this.user', result, this.user);
            this.user = result.data;
            this.loaderService.hideLoader();
            this.pendingCount = this.dashboardData.pendingOrder;
            this.processingCount = this.dashboardData.processingOrder;
            this.deliveredCount = this.dashboardData.deliveredOrder;
            this.canceledCount = this.dashboardData.canceledOrder;
            this.totalCount = this.dashboardData.pendingOrder + this.dashboardData.deliveredOrder + this.dashboardData.canceledOrder;
        }, error => {
            console.log(error);
            this.loaderService.hideLoader();
            this.toastService.error('Problem in loading customer data', 'Problem!');
        });

        this.paymentAddressService.getAuthUserPaymentAddresses().subscribe(result => {
            this.addresses = result;
        });

        this.currentUser$.subscribe((res)=> {
            console.log(' this.currentUser$.subscribe', res);
            this.user = res;
        }, (error)=>{
            console.log(' this.currentUser$.subscribe', error);
        })
    }

    // Event for showing the profile image
    showImage() {
        this.imageShow = false;
        this.imageUpload = true;
        this.imageDone = true;
        this.imageEdit = false;
    }

// Event for switching to order view
    switchToOrder() {
        this.isDashboard = false;
        this.isOrder = true;
        this.isWishlist = false;
        this.isProfile = false;
        this.isMessage = false;
        this.isAddress = false;
    }

    // Event for switching to dashboard view
    switchToDashBoard() {
        this.isDashboard = true;
        this.isOrder = false;
        this.isWishlist = false;
        this.isProfile = false;
        this.isMessage = false;
        this.isAddress = false;
    }

    // Event for switching to wishlist view
    switchToWishlist() {
        this.isDashboard = false;
        this.isOrder = false;
        this.isWishlist = true;
        this.isProfile = false;
        this.isMessage = false;
        this.isAddress = false;
    }

    // Event for switching to profile settings view
    switchToProfileSettings() {
        this.isDashboard = false;
        this.isOrder = false;
        this.isWishlist = false;
        this.isProfile = true;
        this.isAddress = false;
        this.isMessage = false;

    }

    // Event for switching to address settings view
    switchToAddressSettings() {
        this.isDashboard = false;
        this.isOrder = false;
        this.isWishlist = false;
        this.isProfile = false;
        this.isAddress = true;
        this.isMessage = false;
    }

    // Event for switching to message view
    switchToMessages() {
        this.isDashboard = false;
        this.isOrder = false;
        this.isWishlist = false;
        this.isProfile = false;
        this.isAddress = false;
        this.isMessage = true;
    }

    // Event for increasing step
    setStep(index: number) {
        this.step = index;
    }

    //Event for removing image
    onRemoved(file: FileHolder) {
        this.ImageFile = null;
    }

    //Called before image upload
    onBeforeUpload = (metadata: UploadMetadata) => {
        this.ImageFile = metadata.file;
        return metadata;
    };

    //Event method for getting profile data
    getPageData() {
        this.userService
            .getById(this.user.id)
            .subscribe(result => {
                this.user = result;
                this.ImageFileEdit = [];
            });
    }

    //Event method for updating profile image
    updateImage() {
        const formData: FormData = new FormData();
        if (this.ImageFile) {
            formData.append('hasImage', 'true');
            formData.append('avatar', this.ImageFile, this.ImageFile.name);
        } else {
            formData.append('hasImage', 'false');
            this.imageShow = true;
            this.imageUpload = false;
            this.imageDone = false;
            this.imageEdit = true;
            return;
        }
        this.userService
            .update(this.authService.getCurrentUserId(), formData)
            .subscribe(result => {
                this._notify.success("Profile picture updated successfully.");
                this.getPageData();
            });
        this.imageShow = true;
        this.imageUpload = false;
        this.imageDone = false;
        this.imageEdit = true;
    }

    //Event method for logout
    logOut() {
        this.authService.logout();
        this.store.dispatch(new fromStore.LoadCurrentUserSuccess(null));
        this.store.dispatch(new fromStore.LoadCartSuccess(null));
        this.store.dispatch(new fromStore.LoadFavouriteProductSuccess([]));
        this._notify.success("Logout Successfull.");
        this.router.navigate(['/']);
    }
}
