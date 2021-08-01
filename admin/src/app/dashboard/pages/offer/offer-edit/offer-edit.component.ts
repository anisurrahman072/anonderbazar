import {Component, OnInit} from '@angular/core';
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
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import {DesignImagesService} from "../../../../services/design-images.service";
import {ExportService} from "../../../../services/export.service";
import {ExcelService} from "../../../../services/excel.service";

class OfferBulk {
    code: string = "";
    calculation_type: string = "";
    discount_amount: number = 0;

}

@Component({
    selector: 'app-offer-edit',
    templateUrl: './offer-edit.component.html',
    styleUrls: ['./offer-edit.component.css']
})
export class OfferEditComponent implements OnInit {

    Editor = ClassicEditor;
    config = {
        toolbar: {
            items: [
                'heading', '|', 'bold', 'italic', 'link',
                'bulletedList', 'numberedList', '|', 'indent', 'outdent', '|',
                'imageUpload',
                'blockQuote',
                'insertTable',
                'mediaEmbed',
                'undo', 'redo'
            ],
            heading: {
                options: [
                    {model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph'},
                    {model: 'heading1', view: 'h1', title: 'Heading 1', class: 'ck-heading_heading1'},
                    {model: 'heading2', view: 'h2', title: 'Heading 2', class: 'ck-heading_heading2'}
                ]
            },
            shouldNotGroupWhenFull: true,
            image: {
                toolbar: [
                    'imageTextAlternative',
                    'imageStyle:full',
                    'imageStyle:side'
                ]
            }
        },
    };

    /** csv related variables */
    isUpload: Boolean = false;
    isLoading: boolean = false;
    private importedProducts: OfferBulk[] = [];
    total: number = 0;
    wrongCodes = [];
    private individuallySelectedCodes: any = [];
    continue: Boolean = false;
    uploadType;

    validateForm: FormGroup;
    individualProductFrom: FormGroup;

    IMAGE_ENDPOINT = environment.IMAGE_ENDPOINT;

    _isSpinning: any = false;
    submitting: boolean = false;
    sub: any;
    id: any;

    data: any;

    selectionType;
    productIds;
    offeredProducts;
    totalOfferedProducts;
    offeredIndividualProducts;
    totalOfferedIndividualProducts;
    isVisible: Boolean = false;
    isIndividualOfferedVisible: Boolean = false;
    isProductModal: Boolean = false;
    isIndividualProductModal: Boolean = false;
    allProductPage: number = 1;
    allProductLimit: number = 20;

    vendorId;
    brandId;
    categoryId;
    subCategoryId;
    subSubCategoryId;
    allOptions;
    calculationType;
    Calculation_type
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
    selectedIndividualProductIds: any;

    isShowHomepage: boolean;
    isShowCarousel: boolean = false;

    individuallySelectedProductsId: any = [];
    individuallySelectedProductsCalculation: any = [];
    individuallySelectedProductsAmount: any = [];

    individuallySelectedData: any = [];

    isActiveSslCommerz: boolean = false;
    isActiveBkash: boolean = false;
    isActiveOffline: boolean = false;
    isActiveCashOnDelivery: boolean = false;

    /** Image variables */
    hasImageFile: boolean = false;
    hasBannerImageFile: boolean = false;
    hasSmallOfferImageFile: boolean = false;

    ImageFilePath = [];
    BannerImageFilePath = [];
    SmallOfferImageFilePath = [];

    isImageInDB: boolean = false;
    isBannerImageInDB: boolean = false;
    isSmallOfferImageInDB: boolean = false;

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private _notification: NzNotificationService,
        private fb: FormBuilder,
        private cmsService: CmsService,
        private offerService: OfferService,
        private productService: ProductService,
        private designImagesService: DesignImagesService,
        private exportService: ExportService,
        private excelService: ExcelService,
    ) {
    }

