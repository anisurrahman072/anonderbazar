import {HttpClient} from "@angular/common/http";
import {Options, LabelType} from "ng5-slider";
import {ActivatedRoute} from '@angular/router';
import {
    Component,
    Injector,
    OnInit,
    Input,
} from "@angular/core";
import {
    ProductService,
    CategoryProductService,
    ProductVariantService,
    VariantService,
    WarehouseService,
    UserService, BrandService
} from "../../../../services";
import {Observable} from "rxjs/Observable";

import {forkJoin} from "rxjs/observable/forkJoin";
import * as _ from "lodash";
import {of} from "rxjs/observable/of";
import {Meta, Title, TransferState} from "@angular/platform-browser";
import {FilterUiService} from "../../../../services/ui/filterUi.service";
import {AppSettings} from "../../../../config/app.config";
import {LoaderService} from "../../../../services/ui/loader.service";
import {ToastrService} from "ngx-toastr";
import {combineLatest} from "rxjs/observable/combineLatest";
import {concatMap} from "rxjs/operator/concatMap";

@Component({
    selector: "app-category-page",
    templateUrl: "./category-page.component.html",
    styleUrls: ["./category-page.component.scss"]
})

export class CategoryPageComponent implements OnInit {
    @Input() showAtert: boolean;
    @Input() productname: any;
    @Input() productprice: any;
    p;
    allProducts: any;
    allProductsByCategory: any;

    IMAGE_ENDPOINT = AppSettings.IMAGE_ENDPOINT;
    search: any;
    priceFilter = false;

    minPrice: number = 0.0;
    maxPrice: number = 50000;
    allBrand = [];
    allCategory = [];
    allsubCategory = [];
    allSubSubCategory = [];

    craftsmen = [];
    allCraftsman: any[];
    min: number = 0;
    max: number = 9999999999;

    changeStatusP = false;
    changeStatusR = false;
    changeStatusN = false;
    changeStatusPr = false;
    clearAll = true;
    searchTerm = "";
    classList_ids = [];
    categoryList_ids = [];
    warehouses_ids = [];
    craftsmanList_ids = [];
    subCategory_ids = [];
    subsubCategory_ids = [];
    brand_ids = [];

    priceRange = [];

    currentBrandId: any;
    currentCategoryId: any;
    currentSubCategoryId: any;
    currentSubSubCategoryId: any;
    currentCategoryType: any;

    classList_filter_list = [];
    categoryList_filter_list = [];
    warehouses_filter_list = [];
    craftsmanList_filter_list = [];
    subCategory_filter_list = [];
    brand_filter_list = [];
    category: Observable<any>;
    //breadCumbs variables
    categoryB = null;
    subcategoryB = null;
    subsubcategoryB = null;

    options: Options = {
        floor: 1,
        // ceil: this.maxPrice,
        ceil: 50000,
        translate: (value: number, label: LabelType): string => {
            switch (label) {
                case LabelType.Low:
                    return "৳ " + value;
                case LabelType.High:
                    return "৳ " + value;
                default:
                    return "৳ " + value;
            }
        }
    };
    isCollapsed_brand: any;
    isCollapsed_class: any;
    isCollapsed_subclass: any;
    isCollapsed_subsubclass: any;
    isCollapsed_warehouses: any;
    showcraftsman: any;
    showWarehouse: any;
    sortTitle: string = '';
    sortTerm: String = '0';
    isLoading: boolean = false;

    constructor(
        private httpClient: HttpClient,
        private route: ActivatedRoute,
        private transferState: TransferState,
        private injector: Injector,
        private title: Title,
        private meta: Meta,
        private toastr: ToastrService,
        private productService: ProductService,
        private categoryProductService: CategoryProductService,
        private ProductVariantService: ProductVariantService,
        private VariantService: VariantService,
        private WarehouseService: WarehouseService,
        private UserService: UserService,
        private FilterUiService: FilterUiService,
        public loaderService: LoaderService,
        private brandService: BrandService,
    ) {
    }

