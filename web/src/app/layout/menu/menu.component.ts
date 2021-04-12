import {Component, Inject, OnInit} from "@angular/core";
import {NavigationStart, Router} from "@angular/router";
import {CategoryProductService} from "../../services";
import {DOCUMENT} from '@angular/common';
import {Store} from "@ngrx/store";
import * as fromStore from "../../state-management";
import {AppSettings} from "../../config/app.config";
import {FilterUiService} from "../../services/ui/filterUi.service";
import {BrandService} from "../../services";
import {ShoppingModalService} from '../../services/ui/shoppingModal.service';
import {GLOBAL_CONFIGS} from "../../../environments/global_config";
import * as ___ from 'lodash';
import {forkJoin} from "rxjs/observable/forkJoin";

@Component({
    selector: "app-menu",
    templateUrl: "./menu.component.html",
    styleUrls: ["./menu.component.scss"]
})
export class MenuComponent implements OnInit {

    IMAGE_ENDPOINT = AppSettings.IMAGE_ENDPOINT;
    IMAGE_EXT = GLOBAL_CONFIGS.otherImageExtension;

    categoryList: any[];
    subCategoryList: any[];
    brandList: any[];
    brandListIndex: any;
    selectedCategoryId: any;
    isDisplay: boolean;
    isMobileMenuOpen: boolean = false;

    subSubCategoryList: any[];
    mobileSubCategoryList: any[];
    selectedSubSubCategoryId = null;
    showSubSubCategoryList: boolean[];

    private subCategoryIndexes: any;

    /**
     * constructor for MenuComponent
     */
    constructor(
        @Inject(DOCUMENT) document,
        private categoryProductService: CategoryProductService,
        private router: Router,
        private store: Store<fromStore.HomeState>,
        private filterUIService: FilterUiService,
        private brandService: BrandService,
        private shoppingModalService: ShoppingModalService
    ) {
        this.isDisplay = false;
    }

    // init the component
    ngOnInit() {

        this.categoryProductService
            .getAllCategories()
            .concatMap((result: any) => {
                this.categoryList = result;
                return forkJoin([this.categoryProductService.getCategoriesWithSubcategoriesV2(), this.brandService.brandsByCategories()])
            })
            .subscribe((result: any) => {

                if (!___.isUndefined(result[0])) {
                    console.log('getCategoriesWithSubcategoriesV2', result[0]);
                    this.subCategoryIndexes = result[0];
                    for (const category of this.categoryList) {
                        this.populateSubCategories(category);
                    }
                }
                if (!___.isUndefined(result[1]) && !___.isUndefined(result[1].data)) {
                    console.log('brandListIndex', result[1].data);
                    this.brandListIndex = result[1].data;
                }
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

        this.subCategoryList = [];
        if (!___.isUndefined(category.subCategory)) {
            this.subCategoryList = category.subCategory;
        }

        this.brandList = [];
        if (!___.isUndefined(this.brandListIndex[category.id]) && !___.isUndefined(this.brandListIndex[category.id].brand_ids)) {
            this.brandList = this.brandListIndex[category.id].brand_ids;
        }
        console.log('this.brandList', category.id, this.brandList);

    }

    //Event method for category click from menu
    categoryClickEvent(category: any) {
        this.selectedCategoryId = category.id;
        // this.populateSubCategories(category);
        this.subCategoryList = category.subCategory;
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

            let subCategoryList = [];
            if (!___.isEmpty(this.subCategoryIndexes[category.id])) {
                subCategoryList = this.subCategoryIndexes[category.id];
                for (const subCategory of subCategoryList) {
                    subCategory.subCategory = [];
                    if (!___.isEmpty(this.subCategoryIndexes[subCategory.id])) {
                        subCategory.subCategory = this.subCategoryIndexes[subCategory.id];
                    }
                }
            }

            this.showSubSubCategoryList = [];
            this.subSubCategoryList = null;
            this.selectedCategoryId = category.id;
            this.mobileSubCategoryList = subCategoryList;
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
            this.subSubCategoryList = this.subCategoryIndexes[this.selectedSubSubCategoryId];
            if (!this.subSubCategoryList) {
                this.mobileSubCategoryList = null;
                this.router.navigate(['/products', {type: 'category', id: this.selectedCategoryId}], {
                    queryParams: {
                        category: this.selectedCategoryId,
                        sub: subCategory.id
                    }
                });
            }
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

    showHideMobileMenu() {
        this.isMobileMenuOpen = !this.isMobileMenuOpen;
    }

    private populateSubCategories(category: any) {

        if (!___.isEmpty(this.subCategoryIndexes[category.id])) {
            category.subCategory = this.subCategoryIndexes[category.id];
            for (const subCategory of category.subCategory) {
                subCategory.subCategory = [];
                if (!___.isEmpty(this.subCategoryIndexes[subCategory.id])) {
                    subCategory.subCategory = this.subCategoryIndexes[subCategory.id];
                }
            }
        }

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
