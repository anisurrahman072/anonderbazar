import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {
    FormBuilder,
    FormGroup,
    Validators
} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {Subscription} from 'rxjs';
import {
    NzNotificationService
} from 'ng-zorro-antd';
import {FileHolder, UploadMetadata} from 'angular2-image-upload';
import {ProductService} from '../../../../services/product.service';
import {CategoryTypeService} from '../../../../services/category-type.service';
import {CategoryProductService} from '../../../../services/category-product.service';
import {BrandService} from '../../../../services/brand.service';
import {UserService} from '../../../../services/user.service';
import {AuthService} from '../../../../services/auth.service';
import {UniqueProductCodeValidator} from "../../../../services/validator/UniqueProductCodeValidator";
import {environment} from "../../../../../environments/environment";

@Component({
    selector: 'app-product-edit',
    templateUrl: './product-edit.component.html',
    styleUrls: ['./product-edit.component.css']
})
export class ProductEditComponent implements OnInit, OnDestroy {

    @ViewChild('Image') Image;
    sub: Subscription;

    tagOptions: any = [];
    validateForm: FormGroup;
    validateFormCouponBanner: FormGroup;
    ImageFileEdit: any[] = [];
    ImageEditFile: any = [];
    ImageFrontEdit: any[] = [];
    ImageEditFront: any[] = [];
    ImageBlukArray: any = [];

    ImageBannerFilesShow: any[] = [];
    ImageBannerFiles: any[] = [];

    IMAGE_ENDPOINT = environment.IMAGE_ENDPOINT;

    couponProductModalVisible: boolean = false;
    isSubmit: boolean = true;

    /*
    ckConfig = {
        uiColor: '#662d91',
        toolbarGroups: [
          { name: 'document', groups: ['mode', 'document', 'doctools'] },
          {
            name: 'editing',
            groups: ['find', 'selection', 'spellchecker', 'editing']
          },
          { name: 'forms', groups: ['forms'] }
        ],
        removeButtons: 'Source,Save,Templates,Find,Replace,Scayt,SelectAll'
      };
   */
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

    categorySearchOptions: any;
    brandSearchOptions: any;
    subcategorySearchOptions: any = {};
    typeSearchOptions: any;
    product_details: any;
    warehouse_name: string;
    tag: any;
    tags = [];
    inputVisible = false;
    inputValue = '';
    statusOptions = [
        {label: 'Inactive Product', value: 0},
        {label: 'Fixed Product', value: 1},
        {label: 'Variable Product', value: 2},
    ];

    isCouponProductEnabled: boolean = false;