    // init the component
    ngOnInit() {
        let queryParams = this.route.snapshot.queryParams;
        if (queryParams['min'] == 0) {
            this.minPrice = 1;
        } else if (queryParams['min'] > 0) {
            this.minPrice = queryParams['min'];
        }
        if (queryParams['max'] == 0) {
            this.maxPrice = 1;
        } else if (queryParams['max'] > 0) {
            this.maxPrice = queryParams['max'];
        }
        this.categoryB = null;
        this.subcategoryB = null;
        this.subsubcategoryB = null;

        this.loaderService.showLoader();
        forkJoin([
            this.brandService.getAll(),
            this.categoryProductService.getAllCategory(),
            this.productService.getMinPrice(),
            this.productService.getMaxPrice()
        ]).subscribe((results: any) => {

            console.log('Fork Join: ', results);
            if (!_.isNil(results[0])) {
                this.allBrand = results[0];
            }
            if (!_.isNil(results[1])) {
                this.allCategory = results[1];
            }
            if (!_.isNil(results[2]) && !_.isNil(results[2].min)) {
                this.minPrice = results[2].min;
                this.min = this.minPrice;
            }
            if (!_.isNil(results[3]) && !_.isNil(results[3].max)) {
                this.maxPrice = results[3].max;
                this.max = this.maxPrice;
            }
        });

        combineLatest(
            this.route.params,
            this.route.queryParams
        ).subscribe((res: any) => {
            console.log('category-page: ', res);
            this.isLoading = true;
            const params = res[0];
            const queryParams = res[1];
            this.handleParamInit(params);
            this.handleQueryParams(queryParams);
            this.FilterUiService.currentcategoryType
                .switchMap((type: any) => {
                    this.currentCategoryType = type;

                    const apis = [];
                    apis.push(this.allSubCategoryOb());
                    apis.push(this.categoryProductService.getById(this.currentCategoryId));
                    apis.push(this.allSubSubcategoryOb());
                    apis.push(this.categoryProductService.getById(this.currentSubCategoryId));
                    apis.push(this.categoryProductService.getById(this.currentSubSubCategoryId));

                    return forkJoin(apis);
                })
                .concatMap((results: any) => {
                    console.log('combine result for categories', results);
                    this.allSubSubCategory = results[0];
                    this.categoryB = results[1];
                    this.allSubSubCategory = results[2];
                    this.subcategoryB = results[3];
                    this.subsubcategoryB = results[4];
                    return this.filterSearchObservable();
                })
                .subscribe((result: any) => {
                    console.log('filterSearchObservable-result', result);
                    if (result && result.data) {
                        this.allProductsByCategory = result.data;
                    } else {
                        this.allProductsByCategory = [];
                    }
                    this.isLoading = false;
                    this.loaderService.hideLoader();

                }, (err) => {
                    console.log(err);
                    this.isLoading = false;
                    this.loaderService.hideLoader();

                    this.toastr.error('Sorry! There was a problem!', 'Sorry!');
                });
        }, (err) => {
            console.log(err);
            this.loaderService.hideLoader();
            this.toastr.error('Sorry! There was a problem!', 'Sorry!');
        });

    }

    isNotEmptyObject(val) {
        return (typeof val === 'object' && val !== null && Object.keys(val).length > 0);
    }

