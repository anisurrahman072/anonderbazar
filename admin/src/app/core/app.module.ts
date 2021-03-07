import {CmsService} from '../services/cms.service';
import {
    BrowserModule,
    BrowserTransferStateModule
} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {AppComponent} from './app.component';
import {AppRoutingModule} from './app-routing.module';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import {AuthService} from '../services/auth.service';
import {ExportService} from '../services/export.service';
import {AuthGuard} from '../auth/core/guard/guard';
import {BaseRequestOptions} from '@angular/http';
import {GroupGuard} from '../auth/core/guard/group.guard';
import {CategoryTypeService} from '../services/category-type.service';
import {CategoryProductService} from '../services/category-product.service';
import {WarehouseService} from '../services/warehouse.service';
import {AreaService} from '../services/area.service';
import {VariantService} from '../services/variant.service';
import {BrandService} from '../services/brand.service';
import {ProductService} from '../services/product.service';
import {WarehouseVariantService} from '../services/warehouse-variant.service';
import {UserService} from '../services/user.service';
import {ProductVariantService} from '../services/product-variant.service';
import {CraftsmanService} from '../services/craftsman.service';
import {ValidationService} from '../services/validation.service';
import {IsAdmin} from '../auth/core/guard/isAdmin';
import {PrebootModule} from 'preboot';
import {OrderService} from '../services/order.service';
import {RequisitionService} from '../services/requisition.service';
import {SuborderService} from '../services/suborder.service';
import {PaymentService} from '../services/payment.service';
import {PaymentAddressService} from '../services/payment-address.service';
import {ShippingAddressService} from '../services/shipping-address.service';
import {SuborderItemService} from '../services/suborder-item.service';
import {CraftmanScheduleService} from '../services/craftman-schedule.service';
import {DesignCategoryService} from '../services/design-category.service';
import {DesignService} from '../services/design.service';
import {EventService} from '../services/event.service';
import {StatusChangeService} from '../services/statuschange.service';
import {EventPriceService} from '../services/event-price.service';
import {EventRegistrationService} from '../services/event-registration.service';
import {GenreService} from '../services/genre.service';
import {ProductDesignService} from '../services/product-design.service';
import {PartService} from '../services/part.service';
import {TokenInterceptor} from '../auth/core/interceptor/token.interceptor';
import {CraftmanPriceService} from '../services/craftman-price.service';
import {AlreadyLoggedIn} from '../auth/core/guard/AlreadyLoggedIn';
import {UIService} from '../services/ui/ui.service';
import {UiModule} from '../dashboard/shared/ui.module';
import {AccessControl} from '../auth/core/guard/AccessControl.guard';
import {AccessControlPipe} from '../pipes/accessControl.pipe';
import {TransferHttpCacheModule} from '@nguniversal/common';
import {DesignImagesService} from '../services/design-images.service';
import {CourierService} from '../services/courier.service';
import {CourierPriceService} from '../services/courier-price.service';
import {ChatService} from '../services/chat.service';
import {ExcelService} from "../services/excel.service";
import { NgZorroAntdModule, NZ_I18N, en_US } from 'ng-zorro-antd';
import { registerLocaleData } from '@angular/common';
import en from '@angular/common/locales/en';
registerLocaleData(en);

@NgModule({
    declarations: [AppComponent],
    imports: [
        HttpClientModule,
        BrowserModule.withServerTransition({appId: 'my-app'}),
        BrowserAnimationsModule,
        TransferHttpCacheModule,
        AppRoutingModule,
        PrebootModule.withConfig({appRoot: 'app-root'}),
        BrowserTransferStateModule,
        NgZorroAntdModule,
        UiModule,
    ],
    providers: [
        { provide: NZ_I18N, useValue: en_US },
        ValidationService,
        AuthService,
        IsAdmin,
        AuthGuard,
        GroupGuard,
        AlreadyLoggedIn,
        AccessControl,
        BaseRequestOptions,
        CategoryProductService,
        CategoryTypeService,
        ExportService,
        WarehouseService,
        AreaService,
        StatusChangeService,
        BrandService,
        CourierService,
        CourierPriceService,
        OrderService,
        RequisitionService,
        SuborderService,
        VariantService,
        ProductVariantService,
        WarehouseVariantService,
        ProductService,
        UserService,
        CraftsmanService,
        PaymentService,
        PaymentAddressService,
        ShippingAddressService,
        SuborderItemService,
        CraftmanScheduleService,
        DesignCategoryService,
        DesignService,
        GenreService,
        PartService,
        EventPriceService,
        EventService,
        EventRegistrationService,
        ProductDesignService,
        CraftmanPriceService,
        UIService,
        CmsService,
        DesignImagesService,
        AccessControlPipe,
        ExcelService,
        ChatService,
        {
            provide: HTTP_INTERCEPTORS,
            useClass: TokenInterceptor,
            multi: true
        }
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}
