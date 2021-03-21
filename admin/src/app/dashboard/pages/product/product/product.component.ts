import {ActivatedRoute} from '@angular/router';
import {Component, OnDestroy, OnInit} from '@angular/core';
import {ProductService} from '../../../../services/product.service';
import {ProductVariantService} from '../../../../services/product-variant.service';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {VariantService} from '../../../../services/variant.service';
import {WarehouseVariantService} from '../../../../services/warehouse-variant.service';
import {Router} from '@angular/router';
import {AuthService} from '../../../../services/auth.service';
import {CategoryProductService} from '../../../../services/category-product.service';
import {BrandService} from '../../../../services/brand.service';
import {UIService} from '../../../../services/ui/ui.service';
import {Subject, Subscription} from 'rxjs';
import {DesignImagesService} from '../../../../services/design-images.service';
import {environment} from "../../../../../environments/environment";
import {NzNotificationService} from "ng-zorro-antd";
import {debounceTime, distinctUntilChanged} from "rxjs/operators";

type SearchSubject = { field: string, query: string };

@Component({
    selector: 'app-product',
    templateUrl: './product.component.html',
    styleUrls: ['./product.component.css']
})
export class ProductComponent implements OnInit, OnDestroy {
    private currentWarehouseSubscriprtion: Subscription;
    private allProductSub: Subscription;
    private searchChangeSubs: Subscription;
    private categoryProductSubs1: Subscription;
    private categoryProductSubs2: Subscription;
    private brandSubs: Subscription;
    private variantSubs: Subscription;
    private deleteSubs: Subscription;
    private addPropSubs: Subscription;
    private categoryChangeSubs: Subscription;
    private getProdVariantSubs: Subscription;
    status: any = 1;
    type: any;

    showList: boolean = true;
    showAddPart: boolean = false;
    isBulkUploadModalVisible = false;
    isVariantVisible = false;
    isPromotionVisible = false;
    currentProduct: any = {};
    IMAGE_ENDPOINT = environment.IMAGE_LIST_ENDPOINT;
    IMAGE_THUMB_ENDPOINT = environment.IMAGE_THUMB_ENDPOINT;
    IMG_EXT = environment.productImageExtension;

    data = [];
    _isSpinning = true;
    currentProduct_variants: any = [];

    validateForm: FormGroup;
    validatePromotionForm: FormGroup;
    variantOptions: any;
    warehouseVariantOptions: any;
    selectedVariant_id: any;

    selectedWarehousesVariantOption: any = [];
    addNew: boolean;
    currentUser: any;
    currentProductForAddPart: any;
    limit: number = 10;
    page: number = 1;
    total: number = 0;

    private searchChangeSub: Subject<SearchSubject> = new Subject<SearchSubject>();
    codeSearchValue: string = '';
    nameSearchValue: string = '';
    priceSearchValue: string = '';
    qtySearchValue: string = '';

    typeId: any = null;
    brandId: any = null;
    categoryId: any = null;
    subcategoryId: any = null;

    approvalStatus: any = null;

    sortKey: string = '';
    sortValue: string = '';

    sortName: any;
    TypeSearchOptions: any[] = [];
    categorySearchOptions: any;
    brandSearchOptions: any;
    subcategorySearchOptions: any;
    private currentWarehouseId: string = '';

    constructor(
        private fb: FormBuilder,
        private router: Router,
        private route: ActivatedRoute,
        private uiService: UIService,
        private _notification: NzNotificationService,
        private productService: ProductService,
        private variantService: VariantService,
        private authService: AuthService,
        private designImagesService: DesignImagesService,
        private categoryProductService: CategoryProductService,
        private brandService: BrandService,
        private warehouseVariantService: WarehouseVariantService,
        private productVariantService: ProductVariantService
    ) {

    }

    onSearchChange(query: string, field: string) {
        this.searchChangeSub.next({
            field,
            query
        });
    }