    //Method called for product filtering
    handleQueryParams(queryParams) {

        this.brand_ids = [];
        this.subCategory_ids = [];
        this.subsubCategory_ids = [];

        this.currentBrandId = '';
        this.currentSubCategoryId = '';
        this.currentSubSubCategoryId = '';

        let categoryChange = false, subCategoryChange = false, subSubCategoryChange = false;
        for (let key in queryParams) {
            if (!queryParams.hasOwnProperty(key)) {
                continue;
            }
            if (key === 'filter' && queryParams[key] === 'newArrival') {
                this.changeStatusN = true;
                this.sortTitle = 'created_at';
                this.sortTerm = '1';
            } else if (key === 'filter' && queryParams[key] === 'rating') {
                this.changeStatusR = true;
                this.sortTitle = 'rating';
                this.sortTerm = '1';
            } else if (key === 'brand') {
                this.currentBrandId = +queryParams[key];
                this.brand_ids.push('' + this.currentBrandId);
                this.isCollapsed_brand = true;
            } else if (key === 'category') {
                this.categoryList_ids = [];
                this.currentCategoryId = +queryParams[key];
                if (this.currentCategoryId) {
                    this.categoryList_ids.push('' + this.currentCategoryId);
                }
                categoryChange = true;


                /*this.getAllSubcategory();*/
                /*                this.categoryProductService.getById(queryParams[key]).subscribe(res => {
                                    this.categoryB = res;
                                });*/
                this.subcategoryB = [];
                this.subsubcategoryB = [];
            } else if (key === 'sub') {
                subCategoryChange = true;
                this.currentSubCategoryId = +queryParams[key];
                this.subCategory_ids.push('' + queryParams[key]);
                /*                this.getAllSubSubcategory();
                                this.categoryProductService.getById(queryParams[key]).subscribe(res => {
                                    this.subcategoryB = res;
                                });*/
                this.subsubcategoryB = [];
            } else if (key === 'subsub') {
                subSubCategoryChange = true;
                this.currentSubSubCategoryId = +queryParams[key];
                this.subsubCategory_ids.push('' + queryParams[key]);
                /*                this.categoryProductService.getById(queryParams[key]).subscribe(res => {
                                    this.subsubcategoryB = res;
                                });*/
            } else if (key === 'search') {
                this.searchTerm = queryParams[key];
            }
        }
    }

