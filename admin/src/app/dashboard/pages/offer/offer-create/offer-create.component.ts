import {Component, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {FileHolder, UploadMetadata} from 'angular2-image-upload';
import {NzNotificationService} from 'ng-zorro-antd';
import {environment} from "../../../../../environments/environment";
import {ProductService} from "../../../../services/product.service";
import * as ___ from 'lodash';
import {OfferService} from "../../../../services/offer.service";
import moment from "moment";
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';

@Component({
    selector: 'app-offer-create',
    templateUrl: './offer-create.component.html',
    styleUrls: ['./offer-create.component.css']
})
export class OfferCreateComponent implements OnInit {
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

    validateForm: FormGroup;
    individualProductFrom: FormGroup;
    ImageFile: File;
    BannerImageFile: File;
    smallOfferImage: File;
    @ViewChild('Image')
    Image: any;
    IMAGE_ENDPOINT = environment.IMAGE_ENDPOINT;
    /*ckConfig = {
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
    };*/
    _isSpinning: any = false;
    submitting: boolean = false;

    isShowHomepage: boolean = false;

    Calc_type;
    Calculation_type;
    /*variables taken for ngmodel in nz-select*/
    selectionType;
    vendorId;
    brandId;
    categoryId;
    subCategoryId;
    subSubCategoryId;
    isVisible: Boolean = false;
    isIndividualVisible: Boolean = false;
    allProducts: any = [];
    /**variables used for storing subCat and subSubCat options*/
    subcategoryIDS;
    subSubCategoryIDS;

    allProductPage: number = 1;
    allProductLimit: number = 20;
    offerProductIds: any = [];

    allProductNameSearch: string = '';
    allProductCodeSearch: string = '';
    allVendorSearch: string = '';
    allModalVendors;
    allBrandSearch: string = '';
    allModalBrands;
    allCategorySearch: string = '';
    allModalCategories;
    allSubCategorySearch: string = '';
    allModalSubCategories;

    offerSelectionType;
    allOptions;


    allProductTotal = 0;
    selectedProductIds: any;
    selectedIndividualProductIds: any;

    selectedAllProductIds: any = [];
    selectedData;
    allProductSelectAll: any = [false];

    individuallySelectedProductsId: any = [];
    individuallySelectedProductsCalculation: any = [];
    individuallySelectedProductsAmount: any = [];

    individuallySelectedData: any = [];

    constructor(
        private router: Router,
        private _notification: NzNotificationService,
        private fb: FormBuilder,
        private productService: ProductService,
        private offerService: OfferService,
    ) {
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
            discountAmount: ['', []],
            calculationType: ['', []],
            offerStartDate: ['', Validators.required],
            offerEndDate: ['', Validators.required],
            showHome: ['', []],
        });

        this.individualProductFrom = this.fb.group({
            Calculation_type: ['', []],
            discount_amount: ['', []]
        })
    }

    ngOnInit() {
    }