    id: number;
    data: any;
    category_id: any;
    brand_id: any;
    subcategory_id: any;
    type_id: any;
    status: any;
    currentUser: any;
    queryStatus: any;

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private _notification: NzNotificationService,
        private fb: FormBuilder,
        private userService: UserService,
        private brandService: BrandService,
        private authService: AuthService,
        private categoryTypeService: CategoryTypeService,
        private categoryProductService: CategoryProductService,
        private productService: ProductService,
        private uniqueProductCodeValidator: UniqueProductCodeValidator
    ) {

    }

    // For initiating the section element with data
    ngOnInit() {
        this.validateForm = this.fb.group({
            name: ['', [Validators.required]],
            code: ['', [Validators.required], [this.uniqueProductCodeValidator]],
            image: [null, []],
            frontimage: [null, []],
            price: ['', []],
            vendor_price: ['', []],
            min_unit: [0, [Validators.required]],
            alert_quantity: [0, []],
            category_id: ['', [Validators.required]],
            brand_id: ['', []],
            frontend_position: ['', []],
            subcategory_id: ['', []],
            quantity: ['', [Validators.required]],
            product_details: ['', [Validators.required]],
            type_id: ['', []],
            tag: ['', []],
            featured: [false, []],
            is_coupon_product: [false, []],
            weight: ['', []],
            status: ['', [Validators.required]]
        });

        this.validateFormCouponBanner = this.fb.group({});

        this.currentUser = this.authService.getCurrentUser();
        this.ImageEditFile = [];
        this.ImageBlukArray = [];
        this.route.queryParams.filter(params => params.status).subscribe(params => {
            this.queryStatus = params.status;
        });
        this.sub = this.route.params.subscribe(params => {
            this.id = +params['id']; // (+) converts string 'id' to a number
            this.productService.getById(this.id).subscribe(result => {
                console.log('product', result);
                if (result.warehouse_id) {
                    this.warehouse_name = result.warehouse_id.name;
                } else {
                    this.warehouse_name = 'N/F';
                }

                this.data = result;

                this.uniqueProductCodeValidator.setExcludeId(this.data.id);
                this.validateForm.patchValue(this.data);
                if (this.data && this.data.brand_id) {
                    this.brand_id = this.data.brand_id;
                }

                if (this.data && this.data.category_id) {
                    this.category_id = this.data.category_id;
                }

                this.isCouponProductEnabled = !!this.data.is_coupon_product;

                if (this.data && this.data.subcategory_id) {
                    this.subcategory_id = this.data.subcategory_id;
                }

                if (this.data && this.data.type_id && this.data.type_id) {
                    this.type_id = this.data.type_id;
                }

                if (this.data && this.data.product_details) {
                    this.product_details = this.data.product_details;
                }

                if (this.data && this.data.image) {
                    this.ImageFrontEdit.push(this.IMAGE_ENDPOINT + this.data.image);
                }

                if (this.data && this.data.product_images) {
                    for (let i = 0; i < this.data.product_images.length; i++) {
                        // show frontend
                        this.ImageFileEdit.push(this.IMAGE_ENDPOINT + this.data.product_images[i].image_path);

                        // compare to upload or remove
                        let file = {name: ""};
                        file.name = this.IMAGE_ENDPOINT + this.data.product_images[i].image_path;

                        this.ImageEditFile.push(file);
                        this.ImageBlukArray.push(this.data.product_images[i]);
                        this.ImageBlukArray[i].image_path = this.IMAGE_ENDPOINT + this.data.product_images[i].image_path;
                    }
                }

                if (this.data && this.data.coupon_banner_image) {
                    if (this.data.coupon_banner_image.banner_images && Array.isArray(this.data.coupon_banner_image.banner_images) &&
                        this.data.coupon_banner_image.banner_images.length > 0) {
                        for (let j = 0; j < this.data.coupon_banner_image.banner_images.length; j++) {
                            this.ImageBannerFiles.push({
                                name: this.IMAGE_ENDPOINT + this.data.coupon_banner_image.banner_images[j]
                            });
                            this.ImageBannerFilesShow.push(this.IMAGE_ENDPOINT + this.data.coupon_banner_image.banner_images[j]);
                        }
                    }
                }

                if (this.ImageBannerFilesShow.length > 0) {
                    this.ImageBannerFilesShow = [...this.ImageBannerFilesShow];
                }

                console.log('this.ImageBannerFilesShow', this.ImageBannerFilesShow);

                if (this.data.tag != "undefined") {
                    this.tagOptions = JSON.parse(this.data.tag);
                }

                if (this.data.tag != "undefined") {
                    this.tag = JSON.parse(this.data.tag);
                }

            }, (error) => {
                this._notification.error('Product could not be retrieved', 'Product could not be retrieved');
            });
        });

        this.categoryProductService.getAllCategory().subscribe(result => {
            this.typeSearchOptions = result;
        });
        this.brandService.getAll().subscribe((result: any) => {
            this.brandSearchOptions = result;
        });
    }

    // Event method for submitting the form
    submitForm = ($event, value) => {
        $event.preventDefault();
        for (const key in this.validateForm.controls) {
            this.validateForm.controls[key].markAsDirty();
        }

        if(this.validateForm.invalid){
            return false;
        }

        const formData: FormData = new FormData();
        formData.append('name', value.name);
        formData.append('code', value.code);
        formData.append('min_unit', value.min_unit);
        formData.append('price', value.price);
        formData.append('vendor_price', value.vendor_price);
        formData.append('alert_quantity', value.alert_quantity || '0');
        formData.append('category_id', value.category_id);
        formData.append('quantity', value.quantity);
        formData.append('product_details', value.product_details);
        formData.append('type_id', value.type_id);
        formData.append('brand_id', value.brand_id);
        formData.append('tag', JSON.stringify(value.tag));
        formData.append('featured', value.featured ? '1' : '0');
        formData.append('is_coupon_product', value.is_coupon_product ? '1' : '0');
        formData.append('weight', value.weight);
        formData.append('status', value.status);
        formData.append('frontend_position', value.frontend_position);

        if (value.subcategory_id) {
            formData.append('subcategory_id', value.subcategory_id);
        }
        if (this.currentUser.group_id === 'owner') {
            formData.append('warehouse_id', this.currentUser.warehouse.id);
        }

        try {
            if (this.ImageEditFront.length > 0) {
                formData.append('hasImageFront', 'true');
                formData.append('frontimage', this.ImageEditFront[0], this.ImageEditFront[0].name);
            } else {
                formData.append('hasImageFront', 'false');
            }
        } catch (e) {
            formData.append('hasImage', 'false');
            formData.append('hasImageFront', 'false');
        }

        this.isSubmit = false;
        this.productService.update(this.id, formData).subscribe(result => {
            this.isSubmit = true;
            if (result) {
                this._notification.create(
                    'success',
                    'Update successful',
                    this.data.name
                );
                this.router.navigate(['/dashboard/product/details/', this.id], {queryParams: {status: this.queryStatus}});
            }
        }, error => {
            this.isSubmit = true;
            this._notification.create(
                'error',
                'Problem in updating the product',
                this.data.name
            );
        });
    };
    //Event method for submitting the form
    submitFormCouponBanner = ($event, value) => {
        const formData: FormData = new FormData();
        if (this.validateFormCouponBanner.invalid) {
            return false;
        }
        formData.append('product_id', this.id.toString());

        this.ImageBannerFiles.forEach((file, index) => {
            if (file.constructor.name === 'File') {
                formData.append('images', file, file.name);
            } else {
                const fileName = file.name.replace(environment.IMAGE_ENDPOINT, '');
                formData.append('existingFiles', fileName);
            }
        });

        this.productService.uploadCouponBanners(formData).subscribe(result => {
            console.log('submit banners', result);
            this._notification.create(
                'success',
                'Banner Image updated successfully',
                ''
            );
        }, err => {
            this._notification.create(
                'error',
                'Failed to update banner images',
                ''
            );
            console.log('err', err);
        });
    }

    // Event method for removing front picture
    onRemovedFront(_file: FileHolder) {
        this.ImageEditFront.splice(
            this.ImageEditFront.findIndex(e => e.name === _file.file.name),
            1
        );
    }

    // Event method for removing picture
    onRemoved(_file: FileHolder) {
        ///new uploaded
        var index = this.ImageEditFile.findIndex((element) => {
            return (element.name === _file.file.name);
        });
        const formData: FormData = new FormData();
        formData.append('id', this.ImageBlukArray[index].id);

        this.ImageEditFile.splice(index, 1);
        this.ImageBlukArray.splice(index, 1);

        this.productService.upload(formData).subscribe(result => {
        });
    }

    // Event method for removing picture
    onRemovedBanners(_file: FileHolder) {
        console.log('_file', _file);
        this.ImageBannerFiles.splice(
            this.ImageBannerFiles.findIndex(e => e.name === _file.file.name),
            1
        );
    }

    // Event method for storing imgae in variable
    onBeforeUpload = (metadata: UploadMetadata) => {
        ///new uploaded
        const formData: FormData = new FormData();
        formData.append('product_id', this.id.toString());
        formData.append('hasImage', 'true');
        formData.append('image', metadata.file, metadata.file.name);

        this.productService.upload(formData).subscribe(result => {
            this.ImageBlukArray.push(result);
        });
        this.ImageEditFile.push(metadata.file);

        return metadata;
    };

    // Event method for storing front imgae in variable
    onBeforeUploadFront = (metadata: UploadMetadata) => {
        this.ImageEditFront.push(metadata.file);
        return metadata;
    }

    // Event method for storing imgae in variable
    onBeforeBannerUpload = (metadata: UploadMetadata) => {
        console.log('metadata.file', metadata.file.constructor.name);
        this.ImageBannerFiles.push(metadata.file);
        return metadata;
    };

    // Event method for resetting the form
    resetForm($event: MouseEvent) {
        $event.preventDefault();
        this.validateForm.reset();
        for (const key in this.validateForm.controls) {
            this.validateForm.controls[key].markAsPristine();
        }
    }

    // Event method for setting up form in validation
    getFormControl(name) {
        return this.validateForm.controls[name];
    }

    ngOnDestroy(): void {
        this.sub ? this.sub.unsubscribe() : '';
    }

    // Method called on product type change
    onTypeChange($event) {

        const query = encodeURI($event);
        console.log('onTypeChange', $event);
        this.categorySearchOptions = [];
        if (query !== 'null') {
            this.categoryProductService
                .getSubcategoryByCategoryId(query)
                .subscribe(result => {
                    this.categorySearchOptions = result;
                });
        } else {
            this.categorySearchOptions = {};
        }
    }

    // Method called on category change
    categoryChange($event) {
        const query = encodeURI($event);
        console.log('categoryChange', $event);
        this.subcategorySearchOptions = {};
        this.subcategory_id = null;
        if (query !== 'null') {
            this.categoryProductService
                .getSubcategoryByCategoryId(query)
                .subscribe(result => {
                    this.subcategorySearchOptions = result;
                    if (
                        this.data &&
                        this.data.subcategory_id
                    ) {
                        this.subcategory_id = this.data.subcategory_id;
                    }
                });
        } else {
            this.subcategorySearchOptions = {};
        }
    }


    handleCancelModal($event) {
        this.couponProductModalVisible = false;
    }

    handleOkModal($event) {
        this.couponProductModalVisible = false;
    }

    onChangeCouponProduct($event) {
        this.isCouponProductEnabled = $event;
        if ($event) {
            this.couponProductModalVisible = true;
        }
    }
}
