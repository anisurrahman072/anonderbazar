import {BrowserModule, BrowserTransferStateModule} from '@angular/platform-browser';
import {ErrorHandler, NgModule} from '@angular/core';
import {AppComponent} from './app.component';
import {AppRoutingModule} from './app-routing.module';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import {HeaderComponent} from "../layout/header/header.component";
import {FooterComponent} from "../layout/footer/footer.component";
import {MenuComponent} from "../layout/menu/menu.component";
import {TabsModule} from 'ngx-bootstrap';
import {StoreModule} from '@ngrx/store';
import {EffectsModule} from '@ngrx/effects';
import {effects, reducers} from "../state-management";
import {NgProgressModule} from '@ngx-progressbar/core';
import {SimpleNotificationsModule} from 'angular2-notifications';
import {ServiceWorkerModule} from '@angular/service-worker';
import {
    AreaService, AuthService, CartItemService, CartItemVariantService, CartService, CategoryProductService,
    CategoryTypeService, FavouriteProductService, OrderService, ProductService,
    ProductVariantService, SuborderItemService, SuborderService, VariantService, WarehouseService, CraftsmanService,
    UserService, WarehouseVariantService, SubrderItemVariantService, CmsService, BrandService, LotteryService
} from "../services";
import {NgAisModule} from 'angular-instantsearch';
import {MaterialModule} from "./material.module";
import {PrebootModule} from "preboot";
import {metaReducers} from "../state-management/reducers/sync.reducer";
import {GlobalErrorHandler} from "./app._errorHandler";
import {NgrxUniversalComponent} from "./components/ngrxUniversal/ngrxUniversal.component";
import {LoginModalService} from "../services/ui/loginModal.service";
import {ShoppingModalService} from "../services/ui/shoppingModal.service";
import {SharedModule} from "../modules/shared/shared.module";
import {UIService} from "../services/ui/ui.service";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {PaymentService} from "../services/payment.service";
import {PaymentAddressService} from "../services/payment-address.service";
import {ShippingAddressService} from "../services/shipping-address.service";
import {CompareService} from "../services/compare.service";
import {IsLoggedIn} from "./isLoggedIn";
import {FilterUiService} from '../services/ui/filterUi.service';
import {PartService} from '../services/part.service';
import {ChatService} from '../services/chat.service';
import {DesignimageService} from '../services/designimage.service';
import {ToastrModule} from 'ngx-toastr';
import {IonRangeSliderModule} from "ng2-ion-range-slider";
import {LoaderService} from "../services/ui/loader.service";
import {FormValidatorService} from "../services/validator/form-validator.service";
import {environment} from "../../environments/environment";
import {JwtTokenInterceptor} from "../http-interceptors/Jwt-Token-Interceptor";
import {JwtHelper} from "angular2-jwt";
import {LocalStorageService} from "../services/local-storage.service";
import {BkashService} from "../services/bkash.service";


let imports = [];
if (environment.production) {
    imports = [
        ServiceWorkerModule.register('ngsw-worker.js', {enabled: environment.production}),
        /*BrowserPrebootModule.replayEvents(),*/
        /*ServerPrebootModule.recordEvents({ appRoot: 'app-root' }),*/
    ];
} else {
    imports = [];
}

@NgModule({
    declarations: [
        AppComponent,
        HeaderComponent,
        FooterComponent,
        MenuComponent,
        NgrxUniversalComponent,
    ],
    imports: [
        BrowserModule.withServerTransition({appId: 'my-app'}),
        BrowserAnimationsModule,
        PrebootModule.withConfig({appRoot: "app-root"}),
        ...imports,
        HttpClientModule,
        MaterialModule,
        IonRangeSliderModule,
        AppRoutingModule,
        FormsModule,
        ReactiveFormsModule,
        TabsModule.forRoot(),
        ToastrModule.forRoot({
            timeOut: 2000,
            positionClass: 'toast-top-right',
            preventDuplicates: true,
        }),
        NgProgressModule.forRoot(),
        SimpleNotificationsModule.forRoot(),
        StoreModule.forRoot({}, {metaReducers}),
        EffectsModule.forRoot(effects),
        StoreModule.forFeature('home', reducers),
        EffectsModule.forFeature(effects),
        NgAisModule.forRoot(),
        BrowserTransferStateModule,
        SharedModule
    ],
    providers: [
        {
            provide: ErrorHandler,
            useClass: GlobalErrorHandler
        },
        {
            provide: HTTP_INTERCEPTORS,
            useClass: JwtTokenInterceptor,
            multi: true
        },
        IsLoggedIn,
        UIService,
        LoginModalService,
        ShoppingModalService,
        UserService,
        ProductService,
        ProductVariantService,
        VariantService,
        CraftsmanService,
        WarehouseService,
        CartService,
        FavouriteProductService,
        CartItemService,
        PartService,
        CategoryProductService,
        DesignimageService,
        WarehouseVariantService,
        CartItemVariantService,
        AreaService,
        AuthService,
        JwtHelper,
        OrderService,
        SuborderService,
        SuborderItemService,
        SubrderItemVariantService,
        PaymentService,
        PaymentAddressService,
        ShippingAddressService,
        CompareService,
        CategoryTypeService,
        FilterUiService,
        CmsService,
        ChatService,
        LoaderService,
        BrandService,
        FormValidatorService,
        LocalStorageService,
        BkashService,
        LotteryService
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}