    filter_result(event: any, type: string, name: String) {

        this.clearAll = false;

        if (type == "removefilterPrice") {
            this.priceFilter = false;
            this.minPrice = this.min;
            this.maxPrice = this.max;
        }

        this.priceRange = [this.minPrice, this.maxPrice];

        if (type == "price") {
            this.priceFilter = true;
            this.priceRange = [this.minPrice, this.maxPrice];
        }

        if (type == "search") {
            this.searchTerm = event.target.value;
        }

        if (event.target.checked) {
            if (type == "category") {
                this.categoryList_ids.push(event.target.value);
                this.categoryList_filter_list.push(name);

                this.getAllSubcategory();

                // this.subCategory_ids = [];
                // this.subsubCategory_ids = [];
                // this.brand_ids = [];

                this.currentBrandId = '';
                this.currentSubCategoryId = '';
                this.currentSubSubCategoryId = '';
                this.isCollapsed_subclass = true;
            } else if (type == "sub_category") {
                this.subCategory_ids.push(event.target.value);
                this.subCategory_filter_list.push(name);
                this.getAllSubSubcategory();

                // this.subsubCategory_ids = [];
                // this.brand_ids = [];

                this.currentBrandId = '';
                this.currentSubSubCategoryId = '';
                this.isCollapsed_subsubclass = true;
            } else if (type == "sub_sub_category") {
                this.subsubCategory_ids.push(event.target.value);
            } else if (type == "brand") {
                this.brand_ids.push(event.target.value);
                this.brand_filter_list.push(name);
            } else if (type == "class") {
                this.classList_ids.push(event.target.value);
                this.classList_filter_list.push(name);
            } else if (type == "warehouses") {
                this.warehouses_filter_list.push(name);
                this.warehouses_ids.push(event.target.value);
                this.allCraftsman.forEach(craftsman => {
                    if (craftsman.warehouse_id)
                        if (craftsman.warehouse_id.id == event.target.value)
                            this.craftsmen.push(craftsman);
                });
            } else if (type == "craftsman") {
                this.craftsmanList_ids.push(event.target.value);
                this.craftsmanList_filter_list.push(name);
            }
        } else {
            if (type == "category") {

                this.categoryList_filter_list.splice(
                    this.categoryList_ids.indexOf(event.target.value),
                    1
                );

                this.categoryList_ids.splice(
                    this.categoryList_ids.indexOf(event.target.value),
                    1
                );

                this.getAllSubcategory();

                // this.subCategory_ids = [];
                // this.subsubCategory_ids = [];
                // this.brand_ids = [];

                this.allsubCategory = [];
                this.allSubSubCategory = [];
                this.allBrand = [];

                this.currentBrandId = '';
                this.currentSubCategoryId = '';
                this.currentSubSubCategoryId = '';

            } else if (type == "sub_category") {
                this.subCategory_filter_list.splice(
                    this.subCategory_ids.indexOf(event.target.value),
                    1
                );
                this.subCategory_ids.splice(
                    this.subCategory_ids.indexOf(event.target.value),
                    1
                );

                this.getAllSubSubcategory();

                this.allSubSubCategory = [];
                this.allBrand = [];

                // this.subsubCategory_ids = [];
                // this.brand_ids = [];

                this.currentBrandId = '';
                this.currentSubSubCategoryId = '';

            } else if (type == "sub_sub_category") {
                this.subsubCategory_ids.splice(
                    this.subsubCategory_ids.indexOf(event.target.value),
                    1
                );
            } else if (type == "brand") {
                this.brand_filter_list.splice(
                    this.brand_ids.indexOf(event.target.value),
                    1
                );
                this.brand_ids.splice(
                    this.brand_ids.indexOf(event.target.value),
                    1
                );
            } else if (type == "warehouses") {
                this.warehouses_filter_list.splice(
                    this.warehouses_ids.indexOf(event.target.value),
                    1
                );
                this.warehouses_ids.splice(
                    this.warehouses_ids.indexOf(event.target.value),
                    1
                );
                this.allCraftsman.forEach(craftsman => {
                    if (craftsman.warehouse_id)
                        if (craftsman.warehouse_id.id == event.target.value) {
                            this.craftsmen.splice(this.craftsmen.indexOf(craftsman), 1);
                            this.craftsmanList_filter_list.splice(
                                this.craftsmanList_ids.indexOf(event.target.value),
                                1
                            );
                            this.craftsmanList_ids.splice(
                                this.craftsmanList_ids.indexOf(event.target.value),
                                1
                            );
                        }
                });
            } else if (type == "class") {
                this.classList_filter_list.splice(
                    this.classList_ids.indexOf(event.target.value),
                    1
                );
                this.classList_ids.splice(
                    this.classList_ids.indexOf(event.target.value),
                    1
                );
            } else if (type == "craftsman") {
                this.craftsmanList_filter_list.splice(
                    this.craftsmanList_ids.indexOf(event.target.value),
                    1
                );
                this.craftsmanList_ids.splice(
                    this.craftsmanList_ids.indexOf(event.target.value),
                    1
                );
            }
        }
        if (type == "created_at") {
            this.sortTitle = 'created_at';
            this.sortTerm = name;
        }
        this.generateSearchFilterResult();
        //  return true;
    }


    //Event method for setting up filter data
    public clearAllFilter() {
        this.searchTerm = "";
        this.brand_ids = [];
        if (this.currentCategoryId) {
            this.categoryList_ids = [];
            this.categoryList_ids.push('' + this.currentCategoryId);
            this.currentBrandId = '';
            this.currentSubCategoryId = '';
            this.currentSubSubCategoryId = '';
        } else {
            this.categoryList_ids = [];
            this.categoryB = [];
        }
        this.classList_ids = [];
        this.warehouses_ids = [];
        this.craftsmanList_ids = [];
        this.subCategory_ids = [];
        this.subsubCategory_ids = [];
        this.priceFilter = false;
        this.subcategoryB = [];
        this.subsubcategoryB = [];

        this.getAllBrands();
        this.getAllCategories();
        this.getAllSubcategory();
        this.getAllSubSubcategory();
        this.getMinPriceOfProduct();
        this.getMaxPriceOfProduct();

        this.minPrice = this.min;
        this.maxPrice = this.max;
        this.priceRange = [this.minPrice, this.maxPrice];
        this.priceRange = [this.min, this.max];
        this.clearAll = true;

        this.generateSearchFilterResult();
    }