    // Method called in brand option change
    getProductData(event?: any, type?: string) {
        if (event && type) {
            console.log('getProductData', event, type);
            if (type === 'page') {
                this.page = event;
            } else if (type === 'size') {
                this.page = 1;
                this.limit = event;
            }
        }

        this.allProductSub = this.productService
            .getAllProductsByStatus(
                this.status,
                this.page,
                this.limit,
                this.qtySearchValue,
                this.codeSearchValue,
                this.nameSearchValue,
                this.approvalStatus || '',
                this.priceSearchValue,
                this.brandId || '',
                this.typeId || '',
                this.categoryId || '',
                this.subcategoryId || '',
                this.currentWarehouseId,
                this.sortKey,
                this.filterTerm(this.sortValue)
            )
            .subscribe(
                result => {
                    this.data = result.data;
                    console.log('getProductData', result);
                    this.total = result.total;
                    this._isSpinning = false;
                },
                result => {
                    this._isSpinning = false;
                }
            );
    }

    ngOnDestroy(): void {
        this.currentWarehouseSubscriprtion
            ? this.currentWarehouseSubscriprtion.unsubscribe()
            : '';
        this.searchChangeSubs
            ? this.searchChangeSubs.unsubscribe()
            : '';
        this.allProductSub
            ? this.allProductSub.unsubscribe()
            : '';
        this.categoryProductSubs1
            ? this.categoryProductSubs1.unsubscribe()
            : '';
        this.categoryProductSubs2
            ? this.categoryProductSubs2.unsubscribe()
            : '';
        this.brandSubs
            ? this.brandSubs.unsubscribe()
            : '';
        this.variantSubs
            ? this.variantSubs.unsubscribe()
            : '';
        this.deleteSubs
            ? this.deleteSubs.unsubscribe()
            : '';
        this.categoryChangeSubs
            ? this.categoryChangeSubs.unsubscribe()
            : '';
        this.categoryChangeSubs
            ? this.categoryChangeSubs.unsubscribe()
            : '';
        this.getProdVariantSubs
            ? this.getProdVariantSubs.unsubscribe()
            : '';

    }

    // For initiating the section element with data
    ngOnInit(): void {
        this.router.routeReuseStrategy.shouldReuseRoute = () => false;

        this.validateForm = this.fb.group({
            name: ['', [Validators.required]],
            quantity: ['', []],
            variant_id: ['', [Validators.required]],
            warehouses_variant_id: ['', [Validators.required]]
        });

        this.validatePromotionForm = this.fb.group({
            promotion: ['', [Validators.required]],
            promo_price: ['', [Validators.required]],
            start_date: ['', [Validators.required]],
            end_date: ['', [Validators.required]],
            sale_unit: ['', [Validators.required]]
        });
        this.route.queryParams.filter(params => params.status).subscribe(params => {
            this.status = params.status;
        });

        this.currentUser = this.authService.getCurrentUser();
        this.currentWarehouseSubscriprtion = this.uiService.currentSelectedWarehouseInfo.subscribe(
            warehouseId => {
                this.currentWarehouseId = warehouseId || '';
                console.log('currentSelectedWarehouseInfo', warehouseId);
                this.page = 1;
                this.getProductData();
            }
        );

        this.categoryProductSubs1 = this.categoryProductService.getAllCategory().subscribe((result: any) => {
            this.TypeSearchOptions = result;
        });

        this.brandSubs = this.brandService.getAll().subscribe((result: any) => {
            this.brandSearchOptions = result;
        });

        this.categoryProductSubs2 = this.categoryProductService.getAll().subscribe((result: any) => {
            this.categorySearchOptions = result;
        });

        this.searchChangeSubs = this.searchChangeSub
            .pipe(debounceTime(200), distinctUntilChanged((prev: SearchSubject, next: SearchSubject) => {
                return JSON.stringify(prev) === JSON.stringify(next);
            }))
            .subscribe((model: SearchSubject) => {
                console.log('model', model);
                this[model.field] = model.query;
                this.page = 1;
                this.getProductData();
            });

    }

    // Method for close modals
    receiveCloseEvent($event) {
        if ($event) {
            this.showList = true;
            this.showAddPart = false;
            this.currentProductForAddPart = null;
        }
    }

    // Method for setting validation
    setRequired() {
        if (this.selectedVariant_id && this.selectedVariant_id.type === 1) {
            return [Validators.required];
        } else {
            return [];
        }
    }

    // Event method for setting up filter data
    sort(sort: { key: string, value: string }) {
        this.page = 1;
        this.sortKey = sort.key;
        this.sortValue = sort.value;
        this.getProductData();
    }

    // Method for form reset
    formReset() {
        this.validateForm.reset();
        for (const key in this.validateForm.controls) {
            this.validateForm.controls[key].markAsPristine();
        }
    }

