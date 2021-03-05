import {ActivatedRoute} from '@angular/router';
import {Component, OnDestroy, OnInit} from '@angular/core';
import {ProductService} from '../../../../services/product.service';
import {ProductVariantService} from '../../../../services/product-variant.service';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {VariantService} from '../../../../services/variant.service';
import {WarehouseVariantService} from '../../../../services/warehouse-variant.service';
import {NzNotificationService} from 'ng-zorro-antd';
import {Router} from '@angular/router';
import {AuthService} from '../../../../services/auth.service';
import {CategoryProductService} from '../../../../services/category-product.service';
import {BrandService} from '../../../../services/brand.service';
import {UIService} from '../../../../services/ui/ui.service';
import {Subscription} from 'rxjs';
import {DesignImagesService} from '../../../../services/design-images.service';
import {environment} from "../../../../../environments/environment";
import {formatDate} from "@angular/common";

@Component({
    selector: 'app-product',
    templateUrl: './product.component.html',
    styleUrls: ['./product.component.css']
})
export class ProductComponent implements OnInit, OnDestroy {
    private currentWarehouseSubscriprtion: Subscription;
    status: any = 1;
    type: any;

    ngOnDestroy(): void {
        this.currentWarehouseSubscriprtion
            ? this.currentWarehouseSubscriprtion.unsubscribe()
            : '';
    }

    showList: boolean = true;
    showAddPart: boolean = false;
    isBulkUploadModalVisible = false;
    isVariantVisible = false;
    isPromotionVisible = false;
    currentProduct: any = {};
    IMAGE_ENDPOINT = environment.IMAGE_ENDPOINT;
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
    total: number;
    codeSearchValue: string = '';
    nameSearchValue: string = '';
    priceSearchValue: string = '';
    typeId: any = null;
    brandId: any = null;
    categoryId: any = null;
    subcategoryId: any = null;

    approvalStatus: any = null;

    sortValue = {
        code: null,
        name: null,
        price: null,
        quantity: null,
        updatedAt: null
    };

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
    }

    // For initiating the section element with data
    ngOnInit(): void {
        this.route.queryParams.filter(params => params.status).subscribe(params => {
            this.status = params.status;
        });

        this.currentUser = this.authService.getCurrentUser();
        this.currentWarehouseSubscriprtion = this.uiService.currentSelectedWarehouseInfo.subscribe(
            warehouseId => {
                this.currentWarehouseId = warehouseId || '';
                this.getProductData();
            }
        );

        this.categoryProductService.getAllCategory().subscribe((result: any) => {
            this.TypeSearchOptions = result;
        });

        this.brandService.getAll().subscribe((result: any) => {
            this.brandSearchOptions = result;
        });

        this.categoryProductService.getAll().subscribe((result: any) => {
            this.categorySearchOptions = result;
        })
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
    sort(sortName, sortValue) {
        console.log('sort(sortName, sortValue)', sortName, sortValue)
        this.page = 1;
        this.sortValue[sortName] = sortValue;
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

        this.productVariantService.insert(formValue).subscribe(result => {
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
        this.productService.delete(id).subscribe(result => {

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
        console.log('approveConfirm', id)
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
        this.productVariantService
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

    variantSearchChange($event) {
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

        this.productService.update(this.currentProduct.id, formValue).subscribe(
            result => {
                console.log('submitAddPromotionForm-result', result);
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
        console.log('showPromotionModal', this.currentProduct);
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

    // Method called in brand option change
    getProductData() {
        this.productService
            .getAllProductsByStatus(
                this.status,
                this.page,
                this.limit,
                this.codeSearchValue,
                this.nameSearchValue,
                this.brandId || '',
                this.typeId || '',
                this.categoryId || '',
                this.subcategoryId || '',
                this.currentWarehouseId,
                this.filterTerm(this.sortValue.code),
                this.filterTerm(this.sortValue.name),
                this.filterTerm(this.sortValue.price),
                this.filterTerm(this.sortValue.quantity),
                this.filterTerm(this.sortValue.updatedAt),
                this.approvalStatus || '',
                this.priceSearchValue
            )
            .subscribe(
                result => {
                    this.data = result.data;
                    console.log('getProductData', this.data)
                    this.total = result.total;
                    this._isSpinning = false;
                },
                result => {
                    this._isSpinning = false;
                }
            );
    }

    formattedDate(dateVal) {
        const format = 'dd/MM/yyyy hh:mm a';
        const locale = 'en-US';
        return formatDate(dateVal, format, locale);
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
        this.sortValue = {
            code: null,
            name: null,
            price: null,
            quantity: null,
            updatedAt: null
        };
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
        const query = encodeURI($event);
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
            this.categoryProductService
                .getSubcategoryByCategoryId(query)
                .subscribe(result => {
                    this.subcategorySearchOptions = result;
                });
        }
    }

    categoryIdSearchChange($event) {
    }

    brandIdSearchChange($event) {
    }

    typeIdSearchChange($event) {
    }

    // Method called in subcategory option change
    subcategoryIdChange($event) {
        this.page = 1;
        this.getProductData();
    }

    subcategoryIdSearchChange($event) {
    }
}
