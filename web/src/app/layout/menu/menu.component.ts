import {Component, Inject, OnInit} from "@angular/core";
import {NavigationStart, Router} from "@angular/router";
import {CategoryTypeService} from "../../services";
import {CategoryProductService} from "../../services";
import {DOCUMENT} from '@angular/common';
import {Store} from "@ngrx/store";
import * as fromStore from "../../state-management";
import {Observable} from "rxjs/Observable";
import {AppSettings} from "../../config/app.config";
import {FilterUiService} from "../../services/ui/filterUi.service";
import {BrandService} from "../../services";
import {ShoppingModalService} from '../../services/ui/shoppingModal.service';
import {LoginModalService} from '../../services/ui/loginModal.service';
import {GLOBAL_CONFIGS} from "../../../environments/global_config";
import * as _ from "lodash";

@Component({
    selector: "app-menu",
    templateUrl: "./menu.component.html",
    styleUrls: ["./menu.component.scss"]
})
export class MenuComponent implements OnInit {
    private currentUser$: Observable<any>;
    private categoryCache: any;
    IMAGE_ENDPOINT = AppSettings.IMAGE_ENDPOINT;
    IMAGE_EXT = GLOBAL_CONFIGS.otherImageExtension;
    private productTypeList: any;
    categoryList: any[];
    subCategoryList: any[];
    brandList: any[];
    selectedCategoryId: any;
    isDisplay: boolean;
    isMobileMenuOpen: boolean = false;

    subSubCategoryList: any[];
    mobileSubCategoryList: any[];
    selectedSubSubCategoryId = null;
    showSubSubCategoryList: boolean[];

    /*
    * constructor for MenuComponent
    */
    constructor(
        @Inject(DOCUMENT) document,
        private categoryTypeService: CategoryTypeService,
        private categoryProductService: CategoryProductService,
        private router: Router,
        private store: Store<fromStore.HomeState>,
        private filterUIService: FilterUiService,
        private brandService: BrandService,
        private shoppingModalService: ShoppingModalService,
        private loginModalService: LoginModalService,
    ) {
        this.isDisplay = false;
    }

    // init the component
    ngOnInit() {

        this.currentUser$ = this.store.select<any>(fromStore.getCurrentUser);

        this.categoryTypeService.getAll().subscribe(result => {
            console.log('productTypeList', result.map((item) => item.name));
            this.productTypeList = result;
        });

        this.categoryProductService
            .getCategoriesWithSubcategories()
            .subscribe(result => {
                console.log('getCategoriesWithSubcategories', result);
                this.categoryList = result;
                this.categoryCache = {};
                result.forEach((item) => {
                    this.categoryCache[item.id] = item.subCategories;
                })
            });

        this.router.events.subscribe(event => {
            if (event instanceof NavigationStart) {
                if (!event.url.includes('category')) {
                    this.selectedCategoryId = '';
                }
            }
        });
    }

    showHideMobileMenu() {
        this.isMobileMenuOpen = !this.isMobileMenuOpen;
    }

    //Event method for category hover from menu
    categoryHover(category: any) {
        this.subCategoryList = category.subCategories;
        const ids = this.subCategoryList.map((cat) => cat.id);
        this.categoryProductService.getSubcategoryByCategoryIdsV2(ids)
            .subscribe(arg => {
                this.categoryCache = _.merge(this.categoryCache, _.groupBy(arg, 'parent_id'));
                console.log('this.categoryCache', this.categoryCache);
            });

        for (const sub of this.subCategoryList) {
            this.categoryProductService.getSubcategoryByCategoryId(sub.id)
                .subscribe(arg => {
                    sub.subCategory = arg
                });
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
        this.isDisplay = false;
        this.isMobileMenuOpen = false;
        this.changeCurrentCategory(category.id, category.type_id, category.name);
        const ele = document.getElementById("responsive-menu") as HTMLInputElement;
        ele.checked = false;
    }


    mobileCategoryClickEvent(category: any) {
        if (category.id === this.selectedCategoryId) {
            this.mobileSubCategoryList = null;
            this.selectedCategoryId = null;
            this.subSubCategoryList = null;
        } else {
            this.showSubSubCategoryList = [];
            this.subSubCategoryList = null;
            this.selectedCategoryId = category.id;
            this.mobileSubCategoryList = category.subCategories;
            this.mobileSubCategoryList.forEach(subCat => {
                this.showSubSubCategoryList[subCat.id] = false;
            });
        }
    }

    subCategoryClickEvent(subCategory: any) {
        if (subCategory.id === this.selectedSubSubCategoryId) {
            this.subSubCategoryList = null;
            this.selectedSubSubCategoryId = null;
        } else {
            this.mobileSubCategoryList.forEach(subCat => {
                this.showSubSubCategoryList[subCat.id] = false;
            });
            this.showSubSubCategoryList[subCategory.id] = true;

            this.selectedSubSubCategoryId = subCategory.id;
            this.categoryProductService.getSubcategoryByCategoryId(subCategory.id)
                .subscribe(subSubCategory => {
                    this.subSubCategoryList = subSubCategory;
                    if (this.subSubCategoryList.length === 0) {
                        this.mobileSubCategoryList = null;
                        this.router.navigate(['/products', {type: 'category', id: this.selectedCategoryId}], {
                            queryParams: {
                                category: this.selectedCategoryId,
                                sub: subCategory.id
                            }
                        });
                    }
                }, error => {
                    console.log('Error while finding subSubCategory: ', error);
                });
        }
    }

    //Call if change in category
    changeCurrentCategory(id: number, type: String, name: String) {
        this.filterUIService.changeCurrentCategories(id);
        this.filterUIService.changeCategoryId(id);
        this.filterUIService.changeCategoryType(type);
        this.filterUIService.changeCategoryName(name);
        this.router.navigate(['/products', {type: 'category', id: id}], {
            queryParams: {
                category: id
            }
        });
    }

    //Event method for redirecting to subcategory page
    navigateBySubCategory(event, category, subCategory) {
        event.stopPropagation();
        this.selectedCategoryId = category.id;
        this.isDisplay = false
        this.router.navigate(['/products', {type: 'category', id: this.selectedCategoryId}], {
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
        this.router.navigate(['/products', {type: 'category', id: this.selectedCategoryId}], {
            queryParams: {
                category: category.id,
                sub: subCategory.id,
                subsub: subSubCategory.id
            }
        });
    }

    navigateFromMobile(event, subCategory, subSubCategory) {
        this.mobileSubCategoryList = null;
        this.router.navigate(['/products', {type: 'category', id: this.selectedCategoryId}], {
            queryParams: {
                category: this.selectedCategoryId,
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
        this.router.navigate(['/products', {type: 'category', id: this.selectedCategoryId}], {
            queryParams: {
                category: category.id,
                brand: brand.id
            }
        });
    }

    //Event method for showing login modal
    showLoginModal() {
        this.loginModalService.showLoginModal(true);
    }

    //Event method for showing shopping cart
    showShoppingCartModal() {
        this.shoppingModalService.showshoppingModal(true);
    }

    navigateToCms(event, categoryOfferId) {
        event.preventDefault();
        event.stopPropagation();
        this.isDisplay = false
        this.router.navigate(['/cms/cms-details', categoryOfferId]);
    }

}