    // Method for promotion form reset
    promotionFormReset() {
        this.validatePromotionForm.reset();
        for (const key in this.validatePromotionForm.controls) {
            this.validatePromotionForm.controls[key].markAsPristine();
        }
    }

    // Method for submitting variant form
    submitFormAddVariantForm($event, value) {
        $event.preventDefault();
        for (const i in this.validateForm.controls) {
            this.validateForm.controls[i].markAsDirty();
        }

        const formData: FormData = new FormData();

        formData.append('variant_id', value.variant_id.id);
        formData.append('variant_type', value.variant_id.type);
        formData.append('name', value.name);
        formData.append('warehouses_variant_id', value.warehouses_variant_id);
        formData.append('quantity', value.quantity);
        formData.append('product_id', this.currentProduct.id);

        const formValue = {
            variant_id: value.variant_id.id,
            variant_type: value.variant_id.type,
            name: value.name,
            warehouses_variant_id: value.warehouses_variant_id,
            quantity: value.quantity,
            product_id: this.currentProduct.id
        };

        this.variantSubs = this.productVariantService.insert(formValue).subscribe(result => {
            if (result) {
                this._notification.create(
                    'success',
                    'Attribute variant has been successfully added.',
                    result.name
                );
                this.formReset();
                this.getProductVariants(this.currentProduct);
            }
        });
    }

    // Event method for deleting product
    deleteConfirm(index, id) {
        this.deleteSubs = this.productService.delete(id).subscribe(result => {

            this.getProductData();
            this._notification.create(
                'Successfully Message',
                'Product has been remove successfully',
                ''
            );
        });
    }

    // Event method for deleting product
    approveConfirm(index, id) {

        this.productService.approveByAdmin(id).subscribe(result => {

            this.getProductData();
            this._notification.create(
                'Successfully Message',
                'Product has been approved successfully',
                ''
            );
        });
    }

    rejectConfirm(index, id) {
        console.log('rejectConfirm', id)
        this.productService.rejectByAdmin(id).subscribe(result => {

            this.getProductData();
            this._notification.create(
                'Successfully Message',
                'Product has been rejected successfully',
                ''
            );
        });
    }

    // Method for getting product variant
    getProductVariants(data) {
        this.getProdVariantSubs = this.productVariantService
            .getAllVariantByProductId(data.id)
            .subscribe(result => {
                this.currentProduct_variants = result;
                this.isVariantVisible = true;
            });
    }

    // Method for showing variant modal
    showVariantModal = data => {
        this.formReset();
        this.addNew = false;
        this.currentProduct = data;
        this.getProductVariants(data);
        if (this.status == 1) {
            this.type = 0;
        } else {
            this.type = 1;
        }
        this.variantService.getAllVariantWithStatus(this.type).subscribe(result => {
            this.variantOptions = result;
            this.variantOptions.forEach(element => {
                if (element.type == 1) {
                    element.name = element.name + " (Price Variation: Yes)"
                } else {
                    element.name = element.name + " (Price Variation: No)"
                }
            });
        });
    };
    // Modal method
    handleOk = e => {
        this.isVariantVisible = false;
        this.isPromotionVisible = false;
        this.isBulkUploadModalVisible = false;
    };
    // Modal method
    handleCancel = e => {
        this.isVariantVisible = false;
        this.isPromotionVisible = false;
        this.isBulkUploadModalVisible = false;
    };


    // Method called in variant option change
    variantOptionChange($event) {
        this.validateForm.get('name').setValidators(this.setRequired());
        this.validateForm.get('quantity').setValidators(this.setRequired());

        if (!$event) {
            this.warehouseVariantOptions = [];
            return;
        }
        const variantId = encodeURI($event.id);
        this.validateForm.controls.warehouses_variant_id.patchValue(null);
        if (variantId !== 'null' && variantId !== 'undefined') {
            this.warehouseVariantService.getAllWarehouseVariantBy_VariantId_And_WarehouseId(variantId, this.currentUser.warehouse.id).subscribe(result => {
                this.warehouseVariantOptions = result;
            });
        } else {
            this.warehouseVariantOptions = [];
        }
    }


    // Method for check disable
    checkDisabled() {
        return true;
    }

    // Event method for deleting product variant
    deleteProductVariantConfirm(index, id) {
        this.productVariantService.delete(id).subscribe(result => {
            this.currentProduct_variants.splice(index, 1);
            this._notification.create('Success Message', 'Product variant has been removed successfully', '');
        });
    }

