import {Component, HostListener, Inject, Input, OnInit} from "@angular/core";
import { NavigationStart, Router} from "@angular/router";
import {AuthService} from "../../services/auth.service";
import {CategoryTypeService} from "../../services/category-type.service";
import {CategoryProductService} from "../../services/category-product.service";
import { DOCUMENT } from '@angular/common';
import {Store} from "@ngrx/store";
import * as fromStore from "../../state-management";
import {Observable} from "rxjs/Observable";
import {AppSettings} from "../../config/app.config";
import {FilterUiService} from "../../services/ui/filterUi.service";
import {BrandService} from "../../services";
import {FavouriteProduct} from '../../models';
import {ShoppingModalService} from '../../services/ui/shoppingModal.service';

@Component({
    selector: "app-menu",
    templateUrl: "./menu.component.html",
    styleUrls: ["./menu.component.scss"]
})
export class MenuComponent implements OnInit {
    currentUser$: Observable<any>;
    IMAGE_ENDPOINT = AppSettings.IMAGE_ENDPOINT;
    productTypeList: any;
    isCategoryShow = false;
    categoryList: any[];
    subCategoryList: any[];
    brandList: any[];
    isClicked: Boolean = false;
    selectedCategoryId: any;
    class_list: any;
    @Input()
    isCollapsed: boolean;
    isDisplay: boolean;

    cart$: Observable<any>;
    favourites$: Observable<FavouriteProduct>;
    compare$: Observable<any>;

    /*
    * constructor for MenuComponent
    */
    constructor(
        @Inject(DOCUMENT) document,
        private authService: AuthService,
        private categoryTypeService: CategoryTypeService,
        private categoryProductService: CategoryProductService,
        private router: Router,
        private store: Store<fromStore.HomeState>,
        private filterUIService: FilterUiService,
        private brandService: BrandService,
        private shoppingModalService: ShoppingModalService,
    ) {
        this.isDisplay = false;
    }

    // init the component
    ngOnInit() {

        this.currentUser$ = this.store.select<any>(fromStore.getCurrentUser);

        this.categoryTypeService.getAll().subscribe(result => {
            this.productTypeList = result;
        });


        this.cart$ = this.store.select<any>(fromStore.getCart);
        this.favourites$ = this.store.select<any>(fromStore.getFavouriteProduct);
        this.compare$ = this.store.select<any>(fromStore.getCompare);
        this.categoryProductService
            .getCategoriesWithSubcategories()
            .subscribe(result => {
                this.categoryList = result;
            });

        this.router.events.subscribe(event => {
            if (event instanceof NavigationStart) {
                if (!event.url.includes('category')) {
                    this.selectedCategoryId = '';
                }
            }
        });
    }

    //Event method for category hover from menu
    categoryHover(category: any) {
        this.subCategoryList = category.subCategories;
        for (const sub of this.subCategoryList) {
            this.categoryProductService.getSubcategoryByCategoryId(sub.id)
                .subscribe(arg => sub.subCategory = arg);
        }
        this.brandList = []
        this.brandService.shopByBrand(category.id).subscribe(res => {
            this.brandList = res['data'];
        })
    }

    //Event method for category click from menu
    categoryClickEvent(category: any) {
        this.selectedCategoryId = category.id;
        this.subCategoryList = category.subCategories;
        this.isDisplay = false
        this.changeCurrentCategory(category.id, category.type_id, category.name);
    }

    //Call if change in category
    changeCurrentCategory(id: number, type: String, name: String) {
        this.filterUIService.changeCurrentCategories(id);
        this.filterUIService.changeCategoryId(id);
        this.filterUIService.changeCategoryType(type);
        this.filterUIService.changeCategoryName(name);
        this.router.navigate(['/products/category/', id]);
    }

    //Event method for redirecting to subcategory page
    navigateBySubCategory(event, category, subCategory) {
        event.stopPropagation();
        this.selectedCategoryId = category.id;
        this.isDisplay = false
        this.router.navigate(['/products/category/', this.selectedCategoryId], {
            queryParams: {
                category: category.id,
                sub: subCategory.id
            }
        });
    }

    //Event method for redirecting to subsubcategory page
    navigateBySubSubCategory(event, category, subCategory, subSubCategory) {
        event.stopPropagation();
        this.selectedCategoryId = category.id;
        this.isDisplay = false
        this.router.navigate(['/products/category/', this.selectedCategoryId], {
            queryParams: {
                category: category.id,
                sub: subCategory.id,
                subsub: subSubCategory.id
            }
        });
    }

    //Event method for redirecting to brand page
    navigateByBrand(event, category, brand) {
        event.stopPropagation();
        this.selectedCategoryId = category.id;
        this.isDisplay = false
        this.router.navigate(['/products/category/', this.selectedCategoryId], {
            queryParams: {
                category: category.id,
                brand: brand.id
            }
        });
    }

    //Event method for showing shopping cart
    showShoppingCartModal() {
        this.shoppingModalService.showshoppingModal(true);
    }

    navigateToCms(event, categoryOfferId) {
        event.preventDefault();
        event.stopPropagation();
        this.isDisplay = false
        this.router.navigate(['/cms-details', categoryOfferId]);
    }

    @HostListener('window:scroll', ['$event'])
    onWindowScroll(e) {
        if (window.pageYOffset > 100) {
            let element = document.getElementById('anonder-bazar-sticky-menu');
            element.classList.add('menu-sticky-fixed');
        } else {
            let element = document.getElementById('anonder-bazar-sticky-menu');
            element.classList.remove('menu-sticky-fixed');
        }
    }
}