    // init the component
    ngOnInit() {
        this.validateForm = this.fb.group({
            title: ['', [Validators.required]],
            frontend_position: ['', ''],
            carousel_position: ['', ''],
            selectionType: ['', [Validators.required]],
            vendorId: ['', []],
            brandId: ['', []],
            categoryId: ['', []],
            subCategoryId: ['', []],
            subSubCategoryId: ['', []],
            description: ['', []],
            discountAmount: ['', []],
            calculationType: ['', []],
            pay_by_sslcommerz: ['', []],
            pay_by_bKash: ['', []],
            pay_by_offline: ['', []],
            pay_by_cashOnDelivery: ['', []],
            offerStartDate: ['', Validators.required],
            offerEndDate: ['', Validators.required],
            showHome: ['', []],
            showCarousel: ['', []],
            uploadType: ['', []],
        });

        this.individualProductFrom = this.fb.group({
            Calculation_type: ['', []],
            discount_amount: ['', []]
        })

        this.sub = this.route.params.subscribe(params => {
            this._isSpinning = true;
            this.id = +params['id']; // (+) converts string 'id' to a number
            this.offerService.getRegularOfferById(this.id)
                .subscribe(result => {
                    /*console.log(result.regularOffer);*/
                    this.data = result.regularOffer;

                    this.isShowHomepage = this.data.show_in_homepage;
                    this.isShowCarousel = this.data.showInCarousel;

                    this.selectionType = this.data.selection_type;
                    this.offerSelectionType = this.selectionType;
                    this.vendorId = this.data.vendor_id ? this.data.vendor_id.id : '';
                    this.brandId = this.data.brand_id ? this.data.brand_id.id : '';
                    this.categoryId = this.data.category_id ? this.data.category_id.id : '';
                    this.subCategoryId = this.data.subCategory_Id ? this.data.subCategory_Id.id : '';
                    this.subSubCategoryId = this.data.subSubCategory_Id ? this.data.subSubCategory_Id.id : '';
                    this.calculationType = this.data.calculation_type;
                    this.uploadType = this.data.upload_type ? this.data.upload_type : '';

                    let payload = {
                        title: this.data.title,
                        frontend_position: this.data.frontend_position,
                        carousel_position: this.data.carousel_position,
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
                        uploadType: this.data.upload_type ? this.data.upload_type : '',
                        pay_by_sslcommerz: this.data.pay_by_sslcommerz,
                        pay_by_bKash: this.data.pay_by_bKash,
                        pay_by_offline: this.data.pay_by_offline,
                        pay_by_cashOnDelivery: this.data.pay_by_cashOnDelivery
                    };

                    this.isActiveSslCommerz = !!this.data.pay_by_sslcommerz;
                    this.isActiveBkash = !!this.data.pay_by_bKash;
                    this.isActiveOffline = !!this.data.pay_by_offline;
                    this.isActiveCashOnDelivery = !!this.data.pay_by_cashOnDelivery;

                    this.validateForm.patchValue(payload);

                    if (this.data && this.data.image && this.data.image.image) {
                        this.hasImageFile = true;
                        this.ImageFilePath.push(this.IMAGE_ENDPOINT + this.data.image.image);
                        this.isImageInDB = true;
                    }

                    if (this.data && this.data.image && this.data.image.banner_image) {
                        this.hasBannerImageFile = true;
                        this.BannerImageFilePath.push(this.IMAGE_ENDPOINT + this.data.image.banner_image);
                        this.isBannerImageInDB = true;
                    }

                    if (this.data && this.data.image && this.data.image.small_image) {
                        this.hasSmallOfferImageFile = true;
                        this.SmallOfferImageFilePath.push(this.IMAGE_ENDPOINT + this.data.image.small_image);
                        this.isSmallOfferImageInDB = true;
                    }

                    this._isSpinning = false;
                }, () => {
                    this._isSpinning = false;
                });
        });
        this.getRelatedOfferIndividualProducts();
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
        let showInCarousel = this.isShowCarousel ? 'true' : 'false';

        formData.append('id', this.id);
        formData.append('title', value.title);
        formData.append('selection_type', value.selectionType);
        formData.append('description', value.description);
        formData.append('calculationType', value.calculationType);
        formData.append('discountAmount', value.discountAmount);

        formData.append('pay_by_sslcommerz', this.isActiveSslCommerz ? "1" : "0");
        formData.append('pay_by_bKash', this.isActiveBkash ? "1" : "0");
        formData.append('pay_by_offline', this.isActiveOffline ? "1" : "0");
        formData.append('pay_by_cashOnDelivery', this.isActiveCashOnDelivery ? "1" : "0");

        formData.append('showInHome', showInHome);
        formData.append('showInCarousel', showInCarousel);
        formData.append('offerEndDate', moment(value.offerEndDate).format('YYYY-MM-DD HH:mm:ss'));
        formData.append('offerStartDate', moment(value.offerStartDate).format('YYYY-MM-DD HH:mm:ss'));

        if (this.selectedProductIds) {
            formData.append('selectedProductIds', this.selectedProductIds);
        }

        if (this.individuallySelectedProductsId && value.selectionType === 'individual_product' && this.uploadType === 'modal') {
            formData.append('individuallySelectedProductsId', this.individuallySelectedProductsId);
            formData.append('upload_type', 'modal');
        }
        if (this.individuallySelectedProductsCalculation) {
            formData.append('individuallySelectedProductsCalculation', this.individuallySelectedProductsCalculation);
        }
        if (this.individuallySelectedProductsAmount) {
            formData.append('individuallySelectedProductsAmount', this.individuallySelectedProductsAmount);
        }

        if (this.individuallySelectedCodes && value.selectionType === 'individual_product' && this.uploadType === 'csv') {
            formData.append('individuallySelectedCodes', this.individuallySelectedCodes);
            formData.append('upload_type', 'csv');
        }

        if (value.vendorId) {
            formData.append('vendor_id', value.vendorId);
        }

        if (value.brandId) {
            formData.append('brand_id', value.brandId);
        }

        if (value.selectionType === 'Category wise') {
            if (!this.categoryId) {
                this._notification.error('Category!', 'Select one category please');
                this._isSpinning = false;
                return;
            } else {
                formData.append('category_id', this.categoryId);
            }

            if (!this.subCategoryId) {
                this._notification.error('Sub Category!', 'Setting offer to a whole category by mistake is not allowed');
                this._isSpinning = false;
                return;
            } else {
                formData.append('subCategory_Id', this.subCategoryId);
            }
        }
        if (value.subSubCategoryId) {
            formData.append('subSubCategory_Id', value.subSubCategoryId);
        }

        if (value.frontend_position) {
            formData.append('frontend_position', value.frontend_position);
        }

        if (value.carousel_position) {
            formData.append('carousel_position', value.carousel_position);
        }

        let images = {
            image: '',
            small_image: '',
            banner_image: ''
        };

        if (this.hasImageFile) {
            images.image = this.ImageFilePath[0].split(this.IMAGE_ENDPOINT)[1];
        } else {
            delete images.image;
        }

        if (this.hasSmallOfferImageFile) {
            images.small_image = this.SmallOfferImageFilePath[0].split(this.IMAGE_ENDPOINT)[1];
        } else {
            delete images.small_image;
        }

        if (this.hasBannerImageFile) {
            images.banner_image = this.BannerImageFilePath[0].split(this.IMAGE_ENDPOINT)[1];
        } else {
            delete images.banner_image;
        }

        if(images){
            formData.append('images', JSON.stringify(images));
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

    // Event method for setting up form in validation
    getFormControl(name) {
        return this.validateForm.controls[name];
    }

    // Event method for removing picture
    onRemoved(file: FileHolder) {
        let formData = new FormData();
        formData.append('oldImagePath', `${this.ImageFilePath[0].split(this.IMAGE_ENDPOINT)[1]}`);
        if(this.isImageInDB){
            formData.append('id', `${this.id}`);
            formData.append('tableName', `offers`);
            formData.append('column', `image`);
            formData.append('format', `JSON`);
        }

        this.designImagesService.deleteImage(formData)
            .subscribe(data => {
                this.isImageInDB = false;
                this.ImageFilePath = [];
                this.hasImageFile = false;
                this._notification.success("Success", "Successfully deleted image");
            }, error => {
                console.log("Error occurred: ", error);
                this._notification.success("Error", "Error occurred while deleting image");
            })
    }

    onBannerRemoved(file: FileHolder) {
        let formData = new FormData();
        formData.append('oldImagePath', `${this.BannerImageFilePath[0].split(this.IMAGE_ENDPOINT)[1]}`);
        if(this.isBannerImageInDB){
            formData.append('id', `${this.id}`);
            formData.append('tableName', `offers`);
            formData.append('column', `image`);
            formData.append('format', `JSON`);
        }

        this.designImagesService.deleteImage(formData)
            .subscribe(data => {
                this.isBannerImageInDB = false;
                this.BannerImageFilePath = [];
                this.hasBannerImageFile = false;
                this._notification.success("Success", "Successfully deleted banner image");
            }, error => {
                console.log("Error occurred: ", error);
                this._notification.success("Error", "Error occurred while deleting banner image");
            })
    }

    onRemoveSmallOfferImage(file: FileHolder) {
        let formData = new FormData();
        formData.append('oldImagePath', `${this.SmallOfferImageFilePath[0].split(this.IMAGE_ENDPOINT)[1]}`);
        if(this.isSmallOfferImageInDB){
            formData.append('id', `${this.id}`);
            formData.append('tableName', `offers`);
            formData.append('column', `image`);
            formData.append('format', `JSON`);
        }

        this.designImagesService.deleteImage(formData)
            .subscribe(data => {
                this.isSmallOfferImageInDB = false;
                this.SmallOfferImageFilePath = [];
                this.hasSmallOfferImageFile = false;
                this._notification.success("Success", "Successfully deleted carousel beside offer image");
            }, error => {
                console.log("Error occurred: ", error);
                this._notification.success("Error", "Error occurred while deleting banner image");
            })
    }

    // Event method for storing imgae in variable
    onBeforeUpload = (metadata: UploadMetadata) => {
        let formData = new FormData();
        formData.append('image', metadata.file, metadata.file.name);

        this.designImagesService.insertImage(formData)
            .subscribe(data => {
                this.hasImageFile = true;
                this.ImageFilePath.push(this.IMAGE_ENDPOINT + data.path);
            }, error => {
                console.log("Error occurred: ", error);
            })

        return metadata;
    }

    onBeforeBannerUpload = (metadata: UploadMetadata) => {
        let formData = new FormData();
        formData.append('image', metadata.file, metadata.file.name);

        this.designImagesService.insertImage(formData)
            .subscribe(data => {
                this.hasBannerImageFile = true;
                this.BannerImageFilePath.push(this.IMAGE_ENDPOINT + data.path);
            }, error => {
                console.log("Error occurred: ", error);
            })

        return metadata;
    }

    onBeforeUploadImage = (metadata: UploadMetadata) => {
        let formData = new FormData();
        formData.append('image', metadata.file, metadata.file.name);

        this.designImagesService.insertImage(formData)
            .subscribe(data => {
                this.hasSmallOfferImageFile = true;
                this.SmallOfferImageFilePath.push(this.IMAGE_ENDPOINT + data.path);
            }, error => {
                console.log("Error occurred: ", error);
            })

        return metadata;
    }

    changeShowHomepage() {
        this.isShowHomepage = !this.isShowHomepage;
    }

    changeShowCarousel() {
        this.isShowCarousel = !this.isShowCarousel;
    }

    getAllProducts(event: any) {
        if (event) {
            this.allProductPage = event;
        }
        this._isSpinning = true;
        this.productService.getAllWithPagination(this.allProductPage, this.allProductLimit, this.offerProductIds, this.allProductNameSearch, this.allProductCodeSearch, this.allShopOwnerSearch, this.allBrandSearch, this.allCategorySearch, this.allSubCategorySearch, 2)
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
        /*console.log("selectd products; ", this.selectedAllProductIds);*/
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
        /*console.log(this.selectedAllProductIds);*/
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

    getRelatedOfferIndividualProducts(event?: any) {
        if (event) {
            this.allProductPage = event;
        }
        this._isSpinning = true;
        this.offerService.getRelatedOfferIndividualProducts(this.id, this.allProductPage, this.allProductLimit)
            .subscribe(result => {
                this.offeredIndividualProducts = result.data;
                this.totalOfferedIndividualProducts = result.total;
                this._isSpinning = false;
            }, err => {
                this._isSpinning = false;
            })
    }

    showOfferModal() {
        this.isVisible = true;
        this.getRelatedOfferProducts(1);
    }

    showIndividualOfferedModal() {
        this.isIndividualOfferedVisible = true;
        this.getRelatedOfferIndividualProducts(1);
    }

    handleOfferCancel(): void {
        this.isVisible = false;
    }

    handleProductCancel(): void {
        this.isProductModal = false;
    }

    handleIndividualProductModal() {
        this.isIndividualProductModal = false;
        this.isIndividualOfferedVisible = false;
    }

    handleIndividualOfferedProductCancel(): void {
        this.isIndividualOfferedVisible = false;
    }

    handleCancelUpload(): void {
        this.isUpload = false;
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

    removeIndividualProductFromOffer(productId) {
        this.offerService.removeIndividualProductFromOffer(productId, this.id)
            .subscribe(res => {
                this._notification.create(
                    "success",
                    "Removed",
                    'Individual Product removed successfully'
                );
                this.getRelatedOfferIndividualProducts(this.allProductPage);
            }, err => {
                this._notification.create(
                    "error",
                    "failed",
                    'Failed to remove Individual product'
                );
            })
    }

    showProductModal() {
        this.isProductModal = true;
        this.getAllProducts(1);
    }

    showIndividualProductModal() {
        this.isIndividualProductModal = true;
        this.getAllProducts(1);
    }

    /**Method called when selection type is changed from the front end*/
    onSelectionTypeSelect(offerSelectionType) {
        this.offerSelectionType = offerSelectionType;
        if (offerSelectionType && offerSelectionType !== 'Product wise' && offerSelectionType !== 'individual_product') {
            this.getAllOptions(offerSelectionType);
        }
    }

    /** method called to show the available options according to the selection in the offer selection type dropdown */
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
                        this.finalSelectionType(false, false, false, true, false, false, subCatId);
                        this.subSubCategoryIDS = result.data;
                    })
            }

        }
    }

    /**Method call when we selection a offer selection type, it does not allow to store previously selected selection type
     it only keeps the finally selected selection type data*/
    finalSelectionType(vendorId, brandId, categoryId, subCategoryId, selectedProductIds, selectedIndividualProductIds, event) {
        if (event) {
            if (vendorId) {
                this.vendorId = event;
                this.brandId = null;
                this.categoryId = null;
                this.subCategoryId = null;
                this.subSubCategoryId = null;
                this.selectedProductIds = null;
                this.selectedIndividualProductIds = null;
            } else if (brandId) {
                this.vendorId = null;
                this.brandId = event;
                this.categoryId = null;
                this.subCategoryId = null;
                this.subSubCategoryId = null;
                this.selectedProductIds = null;
                this.selectedIndividualProductIds = null;
            } else if (categoryId) {
                this.vendorId = null;
                this.brandId = null;
                if (this.categoryId !== event) {
                    this.subCategoryId = null;
                    this.subSubCategoryId = null;
                }
                this.categoryId = event;
                this.selectedProductIds = null;
                this.selectedIndividualProductIds = null;
                this.getAllOptions('', event, '')
            } else if (subCategoryId) {
                this.vendorId = null;
                this.brandId = null;
                if (this.subCategoryId !== event) {
                    this.subSubCategoryId = null;
                }
                this.subCategoryId = event;
                this.selectedProductIds = null;
                this.selectedIndividualProductIds = null;
            } else if (selectedProductIds) {
                this.vendorId = null;
                this.brandId = null;
                this.categoryId = null;
                this.subCategoryId = null;
                this.subSubCategoryId = null;
                this.selectedIndividualProductIds = null;
            } else if (selectedIndividualProductIds) {
                this.vendorId = null;
                this.brandId = null;
                this.categoryId = null;
                this.subCategoryId = null;
                this.subSubCategoryId = null;
                this.selectedProductIds = null;
            }
        }
    }

    addIndividualProduct = ($event, value, productId, code, name) => {
        this.submitting = true;
        $event.preventDefault();
        for (const key in this.individualProductFrom.controls) {
            this.individualProductFrom.controls[key].markAsDirty();
        }

        if (value.Calculation_type === undefined || value.Calculation_type === null || value.discount_amount === null || value.discount_amount === '') {
            this._notification.error('Sorry!!', 'Please input proper data');
            this.submitting = false;
            return;
        }


        let exists: Boolean = false;
        if (this.individuallySelectedProductsId) {
            this.individuallySelectedProductsId.forEach(id => {
                if (productId === id) {
                    this._notification.error('Exists', 'Product already added');
                    this.submitting = false;
                    exists = true
                    return;
                }
            })
        }

        if (exists === false) {
            this.individuallySelectedProductsId.push(productId);
            this.individuallySelectedProductsCalculation.push(value.Calculation_type);
            this.individuallySelectedProductsAmount.push(value.discount_amount);

            /** keeping data in an array to show the selected products and to remove a product if i want */
            this.individuallySelectedData = this.individuallySelectedData.concat([{
                id: productId,
                code: code,
                name: name,
                calculation_type: value.Calculation_type,
                discount_amount: value.discount_amount
            }]);

            /*console.log('individuallySelectedData: ', this.individuallySelectedData)*/
            ;

            this._notification.success('Added', 'Product added successfully');
        }

        this.individualProductFrom.reset();
        this.submitting = false;

    }

    removeIndividualProduct(productId) {
        let index = this.individuallySelectedProductsId.indexOf(productId);
        this.individuallySelectedProductsId.splice(index, 1);
        this.individuallySelectedProductsCalculation.splice(index, 1);
        this.individuallySelectedProductsAmount.splice(index, 1);

        this.individuallySelectedData = this.individuallySelectedData.filter(obj => productId != obj.id);
        this._notification.warning('Removed!', 'Individual Product removed successfully');
    }

    /** Event Method for generating the excel file with the offered products for this offer */
    generateExcel() {
        return this.offerService.generateOfferedExcel(this.id).subscribe((result: any) => {
            // It is necessary to create a new blob object with mime-type explicitly set
            // otherwise only Chrome works like it should
            const newBlob = new Blob([result], {type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"});

            // IE doesn't allow using a blob object directly as link href
            // instead it is necessary to use msSaveOrOpenBlob
            if (window.navigator && window.navigator.msSaveOrOpenBlob) {
                window.navigator.msSaveOrOpenBlob(newBlob);
                return;
            }

            // For other browsers:
            // Create a link pointing to the ObjectURL containing the blob.
            const data = window.URL.createObjectURL(newBlob);

            const link = document.createElement('a');
            link.href = data;
            link.download = "Offered Products " + Date.now() + ".xlsx";

            // this is necessary as link.click() does not work on the latest firefox
            link.dispatchEvent(new MouseEvent('click', {bubbles: true, cancelable: true, view: window}));

            setTimeout(() => {
                // For Firefox it is necessary to delay revoking the ObjectURL
                window.URL.revokeObjectURL(data)
                this.isLoading = false
                link.remove();
            }, 100);
        });
    }

    onCSVUpload(event: any) {
        const target: DataTransfer = <DataTransfer>(event.target);
        if (target.files.length !== 1) throw new Error('Cannot use multiple files');

        const reader: FileReader = new FileReader();
        reader.onload = (e: any) => {
            const fileResult: string = e.target.result;
            const data = <any[]>this.excelService.importFromFile(fileResult);

            const offerObj = new OfferBulk();

            const header: string[] = Object.getOwnPropertyNames(offerObj);

            this.importedProducts = data.slice(1);

            this.total = this.importedProducts.length;

            this.individuallySelectedCodes = this.importedProducts.map(codes => codes[0]);
            this.individuallySelectedProductsCalculation = this.importedProducts.map(calculation => calculation[1]);
            this.individuallySelectedProductsAmount = this.importedProducts.map(discountAmount => discountAmount[2]);

            this.offerService.checkIndividualProductsCodesValidity(this.individuallySelectedCodes)
                .subscribe(result => {
                    this.wrongCodes = result.data;

                    if (this.wrongCodes && this.wrongCodes.length > 0) {
                        this.individuallySelectedCodes = [];
                        this.individuallySelectedProductsCalculation = [];
                        this.individuallySelectedProductsAmount = [];
                        this.continue = false;
                        this._notification.error('Failed!', 'Please Input Proper Data');
                    } else {
                        this.continue = true;
                    }
                })
        };
        reader.readAsBinaryString(target.files[0]);
    }

    showCSVModal(event) {
        if (event === 'csv') {
            this.isUpload = true;
        }
    }

    doneUploadingCSV() {
        this.isUpload = false;
    }

    changeSslCommerzActivation() {
        this.isActiveSslCommerz = !this.isActiveSslCommerz;
    }
    changeBkashActivation() {
        this.isActiveBkash = !this.isActiveBkash;
    }
    changeOfflineActivation() {
        this.isActiveOffline = !this.isActiveOffline;
    }
    changeCashOnDeliveryActivation() {
        this.isActiveCashOnDelivery = !this.isActiveCashOnDelivery;
    }

}