    // Method called in warehouse variant option change
    warehouseVariantOptionChange($event) {

        if (this.selectedVariant_id && this.selectedVariant_id.type == 1) {
            return;
        }

        if ($event && $event.includes(0)) {
            const el = [];
            this.warehouseVariantOptions.forEach(element => {
                el.push(element.id);
            });
            this.selectedWarehousesVariantOption = el;
        }
    }

    // Method for submitting promotion form
    submitAddPromotionForm($event, value) {
        $event.preventDefault();
        for (const i in this.validatePromotionForm.controls) {
            this.validatePromotionForm.controls[i].markAsDirty();
        }

        const formData: FormData = new FormData();
        formData.append('promotion', value.promotion ? '1' : '0');
        formData.append('promo_price', value.promo_price);
        formData.append('start_date', value.start_date);
        formData.append('end_date', value.end_date);
        formData.append('sale_unit', value.sale_unit);

        const formValue = {
            promotion: value.promotion ? 1 : 0,
            promo_price: value.promo_price,
            start_date: value.start_date,
            end_date: value.end_date,
            sale_unit: value.sale_unit
        };

        this.addPropSubs = this.productService.update(this.currentProduct.id, formValue).subscribe(
            result => {
                this.currentProduct.promotion = value.promotion;
                this.currentProduct.promo_price = value.promo_price;
                this.currentProduct.start_date = value.start_date;
                this.currentProduct.end_date = value.end_date;
                this.currentProduct.sale_unit = value.sale_unit;
                this.promotionFormReset();
                this.addNew = false;
            },
            error => {
            }
        );
    }

    // Method for showing product promotion modal
    promotionOptionChange($event) {
    }

    // Method for getting promoted products
    showPromotionModal(data) {
        this.formReset();
        this.addNew = false;
        this.currentProduct = data;
        this.getProductPromotions();
    }

    // Method for showing part modal
    getProductPromotions() {
        this.isPromotionVisible = true;
    }

    // Method for getting products
    showPartModal(data) {
        this.showAddPart = true;
        this.showList = false;
        this.currentProductForAddPart = data;
    }

    // Event method for pagination change
    changePage(page: number, limit: number) {
        this.page = page;
        this.limit = limit;
        this.getProductData();
        return false;
    }


    // Event method for setting up filter data
    private filterTerm(sortValue: string): string {
        switch (sortValue) {
            case 'ascend':
                return 'ASC';
            case 'descend':
                return 'DESC';
            default:
                return '';
        }
    }

    // Event method for resetting all filters
    resetAllFilter() {
        this.limit = 10;
        this.page = 1;
        this.codeSearchValue = '';
        this.nameSearchValue = '';
        this.sortKey = "";
        this.sortValue = "";
        this.typeId = null;
        this.categoryId = null;
        this.subcategoryId = null;
        this.categorySearchOptions = [];
        this.subcategorySearchOptions = [];
        this.approvalStatus = null;
        this.getProductData();
    }

    // Method called in type option change
    typeIdChange($event) {
        this.page = 1;
        const query = encodeURI($event);
        this.categorySearchOptions = [];
        this.categoryId = null;
        this.subcategorySearchOptions = [];
        this.subcategoryId = null;
        this.getProductData();

        if (query !== 'null') {
            this.categoryProductService
                .getSubcategoryByCategoryId(query)
                .subscribe(result => {
                    this.categorySearchOptions = result;
                });
        }
    }

    // Method called in brand option change
    brandIdChange($event) {
        this.page = 1;
        this.getProductData();
    }

    // Method called in brand option change
    approvalStatusChange($event) {
        this.page = 1;
        const query = encodeURI($event);
        console.log('approvalStatusChange-query', query)
        this.approvalStatus = query
        this.getProductData();
    }

    // Method called in subcategory option change
    categoryIdChange($event) {
        this.page = 1;
        const query = encodeURI($event);
        this.subcategorySearchOptions = [];
        this.subcategoryId = null;
        this.getProductData();

        if (query !== 'null') {
            this.categoryChangeSubs = this.categoryProductService
                .getSubcategoryByCategoryId(query)
                .subscribe(result => {
                    this.subcategorySearchOptions = result;
                });
        }
    }

    // Method called in subcategory option change
    subcategoryIdChange($event) {
        this.page = 1;
        this.getProductData();
    }

}