    private filterSearchObservable() {
        return this.productService
            .filter_result(
                this.searchTerm,
                this.classList_ids,
                this.categoryList_ids,
                this.warehouses_ids,
                this.craftsmanList_ids,
                this.subCategory_ids,
                this.brand_ids,
                this.subsubCategory_ids,
                this.priceRange,
                this.sortTitle,
                this.sortTerm,
                1,
                0
            );
    }

    /** Event method for setting up filter data */
    private generateSearchFilterResult() {
        this.loaderService.showLoader();
        this.filterSearchObservable()
            .subscribe(result => {
                console.log('generateSearchFilterResult-result', result);
                this.allProductsByCategory = result.data;
                this.loaderService.hideLoader();
            }, (err) => {
                console.log('generateSearchFilterResult', err);
                this.toastr.error('Sorry! There was a problem!', 'Sorry!');
                this.loaderService.hideLoader();
            });
    }

    private allSubCategoryOb() {
        return this.categoryProductService.getSubcategoryByCategoryIds(this.categoryList_ids)
            .concatMap((result: any) => {
                this.allsubCategory = result;

                this.subCategory_ids = this.subCategory_ids.filter((subCategoryId) => {
                    return this.allsubCategory.find((subCategory) => {
                        return subCategory.id == subCategoryId
                    })
                });

                return this.allSubSubcategoryOb();
            });
    }

    // Event method for getting all the subcategory data for the page
    private getAllSubcategory() {
        if (this.categoryList_ids.length > 0) {
            this.categoryProductService.getSubcategoryByCategoryIds(this.categoryList_ids)
                .concatMap((result: any) => {
                    this.allsubCategory = result;

                    this.subCategory_ids = this.subCategory_ids.filter((subCategoryId) => {
                        return this.allsubCategory.find((subCategory) => {
                            return subCategory.id == subCategoryId
                        })
                    });

                    return this.allSubSubcategoryOb();
                })
                .subscribe(result => {
                    this.allSubSubCategory = result;
                });
        } else {
            this.allsubCategory = [];
        }
    }

    private allSubSubcategoryOb() {
        if (this.subCategory_ids.length > 0) {
            return this.categoryProductService.getSubcategoryByCategoryIds(this.subCategory_ids);
        }
        return of([]);
    }

    //Event method for getting all sub sub category data
    private getAllSubSubcategory() {
        if (this.subCategory_ids.length != 0) {
            this.categoryProductService.getSubcategoryByCategoryIds(this.subCategory_ids).subscribe(result => {
                this.allSubSubCategory = result;
            });
        } else {
            this.allSubSubCategory = [];
        }
    }

    //Event method for getting all brands
    private getAllBrands() {
        this.brandService.getAll().subscribe(result => {
            this.allBrand = result;
        }, (err) => {
            console.log(err);
        });
    }

    //Event method for getting all category
    private getAllCategories() {
        this.categoryProductService.getAllCategory().subscribe(result => {
            this.allCategory = result;
        }, (err) => {
            console.log(err);
        });
    }

    //Event method for product min price
    private getMinPriceOfProduct() {
        this.productService.getMinPrice().subscribe(result => {
            this.minPrice = result.min;
            this.min = this.minPrice;
        }, (err) => {
            console.log(err);
        });
    }

    //Event method for product max price
    private getMaxPriceOfProduct() {
        this.productService.getMaxPrice().subscribe(result => {
            this.maxPrice = result.max;
            this.max = this.maxPrice;
        }, (err) => {
            console.log(err);
        });
    }

    //Event method for showing popular sort
    showPopular(event) {
        this.changeStatusP = true;
        this.changeStatusR = false;
        this.changeStatusN = false;
        this.changeStatusPr = false;
        this.sortTitle = 'last_order_completed_date';
        this.sortTerm = (this.sortTerm == '0') ? '1' : '0';
        this.generateSearchFilterResult();
    }

    //Event method for showing rating sort

    showRating(event) {
        this.changeStatusP = false;
        this.changeStatusR = true;
        this.changeStatusN = false;
        this.changeStatusPr = false;
        this.sortTitle = 'rating';
        this.sortTerm = (this.sortTerm == '0') ? '1' : '0';
        this.generateSearchFilterResult();
    }

