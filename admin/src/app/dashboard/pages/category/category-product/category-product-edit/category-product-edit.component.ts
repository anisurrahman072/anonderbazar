import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {Subscription} from 'rxjs';
import {CategoryProductService} from '../../../../../services/category-product.service';
import {FileHolder, UploadMetadata} from 'angular2-image-upload';
import {environment} from "../../../../../../environments/environment";
import {CmsService} from '../../../../../services/cms.service';
import {NzNotificationService} from "ng-zorro-antd";

@Component({
    selector: 'app-category-product-edit',
    templateUrl: './category-product-edit.component.html',
    styleUrls: ['./category-product-edit.component.css']
})
export class CategoryProductEditComponent implements OnInit, OnDestroy {
    @ViewChild('Image') Image;
    id: number;
    data: any;
    sub: Subscription;
    categorySearchOptions = [];
    offers: any = [];
    IMAGE_ENDPOINT = environment.IMAGE_ENDPOINT;
    oldImages = [];
    existingBannerImage = [];
    existingMobileImage = [];
    validateForm: FormGroup;
    ImageFile: File;
    ImageFileForMobile: File;
    BannerImageFile: File;

    isLoading: boolean = true;

    constructor(
        private router: Router,
        private cmsService: CmsService,
        private route: ActivatedRoute,
        private _notification: NzNotificationService,
        private fb: FormBuilder,
        private categoryProductService: CategoryProductService) {

    }

    // init the component
    ngOnInit() {
        this.validateForm = this.fb.group({
            name: ['', [Validators.required]],
            parent_id: [null, []],
            offer_id: [null, []],
            code: ['', [Validators.required]],
            image: [null, []],
            mobile_image: [null, []],
            banner_image: [null, []],
        });

        this.sub = this.route.params.subscribe((params: any) => {
            this.id = +params['id'];
            this.isLoading = true;
            this.categoryProductService.getById(this.id)
                .subscribe((result: any) => {
                    this.data = result;
                    this.validateForm.patchValue(this.data);

                    this.oldImages = [];
                    if (this.data && this.data.image) {
                        this.oldImages.push(this.IMAGE_ENDPOINT + this.data.image);
                    }

                    this.existingMobileImage = [];
                    if (this.data && this.data.mobile_image) {
                        this.existingMobileImage.push(this.IMAGE_ENDPOINT + this.data.mobile_image);
                    }

                    this.existingBannerImage = [];
                    if (this.data && this.data.banner_image) {
                        this.existingBannerImage.push(this.IMAGE_ENDPOINT + this.data.banner_image);
                    }

                    this.isLoading = false;
                }, (err) => {
                    this.isLoading = false;
                });
        });

        this.cmsService
            .getAllSearch({page: 'POST', section: 'HOME', subsection: 'OFFER'})
            .subscribe(result => {
                this.offers = result;
                this.isLoading = false;
            }, (err) => {
                this.isLoading = false;
            });
    }

    //Event method for submitting the form
    submitForm = ($event, value) => {
        $event.preventDefault();
        for (const key in this.validateForm.controls) {
            this.validateForm.controls[key].markAsDirty();
        }
        const formData: FormData = new FormData();

        if (this.ImageFile) {
            formData.append('hasImage', 'true');
            formData.append('image', this.ImageFile, this.ImageFile.name);
        }

        if (this.ImageFileForMobile) {
            formData.append('hasMobileImage', 'true');
            formData.append('image', this.ImageFileForMobile, this.ImageFileForMobile.name);
        }

        if (this.BannerImageFile) {
            formData.append('hasBannerImage', 'true');
            formData.append('image', this.BannerImageFile, this.BannerImageFile.name);
        }

        formData.append('name', value.name);
        formData.append('code', value.code);

        if (value.parent_id === 'true') {
            formData.append('parent_id', value.parent_id);
        }

        if (value.offer_id === 'true') {
            formData.append('offer_id', value.offer_id);
        }

        this.isLoading = true;
        this.categoryProductService.update(this.id, formData)
            .subscribe((result) => {
                console.log('result', result);
                this.isLoading = false;
                this._notification.create('success', 'Update successful for ', this.data.name);
                this.router.navigate(['/dashboard/category/product/details/', this.id]);
            }, (err) => {
                this._notification.create('error', 'Update failed for ', this.data.name);
                this.isLoading = false;
            });
    }

    //Event method for resetting the form
    resetForm($event: MouseEvent) {
        $event.preventDefault();
        this.validateForm.reset();
        for (const key in this.validateForm.controls) {
            this.validateForm.controls[key].markAsPristine();
        }
    }

    //Event method for setting up form in validation
    getFormControl(name) {
        return this.validateForm.controls[name];
    }

    ngOnDestroy(): void {
        this.sub ? this.sub.unsubscribe() : '';
    }

    //Event method for removing picture
    onRemoved(_file: FileHolder) {
        if (this.data && this.data.image) {
            this.isLoading = true;
            this.categoryProductService.removeImages(this.id, 'image')
                .subscribe((res) => {
                    this.isLoading = false;
                }, (err) => {
                    console.log(err);
                    this.isLoading = false;
                    this._notification.create('error', 'Failed to remove the image', this.data.name);

                });
        }
        this.ImageFile = null;

    }

    onRemovedMobile(_file: FileHolder) {
        if (this.data && this.data.mobile_image) {
            this.isLoading = true;
            this.categoryProductService.removeImages(this.id, 'mobile_image')
                .subscribe((res) => {
                    this.isLoading = false;
                }, (err) => {
                    console.log(err);
                    this.isLoading = false;
                    this._notification.create('error', 'Failed to remove the image', this.data.name);

                });
        }
        this.ImageFileForMobile = null;

    }

    //Event method for storing imgae in variable
    onBeforeUpload = (metadata: UploadMetadata) => {
        this.ImageFile = metadata.file;
        return metadata;
    };
    onBeforeUploadMobile = (metadata: UploadMetadata) => {
        this.ImageFileForMobile = metadata.file;
        return metadata;
    };

    //Event method for removing picture
    onRemovedBanner(_file: FileHolder) {
        if (this.data && this.data.banner_image) {
            this.isLoading = true;
            this.categoryProductService.removeImages(this.id, 'banner_image')
                .subscribe((res) => {
                    this.isLoading = false;
                }, (err) => {
                    console.log(err);
                    this.isLoading = false;
                    this._notification.create('error', 'Failed to remove the image', this.data.name);
                })
        }

        this.BannerImageFile = null;
    }

    //Event method for storing imgae in variable
    onBeforeUploadBanner = (metadata: UploadMetadata) => {
        this.BannerImageFile = metadata.file;
        return metadata;
    };
}