//Event method for submitting the form
    submitForm = ($event, value) => {
        this.submitting = true;
        $event.preventDefault();
        this._isSpinning = true;

        for (const key in this.validateForm.controls) {
            this.validateForm.controls[key].markAsDirty();
        }

        let formData = new FormData();
        let showInHome = this.isShowHomepage ? 'true' : 'false';

        formData.append('title', value.title);
        formData.append('description', value.description);
        formData.append('selection_type', value.selectionType);
        formData.append('showInHome', showInHome);
        formData.append('discountAmount', value.discountAmount);
        formData.append('calculationType', value.calculationType);
        formData.append('offerStartDate', moment(value.offerStartDate).format('YYYY-MM-DD HH:mm:ss'));
        formData.append('offerEndDate', moment(value.offerEndDate).format('YYYY-MM-DD HH:mm:ss'));

        if (this.selectedProductIds) {
            formData.append('selectedProductIds', this.selectedProductIds);
        }

        if (this.individuallySelectedProductsId) {
            formData.append('individuallySelectedProductsId', this.individuallySelectedProductsId);
        }
        if (this.individuallySelectedProductsCalculation) {
            formData.append('individuallySelectedProductsCalculation', this.individuallySelectedProductsCalculation);
        }
        if (this.individuallySelectedProductsAmount) {
            formData.append('individuallySelectedProductsAmount', this.individuallySelectedProductsAmount);
        }

        if (value.vendorId) {
            formData.append('vendor_id', this.vendorId);
        }

        if (value.brandId) {
            formData.append('brand_id', this.brandId);
        }

        if (value.categoryId) {
            formData.append('category_id', this.categoryId);
        }
        if (value.subCategoryId) {
            formData.append('subCategory_Id', this.subCategoryId);
        }
        if (value.subSubCategoryId) {
            formData.append('subSubCategory_Id', this.subSubCategoryId);
        }

        if (value.frontend_position) {
            formData.append('frontend_position', value.frontend_position);
        }
        if (this.ImageFile) {
            formData.append('hasImage', 'true');
            formData.append('image', this.ImageFile, this.ImageFile.name);
        } else {
            this._notification.error('Offer Main Image', 'Offer Main Image is required');
            this._isSpinning = false;
            this.submitting = false;
            return;
            /*formData.append('hasImage', 'false');*/
        }

        if (this.smallOfferImage) {
            formData.append('hasSmallImage', 'true');
            formData.append('image', this.smallOfferImage, this.smallOfferImage.name);
        } else {
            this._notification.error('Offer Image Beside Carousel', 'Offer Image Beside Carousel required');
            this._isSpinning = false;
            this.submitting = false;
            return;
            /*formData.append('hasSmallImage', 'false');*/
        }

        if (this.BannerImageFile) {
            formData.append('hasBannerImage', 'true');
            formData.append('image', this.BannerImageFile, this.BannerImageFile.name);
        } else {
            this._notification.error('Offer Banner Image', 'Banner Image required');
            this._isSpinning = false;
            this.submitting = false;
            return;
            /*formData.append('hasBannerImage', 'false');*/
        }

        this.offerService.offerInsert(formData).subscribe(result => {
            console.log('submit rrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr', result);
            this.submitting = false;
            if (result.code === 'INVALID_SUBSUBCAT') {
                this._notification.error('Sub-sub-Category exists', "Sub-sub-Category already exists in another offer ");
                this._isSpinning = false;
            } else {
                this._notification.success('Offer Added', "Offer Added Successfully");
                this._isSpinning = false;
                this.resetForm(null);
                this.individuallySelectedProductsId = [];
                this.individuallySelectedProductsCalculation = [];
                this.individuallySelectedProductsAmount = [];
                this.router.navigate(['/dashboard/offer']);
            }
        }, error => {
            this.submitting = false;
            this._notification.error('Error Occurred!', "Error occurred while adding offer!");
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

    onUploadStateChanged(state: boolean) {
    }

//Event method for storing image in variable
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
        this.productService.getAllWithPagination(this.allProductPage, this.allProductLimit, this.offerProductIds, this.allProductNameSearch, this.allProductCodeSearch, this.allVendorSearch, this.allBrandSearch, this.allCategorySearch, this.allSubCategorySearch)
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
        if (event === null) {
            event = '';
        }
        this.allVendorSearch = event;
        this.getAllProducts(1);
    }

    allProductBrandChangeHandler(event: any) {
        if (event === null) {
            event = '';
        }
        this.allBrandSearch = event;
        this.getAllProducts(1);
    }

    allProductCategoryChangeHandler(event: any) {
        if (event === null) {
            event = '';
        }
        this.allSubCategorySearch = '';
        this.allModalSubCategories = null;
        this.allCategorySearch = event;
        this.getAllProducts(1);
        this.offerService.getAllOptions('', event, '')
            .subscribe(result => {
                this.allModalSubCategories = result.data;
            })
    }

    allProductSubCategoryChangeHandler(event: any) {
        if (event === null) {
            event = '';
        }
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
        this.isVisible = false;
        this.isIndividualVisible = false;
    }

    showModal(value): void {
        if (value === 'individual') {
            this.isIndividualVisible = true;
        } else {
            this.isVisible = true;
        }

        this.getAllProducts(1);
        this.offerService.getAllOptions('Brand wise', '', '')
            .subscribe(result => {
                this.allModalBrands = result.data;
            })
        this.offerService.getAllOptions('Vendor wise', '', '')
            .subscribe(result => {
                this.allModalVendors = result.data;
            })
        this.offerService.getAllOptions('Category wise', '', '')
            .subscribe(result => {
                this.allModalCategories = result.data;
            })
    }

    handleCancel(): void {
        this.isVisible = false;
        this.isIndividualVisible = false;
    }

    doneAddingIndividualProduct() {
        this.isIndividualVisible = false;
    }

    /**Method called when selection type is changed from the form end*/
    onSelectionTypeSelect(offerSelectionType) {
        this.offerSelectionType = offerSelectionType;
        this.vendorId = null;
        this.brandId = null;
        this.categoryId = null;
        this.subCategoryId = null;
        this.subSubCategoryId = null;
        this.selectedProductIds = null;
        if (offerSelectionType && offerSelectionType !== 'Product wise' && offerSelectionType !== 'individual_product') {
            this.getAllOptions(offerSelectionType, '', '');
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
    finalSelectionType(vendorId, brandId, categoryId, selectedProductIds, selectedIndividualProductIds, event) {
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
                this.categoryId = event;
                this.subCategoryId = null;
                this.subSubCategoryId = null;
                this.selectedProductIds = null;
                this.selectedIndividualProductIds = null;
                this.getAllOptions('', event, '')
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
            this.individuallySelectedProductsId.forEach(product => {
                if (productId === product.id) {
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

            console.log('individuallySelectedData: ', this.individuallySelectedData);

            this._notification.success('Added', 'Product added successfully');
        }

        this.individualProductFrom.reset();
        this.submitting = false;

    }

    removeIndividualProduct(productId) {
        this.individuallySelectedData = this.individuallySelectedData.filter(obj => productId != obj.id);
        this._notification.warning('Removed!', 'Individual Product removed successfully');
    }
}