    //Event method for showing newest sort

    showNewest(event) {
        this.changeStatusP = false;
        this.changeStatusR = false;
        this.changeStatusN = true;
        this.changeStatusPr = false;
        this.sortTitle = 'created_at';
        this.sortTerm = (this.sortTerm == '0') ? '1' : '0';
        this.generateSearchFilterResult();
    }

    //Event method for showing price sort

    showPrice(event) {
        this.changeStatusP = false;
        this.changeStatusR = false;
        this.changeStatusN = false;
        this.changeStatusPr = true;
        this.sortTitle = 'price';
        this.sortTerm = (this.sortTerm == '0') ? '1' : '0';
        this.generateSearchFilterResult();
    }


    //Event method for pagination change
    onPageChange(event) {
        window.scroll(0, 0);
        this.p = event
    }

    private handleParamInit(params) {
        console.log('params', params);

        this.route.snapshot.params = params;

        if (this.route.snapshot.params['id']) {
            this.currentCategoryId = +this.route.snapshot.params['id'];
        } else {
            this.currentCategoryId = null;
        }

        this.categoryList_ids = [];
        if (this.currentCategoryId) {
            this.categoryList_ids.push('' + this.currentCategoryId);
        }

        this.brand_ids = [];
        this.subCategory_ids = [];
        this.subsubCategory_ids = [];

        this.isCollapsed_brand = false;
        this.isCollapsed_class = false;
        this.isCollapsed_subclass = false;
        this.isCollapsed_subsubclass = false;
        this.isCollapsed_warehouses = false;

        this.showWarehouse = !(this.route.snapshot.params['id'] && this.route.snapshot.params['warehouse'] === 'warehouse');

        if (this.route.snapshot.params['id'] && this.route.snapshot.params['craftsman'] === 'craftsman') {
            this.showcraftsman = true;
        } else {
            this.showcraftsman = false;
            this.showWarehouse = false;
        }

        if (this.currentCategoryId && this.currentCategoryId > 0) {
            this.isCollapsed_class = true;
            this.isCollapsed_subclass = true;
            this.isCollapsed_subsubclass = true;
        }

        this.priceRange = [this.minPrice, this.maxPrice];

    }

    extractCategoryMainImage() {
        let imageUrl = null;
        if (this.isNotEmptyObject(this.subsubcategoryB) && this.subsubcategoryB.banner_image) {
            imageUrl = this.IMAGE_ENDPOINT + this.subsubcategoryB.banner_image;
        } else if (this.isNotEmptyObject(this.subcategoryB) && this.subcategoryB.banner_image) {
            imageUrl = this.IMAGE_ENDPOINT + this.subcategoryB.banner_image;
        } else if (this.isNotEmptyObject(this.categoryB) && this.categoryB.banner_image) {
            imageUrl = this.IMAGE_ENDPOINT + this.categoryB.banner_image;
        }
        return imageUrl;
    }
}

/*
        let dummyObservable = of([]);
if (categoryChange) {
    dummyObservable = forkJoin([this.allSubCategoryOb(), this.categoryProductService.getById(this.currentCategoryId)])
        .pipe(concatMap((results: any) => {
            this.allSubSubCategory = results[0];
            this.categoryB = results[1];
            return of([]);
        }));
}

if (subCategoryChange) {
    dummyObservable.switchMap(() => {
        return forkJoin([this.allSubSubcategoryOb(), this.categoryProductService.getById(this.currentSubCategoryId)])
            .concatMap((results: any) => {
                this.allSubSubCategory = results[0];
                this.subcategoryB = results[1];
                return of([]);
            });
    });
}

if (subSubCategoryChange) {
    dummyObservable.concatMap(() => {
        return this.categoryProductService.getById(this.currentSubSubCategoryId)
            .concatMap((res: any) => {
                this.subsubcategoryB = res;
                return of([]);
            });
    });
}

return dummyObservable;
 */
