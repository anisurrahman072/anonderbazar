import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {RouterModule, Routes} from "@angular/router";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {HomeComponent} from "./home-core/home.component";
import {BannerComponent} from "./components/banner/banner.component";
import {Promo1Component} from "./components/procedure/procedure.component";
import {ShowcaseCategoryComponent} from "./components/showcase-category/showcase-category.component";
import {SpecialLookComponent} from "./components/special-look/special-look.component";
import {FeedbackComponent} from "./components/section-feedback/section-feedback.component";
import {FlashDealsComponent} from "./components/section-flash-deals/section-flash-deals.component";
import {OfferComponent} from "./components/section-offers/section-offers.component";
import {RewardPointComponent} from "./components/section-rewardpoint/section-rewardpoint.component";
import {WholeSaleComponent} from "./components/section-wholesale/section-wholesale.component";
import {RecommendComponent} from "./components/section-recommend/section-recommend.component";
import {ServiceComponent} from "./components/section-services/section-services.component";
import {SectionBlogComponent} from "./components/section-blog/section-blog.component";
import {SubscribeSectionComponent} from "./components/subscribe-section/subscribe-section.component";
import {BradecrambComponent} from "./components/bradecramb/bradecramb.component";
import {ProductDescriptionComponent} from "./components/product-description/product-description.component";
import {TabsModule, TooltipModule} from "ngx-bootstrap";
import {NguCarouselModule} from "@ngu/carousel";
import {ProductItemMinComponent} from "./components/product-item-min/product-item-min.component";
import {TopProductComponent} from "./components/top-product/top-product.component";
import {NgAisModule} from "angular-instantsearch";
import {Ng5SliderModule} from "ng5-slider";
import {MaterialModule} from "../../core/material.module";
import {SharedModule} from "../shared/shared.module";
import {SimilarProductComponent} from "./components/similar-product/similar-product.component";
import {ProductPromoComponent} from "./components/product-promo/product-promo.component";
import {ProductSpecialComponent} from "./components/product-special/product-special.component";
import {SWIPER_CONFIG, SwiperConfigInterface} from "ngx-swiper-wrapper";
import {RightSideFilterSearchComponent} from "../category-nsearch/category-page/right-side-filter-search/right-side-filter-search.component";
import {NgxPaginationModule} from "ngx-pagination";
import {ModalModule} from 'ngx-bootstrap/modal';
import {IonRangeSliderModule} from "ng2-ion-range-slider";
import {RecentlyViewesComponent} from './components/recently-viewes/recently-viewes.component';
import {CarouselModule} from 'ngx-bootstrap/carousel';
import {BusinessOportunitiesComponent} from "./components/business-oportunity/business-oportunities.component";
import {NgxCarouselModule} from "ngx-carousel";


const routes: Routes = [
    {
        path: "",
        component: HomeComponent,
        data: {
            title: "Home"
        }
    },
  /*  {
        path: "cms",
        component: CmsPageComponent,
        data: {
            title: "OFFERS"
        }
    },
    {
        path: "cms/none",
        component: CmsPageComponent,
        data: {
            title: "CMS"
        }
    },
    {
        path: "cms-details/:id",
        component: CmsDetailsPageComponent,
        data: {
            title: "Cms Details"
        }
    },
*/
/*    {
        path: "product-details/:id",
        component: ProductDetailsComponent,
        data: {
            title: "Product Details"
        }
    },*/
/*    {
        path: "cart",
        component: ShoppingCartComponent,
        data: {
            title: "Cart"
        }
    },*/
/*    {
        path: "request",
        component: RequestPageComponent,
        data: {
            title: "Request"
        }
    },*/
/*    {
        path: "compare",
        component: ComparePageComponent,
        data: {
            title: "Compare"
        }
    }*/
    /*    {
            path: "products",
            component: CategoryPageComponent,
            data: {
                title: "Products"
            }
        },*/
/*    {
        path: "categories",
        component: CategoryListComponent,
        data: {
            title: "Categories"
        }
    },*/
    /*    {
            path: "products/:type/:id",
            component: CategoryPageComponent,
            data: {
                title: "Products"
            }
        },*/
    /*    {
            path: "checkout",
            component: CheckoutPageComponent,
            data: {
                title: "Checkout"
            }
        },*/
    /*    {
            path: "lottery",
            component: LotteryComponent,
            data: {
                title: "Lottery"
            }
        }*/
];

export const DEFAULT_SWIPER_CONFIG: SwiperConfigInterface = {
    direction: "horizontal",
    slidesPerView: "auto",
    breakpoints: {
        1024: {
            slidesPerView: 3,
            spaceBetween: 40
        },
        768: {
            slidesPerView: 3,
            spaceBetween: 30
        },
        640: {
            slidesPerView: 1,
            spaceBetween: 20
        },
        320: {
            slidesPerView: 1,
            spaceBetween: 10
        }
    }
};

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        FormsModule,
        ReactiveFormsModule,
        IonRangeSliderModule,
        SharedModule,
        NgxPaginationModule,
        TabsModule.forRoot(),
        TooltipModule.forRoot(),
        NguCarouselModule,
        CarouselModule.forRoot(),
        ModalModule.forRoot(),
        NgAisModule,
        MaterialModule,
        Ng5SliderModule,
        NgxCarouselModule
    ],
    declarations: [
        HomeComponent,
        ProductPromoComponent,
        Promo1Component,
        BannerComponent,
        ShowcaseCategoryComponent,
        FeedbackComponent,
        ProductSpecialComponent,
        TopProductComponent,
        SpecialLookComponent,
        FlashDealsComponent,
        OfferComponent,
        RewardPointComponent,
        WholeSaleComponent,
        RecommendComponent,
        ServiceComponent,
        BusinessOportunitiesComponent,
        SectionBlogComponent,
        SubscribeSectionComponent,
        BradecrambComponent,
        SimilarProductComponent,
        ProductDescriptionComponent,
        ProductItemMinComponent,
        RightSideFilterSearchComponent,
        RecentlyViewesComponent,
    ],
    exports: [
        ProductDescriptionComponent,
        SimilarProductComponent,
        RecentlyViewesComponent
    ],
    providers: [
        {
            provide: SWIPER_CONFIG,
            useValue: DEFAULT_SWIPER_CONFIG
        }
    ]
})
export class HomeModule {
}
