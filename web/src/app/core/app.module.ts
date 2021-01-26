import {BrowserModule, BrowserTransferStateModule} from '@angular/platform-browser';
import {ErrorHandler, NgModule} from '@angular/core';
import {StoreDevtoolsModule, StoreDevtoolsOptions} from '@ngrx/store-devtools';
import {AppComponent} from './app.component';
import {AppRoutingModule} from './app-routing.module';
import {SwiperModule} from "ngx-swiper-wrapper";
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {HttpClientModule} from '@angular/common/http';
import {HeaderComponent} from "../layout/header/header.component";
import {FooterComponent} from "../layout/footer/footer.component";
import {MenuComponent} from "../layout/menu/menu.component";
import {TabsModule} from 'ngx-bootstrap';
import {StoreModule} from '@ngrx/store';
import {EffectsModule} from '@ngrx/effects';
import {effects, reducers} from "../state-management";
import {JasperoAlertsModule} from "@jaspero/ng2-alerts";
import {NgProgressModule} from '@ngx-progressbar/core';
import {SimpleNotificationsModule} from 'angular2-notifications';
import {
    AreaService, AuthService, CartItemService, CartItemVariantService, CartService, CategoryProductService,
    CategoryTypeService, FavouriteProductService, OrderService, ProductService,
    ProductVariantService, SuborderItemService, SuborderService, VariantService, WarehouseService, CraftsmanService,
    UserService, WarehouseVariantService, SubrderItemVariantService, CmsService, BrandService
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
import {combineLatest} from 'rxjs/observable/combineLatest'

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
        MaterialModule,
        IonRangeSliderModule,
        AppRoutingModule,
        PrebootModule.withConfig({appRoot: "app-root"}),
        FormsModule,
        ReactiveFormsModule,
        HttpClientModule,
        TabsModule.forRoot(),
        JasperoAlertsModule,
        NgProgressModule.forRoot(),
        SimpleNotificationsModule.forRoot(),

        StoreModule.forRoot({}, {metaReducers}),
        EffectsModule.forRoot(effects),

        StoreModule.forFeature('home', reducers),
        EffectsModule.forFeature(effects),

        StoreDevtoolsModule.instrument(<StoreDevtoolsOptions>{maxAge: 25}),
        ToastrModule.forRoot({
            timeOut: 5000,
            positionClass: 'toast-top-right',
            preventDuplicates: true,
        }),
        NgAisModule.forRoot(),
        BrowserTransferStateModule,
        SharedModule,
        SwiperModule,
    ],
    providers: [{
        provide: ErrorHandler,
        useClass: GlobalErrorHandler
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
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}
