import {Component, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {FileHolder, UploadMetadata} from 'angular2-image-upload';
import {NzNotificationService} from 'ng-zorro-antd';
import {CmsService} from '../../../../services/cms.service';
import {environment} from "../../../../../environments/environment";
import {OfferService} from "../../../../services/offer.service";
import moment from "moment";
import * as ___ from 'lodash';
import {ProductService} from "../../../../services/product.service";

@Component({
    selector: 'app-offer-edit',
    templateUrl: './offer-edit.component.html',
    styleUrls: ['./offer-edit.component.css']
})
export class OfferEditComponent implements OnInit {
    validateForm: FormGroup;
    ImageFile: File;
    BannerImageFile: File;
    smallOfferImage: File;
    @ViewChild('Image')
    Image: any;
    IMAGE_ENDPOINT = environment.IMAGE_ENDPOINT;
    ckConfig = {
        uiColor: '#662d91',
        toolbarGroups: [
            {
                name: 'basicstyles',
                group: [
                    'Bold',
                    'Italic',
                    'Underline',
                    'Strike',
                    'Subscript',
                    'Superscript',
                    '-',
                    'JustifyLeft',
                    'JustifyCenter',
                    'JustifyRight',
                    'JustifyBlock',
                    '-',
                    'BidiLtr',
                    'BidiRtl',
                    'Language'
                ]
            },
            {
                name: 'paragraph',
                groups: ['JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock']
            },
            {name: 'styles', groups: ['Styles', 'Format', 'Font', 'FontSize']}
        ],
        removeButtons: 'Source,Save,Templates,Find,Replace,Scayt,SelectAll'
    };
    _isSpinning: any = false;
    sub: any;
    id: any;
    ImageFileEdit: any;
    BannerImageFileEdit: any;
    smallOfferImageEdit: any;
    data: any;

    selectionType;
    productIds;
    offeredProducts;
    totalOfferedProducts;
    isVisible: Boolean = false;
    isProductModal: Boolean = false;
    allProductPage: number = 1;
    allProductLimit: number = 20;

    vendorId;
    brandId;
    categoryId;
    subCategoryId;
    subSubCategoryId;
    allOptions;
    calculationType;
    offerSelectionType;

    /**variables used for storing subCat and subSubCat options*/
    subcategoryIDS;
    subSubCategoryIDS;

    /**variable for all product modal: */
    allProductTotal = 0;
    allProducts: any = [];
    selectedAllProductIds: any = [];
    selectedData;
    allProductSelectAll: any = [false];
    offerProductIds: any = [];

    allProductNameSearch: string = '';
    allProductCodeSearch: string = '';
    allShopOwnerSearch: string = '';
    allBrandSearch: string = '';
    allCategorySearch: string = '';
    allSubCategorySearch: string = '';

    selectedProductIds: any;

    isShowHomepage: boolean;

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private _notification: NzNotificationService,
        private fb: FormBuilder,
        private cmsService: CmsService,
        private offerService: OfferService,
        private productService: ProductService
    ) {
    }

    // init the component
    ngOnInit() {
        this.validateForm = this.fb.group({
            title: ['', [Validators.required]],
            frontend_position: ['', ''],
            selectionType: ['', [Validators.required]],
            vendorId: ['', []],
            brandId: ['', []],
            categoryId: ['', []],
            subCategoryId: ['', []],
            subSubCategoryId: ['', []],
            description: ['', []],
            discountAmount: ['', [Validators.required]],
            calculationType: ['', [Validators.required]],
            offerStartDate: ['', Validators.required],
            offerEndDate: ['', Validators.required],
            showHome: ['', []],
        });
        this.sub = this.route.params.subscribe(params => {
            this._isSpinning = true;
            this.id = +params['id']; // (+) converts string 'id' to a number
            this.offerService.getRegularOfferById(this.id)
                .subscribe(result => {
                    console.log(result.regularOffer);
                    this.ImageFileEdit = [];
                    this.BannerImageFileEdit = [];
                    this.smallOfferImageEdit = [];
                    this.data = result.regularOffer;

                    this.isShowHomepage = this.data.show_in_homepage;

                    this.selectionType = this.data.selection_type;
                    this.offerSelectionType = this.selectionType;
                    this.vendorId = this.data.vendor_id ? this.data.vendor_id.id : '';
                    this.brandId = this.data.brand_id ? this.data.brand_id.id : '';
                    this.categoryId = this.data.category_id ? this.data.category_id.id : '';
                    this.subCategoryId = this.data.subCategory_Id ? this.data.subCategory_Id.id : '';
                    this.subSubCategoryId = this.data.subSubCategory_Id ? this.data.subSubCategory_Id.id : '';
                    this.calculationType = this.data.calculation_type;

                    let payload = {
                        title: this.data.title,
                        frontend_position: this.data.frontend_position,
                        selectionType: this.data.selection_type,
                        vendorId: this.data.vendor_id ? this.data.vendor_id.id : '',
                        brandId: this.data.brand_id ? this.data.brand_id.id : '',
                        categoryId: this.data.category_id ? this.data.category_id.id : '',
                        subCategoryId: this.data.subCategory_Id ? this.data.subCategory_Id.id : '',
                        subSubCategory_Id: this.data.subSubCategory_Id ? this.data.subSubCategory_Id.id : '',
                        description: this.data.description,
                        offerStartDate: this.data.start_date,
                        offerEndDate: this.data.end_date,
                        discountAmount: this.data.discount_amount,
                        calculationType: this.data.calculation_type,
                        showHome: this.data.show_in_homepage,
                    };

                    this.validateForm.patchValue(payload);

                    if (this.data && this.data.image && this.data.image.image) {
                        this.ImageFileEdit.push(this.IMAGE_ENDPOINT + this.data.image.image);
                    }

                    if (this.data && this.data.image && this.data.image.banner_image) {
                        this.BannerImageFileEdit.push(this.IMAGE_ENDPOINT + this.data.image.banner_image);
                    }

                    if (this.data && this.data.image && this.data.image.small_image) {
                        this.smallOfferImageEdit.push(this.IMAGE_ENDPOINT + this.data.image.small_image);
                    }

                    this._isSpinning = false;
                }, () => {
                    this._isSpinning = false;
                });
        });
    }

//Event method for submitting the form
    submitForm = ($event, value) => {
        $event.preventDefault();
        this._isSpinning = true;

        for (const key in this.validateForm.controls) {
            this.validateForm.controls[key].markAsDirty();
        }

        let formData = new FormData();
        let showInHome = this.isShowHomepage ? "true" : "false";

        formData.append('id', this.id);
        formData.append('title', value.title);
        formData.append('selection_type', value.selectionType);
        formData.append('description', value.description);
        formData.append('calculationType', value.calculationType);
        formData.append('discountAmount', value.discountAmount);
        formData.append('showInHome', showInHome);
        formData.append('offerEndDate', moment(value.offerEndDate).format('YYYY-MM-DD HH:mm:ss'));
        formData.append('frontend_position', value.frontend_position);

        if (this.selectedProductIds) {
            formData.append('selectedProductIds', this.selectedProductIds);
        }

        if (value.vendorId) {
            formData.append('vendor_id', value.vendorId);
        }

        if (value.brandId) {
            formData.append('brand_id', value.brandId);
        }

        if (value.categoryId) {
            formData.append('category_id', value.categoryId);
        }
        if (value.subCategoryId) {
            formData.append('subCategory_Id', value.subCategoryId);
        }
        if (value.subSubCategoryId) {
            formData.append('subSubCategory_Id', value.subSubCategoryId);
        }

        if (this.ImageFile) {
            formData.append('hasImage', 'true');
            formData.append('image', this.ImageFile, this.ImageFile.name);
        } else {
            formData.append('hasImage', 'false');
        }

        if (this.smallOfferImage) {
            formData.append('hasSmallImage', 'true');
            formData.append('image', this.smallOfferImage, this.smallOfferImage.name);
        } else {
            formData.append('hasSmallImage', 'false');
        }

        if (this.BannerImageFile) {
            formData.append('hasBannerImage', 'true');
            formData.append('image', this.BannerImageFile, this.BannerImageFile.name);
        } else {
            formData.append('hasBannerImage', 'false');
        }

        this.offerService.updateOffer(formData).subscribe(result => {
            if (result.code === 'INVALID_SUBSUBCAT') {
                this._notification.error('Sub-sub-Category exists', "Sub-sub-Category already exists in another offer ");
                this._isSpinning = false;
            } else {
                this._notification.success('Updated', "Offer updated successfully");
                this._isSpinning = false;
                this.resetForm(null);
                this.router.navigate(['/dashboard/offer']);
            }
        }, () => {
            this._isSpinning = false;
        });
    };

    //Event method for resetting the form
    resetForm($event: MouseEvent) {
        $event ? $event.preventDefault() : null;
        this.validateForm.reset();
        for (const key in this.validateForm.controls) {
            this.validateForm.controls[key].markAsPristine();
        }
    }

//Event method for setting up form in validation
    getFormControl(name) {
        return this.validateForm.controls[name];
    }

//Event method for removing picture
    onRemoved(file: FileHolder) {
        this.ImageFile = null;
    }

    onBannerRemoved(file: FileHolder) {
        this.BannerImageFile = null;
    }

    onRemoveSmallOfferImage(file: FileHolder) {
        this.smallOfferImage = null;
    }

//Event method for storing imgae in variable
    onBeforeUpload = (metadata: UploadMetadata) => {
        this.ImageFile = metadata.file;
        return metadata;
    }

    onBeforeBannerUpload = (metadata: UploadMetadata) => {
        this.BannerImageFile = metadata.file;
        return metadata;
    }

    onBeforeUploadImage = (metadata: UploadMetadata) => {
        this.smallOfferImage = metadata.file;
        return metadata;
    }

    changeShowHomepage() {
        this.isShowHomepage = !this.isShowHomepage;
    }

    getAllProducts(event: any) {
        if (event) {
            this.allProductPage = event;
        }
        this._isSpinning = true;
        this.productService.getAllWithPagination(this.allProductPage, this.allProductLimit, this.offerProductIds, this.allProductNameSearch, this.allProductCodeSearch, this.allShopOwnerSearch, this.allBrandSearch, this.allCategorySearch, this.allSubCategorySearch)
            .subscribe(result => {
                if (typeof result.data !== 'undefined') {
                    this.allProductTotal = result.total;
                    this.allProducts = result.data.map(item => {
                        return {
                            ...item,
                            checked: false
                        }
                    });
                    const thisTotal = this.allProducts.length;
                    if (typeof this.selectedAllProductIds[this.allProductPage - 1] === 'undefined') {
                        this.selectedAllProductIds[this.allProductPage - 1] = [];
                    }
                    if (typeof this.allProductSelectAll[this.allProductPage - 1] === 'undefined') {
                        this.allProductSelectAll[this.allProductPage - 1] = false;
                    }

                    if (this.selectedAllProductIds[this.allProductPage - 1].length) {
                        for (let index = 0; index < thisTotal; index++) {
                            const foundIndex = this.selectedAllProductIds[this.allProductPage - 1].findIndex((prodId) => {
                                return prodId == this.allProducts[index].id;
                            });
                            this.allProducts[index].checked = foundIndex !== -1;
                        }
                    } else {
                        for (let index = 0; index < thisTotal; index++) {
                            this.allProducts[index].checked = false;
                        }
                    }
                } else {
                    this.allProducts = [];
                    this.allProductTotal = 0;
                }
                this._isSpinning = false;
            }, err => {
                this._isSpinning = false;
            });
    }

    allProductCodeChangeHandler(event: any) {
        this.allProductCodeSearch = event;
        this.getAllProducts(1);
    }

    allProductNameChangeHandler(event: any) {
        this.allProductNameSearch = event;
        this.getAllProducts(1);
    }

    allProductShopOwnerChangeHandler(event: any) {
        this.allShopOwnerSearch = event;
        this.getAllProducts(1);
    }

    allProductBrandChangeHandler(event: any) {
        this.allBrandSearch = event;
        this.getAllProducts(1);
    }

    allProductCategoryChangeHandler(event: any) {
        this.allCategorySearch = event;
        this.getAllProducts(1);
    }

    allProductSubCategoryChangeHandler(event: any) {
        this.allSubCategorySearch = event;
        this.getAllProducts(1);
    }

    selectAllProducts($event: any) {
        const isChecked = !!$event;
        if (!isChecked) {
            this.selectedAllProductIds[this.allProductPage - 1] = [];
        }

        this.allProductSelectAll[this.allProductPage - 1] = isChecked;
        const len = this.allProducts.length;
        for (let i = 0; i < len; i++) {
            this.allProducts[i].checked = isChecked;
            if (isChecked) {
                const foundIndex = this.selectedAllProductIds[this.allProductPage - 1].findIndex((prodId) => {
                    return prodId == this.allProducts[i].id;
                });
                if (foundIndex === -1) {
                    this.selectedAllProductIds[this.allProductPage - 1].push(this.allProducts[i].id);
                }
            }
        }
        console.log("selectd products; ", this.selectedAllProductIds);
    }

    // Method for refresh offer checkbox data in the offer modal
    _refreshStatus($event, value) {
        if ($event) {
            this.selectedAllProductIds[this.allProductPage - 1].push(value);
        } else {
            let findIndex = this.selectedAllProductIds[this.allProductPage - 1].findIndex((prodId) => {
                return prodId == value
            });
            if (findIndex !== -1) {
                this.selectedAllProductIds[this.allProductPage - 1].splice(findIndex, 1);
            }
        }

        /*to show the selected products at the top*/
        this.offerService.getSelectedProductsInfo(this.selectedAllProductIds)
            .subscribe(result => {
                this.selectedData = result.data;
            })
        console.log(this.selectedAllProductIds);
    }

    submitModalForm() {
        this.selectedProductIds = ___.flatten(this.selectedAllProductIds).filter(ids => {
            return ids !== undefined;
        });

        if (this.selectedProductIds.length === 0) {
            return false;
        }
        this._notification.success(this.selectedProductIds.length, ' items has been added');
        this.isProductModal = false;
        this.isVisible = false;
    }

    getRelatedOfferProducts(event: any) {
        if (event) {
            this.allProductPage = event;
        }
        this._isSpinning = true;
        this.offerService.getRelatedOfferProducts(this.id, this.allProductPage, this.allProductLimit)
            .subscribe(result => {
                this.offeredProducts = result.data;
                this.totalOfferedProducts = result.total;
                this._isSpinning = false;
            }, err => {
                this._isSpinning = false;
            })
    }

    showOfferModal() {
        this.isVisible = true;
        this.getRelatedOfferProducts(1);
    }

    handleOfferCancel(): void {
        this.isVisible = false;
    }

    handleProductCancel(): void {
        this.isProductModal = false;
    }


    removeProductFromOffer(productId) {
        this.offerService.removeProductFromOffer(productId, this.id)
            .subscribe(res => {
                this._notification.create(
                    "success",
                    "Removed",
                    'Product removed successfully'
                );
                this.getRelatedOfferProducts(this.allProductPage);
            }, err => {
                this._notification.create(
                    "error",
                    "failed",
                    'Failed to remove product'
                );
            })
    }

    showProductModal() {
        this.isProductModal = true;
        this.getAllProducts(1);
    }

    /**Method called when selection type is changed from the front end*/
    onSelectionTypeSelect(offerSelectionType) {
        this.offerSelectionType = offerSelectionType;
        if (offerSelectionType && offerSelectionType !== 'Product wise') {
            this.getAllOptions(offerSelectionType);
        }
    }

    /**method called to show the available options according to the selection in the offer selection type dropdown*/
    getAllOptions(offerSelectionType?, catId?, subCatId?) {
        if (offerSelectionType || catId || subCatId) {
            if (offerSelectionType) {
                this.offerService.getAllOptions(offerSelectionType, catId, subCatId)
                    .subscribe(result => {
                        this.allOptions = result.data;
                    })
            } else if (catId) {
                this.offerService.getAllOptions(offerSelectionType, catId, subCatId)
                    .subscribe(result => {
                        this.subcategoryIDS = result.data;
                    })
            } else if (subCatId) {
                this.offerService.getAllOptions(offerSelectionType, catId, subCatId)
                    .subscribe(result => {
                        this.subSubCategoryIDS = result.data;
                    })
            }
        }
    }

    /**Method call when we selection a offer selection type, it does not allow to store previously selected selection type
     it only keeps the finally selected selection type data*/
    finalSelectionType(vendorId, brandId, categoryId, subCategoryId, selectedProductIds, event) {
        if (event) {
            if (vendorId) {
                this.vendorId = event;
                this.brandId = null;
                this.categoryId = null;
                this.subCategoryId = null;
                this.subSubCategoryId = null;
                this.selectedProductIds = null;
            } else if (brandId) {
                this.vendorId = null;
                this.brandId = event;
                this.categoryId = null;
                this.subCategoryId = null;
                this.subSubCategoryId = null;
                this.selectedProductIds = null;
            } else if (categoryId) {
                this.vendorId = null;
                this.brandId = null;
                console.log("event: ", event);
                console.log("categoryId: ", this.categoryId);
                if (this.categoryId !== event) {
                    this.subCategoryId = null;
                    this.subSubCategoryId = null;
                }
                this.categoryId = event;
                this.selectedProductIds = null;
                this.getAllOptions('', event, '')
            } else if (subCategoryId) {
                this.vendorId = null;
                this.brandId = null;
                console.log("event: ", event);
                console.log("subCategoryId: ", this.subCategoryId);
                if (this.subCategoryId !== event) {
                    this.subSubCategoryId = null;
                }
                this.subCategoryId = event;
                this.selectedProductIds = null;
            } else if (selectedProductIds) {
                this.vendorId = null;
                this.brandId = null;
                this.categoryId = null;
                this.subCategoryId = null;
                this.subSubCategoryId = null;
            }
        }
    }


}


/*
let now = moment(new Date());
let end = moment(order.createdAt);
let duration = moment.duration(now.diff(end));
let expiredHour = duration.asHours();
order.expiredHour = Math.floor(expiredHour);*/
