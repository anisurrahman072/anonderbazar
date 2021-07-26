import {Component, OnInit, ViewChild} from '@angular/core';
import {
    FormBuilder,
    FormGroup,
    Validators
} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {concatMap} from 'rxjs/operators';
import {CategoryProductService} from '../../../../../services/category-product.service';
import {UploadMetadata, FileHolder} from 'angular2-image-upload';
import {CmsService} from '../../../../../services/cms.service';
import {NzNotificationService} from "ng-zorro-antd";

@Component({
    selector: 'app-category-product-create',
    templateUrl: './category-product-create.component.html',
    styleUrls: ['./category-product-create.component.css']
})
export class CategoryProductCreateComponent implements OnInit {
    @ViewChild('Image') Image;
    validateForm: FormGroup;
    offers: any = [];
    parentCheck = true;
    ImageFile: File;
    ImageFileForMobile: File;
    BannerImageFile: File;
    categorySearchOptions = [];
    subCategorySearchOptions = [];

    isLoading: boolean = true;
    showInNav;

    constructor(
        private router: Router,
        private cmsService: CmsService,
        private route: ActivatedRoute,
        private _notification: NzNotificationService,
        private fb: FormBuilder,
        private categoryProductService: CategoryProductService
    ) {

    }

    // init the component
    ngOnInit() {
        this.validateForm = this.fb.group({
            name: ['', [Validators.required]],
            parent: ['', []],
            offer_id: ['', []],
            sub_parent: ['', []],
            code: ['', [Validators.required]],
            image: [null, []],
            mobile_image: [null, []],
            banner_image: [null, []],
            showInNav: ['', []],
        });
        this.categoryProductService.getAllCategory()
            .pipe(
                concatMap((result: any) => {
                    // console.log('getAllCategory', result);
                    this.categorySearchOptions = result;
                    return this.cmsService.getAllSearch({page: 'POST', section: 'HOME', subsection: 'OFFER'});
                })
            )
            .subscribe((result: any) => {
                // console.log('getAllSearch', result);
                this.offers = result.data;
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

        if (value.offer_id) {
            formData.append('offer_id', value.offer_id);
        }

        formData.append('showInNav', this.showInNav);

        if (this.ImageFile) {
            formData.append('hasImage', 'true');
            formData.append('image', this.ImageFile, this.ImageFile.name);
        }

        if(this.ImageFileForMobile){
            formData.append('hasMobileImage', 'true');
            formData.append('image', this.BannerImageFile, this.BannerImageFile.name);
        }

        if (this.BannerImageFile) {
            formData.append('hasBannerImage', 'true');
            formData.append('image', this.BannerImageFile, this.BannerImageFile.name);
        }

        formData.append('name', value.name);
        formData.append('code', value.code);

        let parent_id = 0;
        if (value.sub_parent) {
            parent_id = value.sub_parent.id;
        } else if (value.parent) {
            parent_id = value.parent.id;
        }
        formData.append('parent_id', '' + parent_id);

        formData.append('type_id', '2');

        this.isLoading = true;
        this.categoryProductService.insert(formData)
            .subscribe((result: any) => {
                this.isLoading = false;
                if (result && result.id) {
                    this._notification.create('success', 'Product category ', result.name);
                    this.router.navigate(['/dashboard/category/product/details/', result.id]);
                } else {
                    this._notification.error('Error', 'Problem in Creating Category');
                }
            }, (err) => {
                this._notification.error('Error', 'Problem in Creating Category');
                this.isLoading = false;
            });
    }

    //Event method for removing picture
    onRemoved(_file: FileHolder) {
        this.ImageFile = null;
    }

    onRemovedMobile(_file: FileHolder) {
        this.ImageFileForMobile = null;
    }

    //Event method for removing picture
    onRemovedBanner(_file: FileHolder) {
        this.BannerImageFile = null;
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
    //Event method for storing imgae in variable
    onBeforeUploadBanner = (metadata: UploadMetadata) => {
        console.log('onBeforeUploadBanner', metadata);
        this.BannerImageFile = metadata.file;
        return metadata;
    };

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

    //Event method on category change
    onCategoryChange(categoryId) {
        this.parentCheck = false;
        this.categoryProductService.getSubcategoryByCategoryId(categoryId.id).subscribe((result: any) => {
            this.subCategorySearchOptions = result;
        });
    }

    changeShowInNav() {
        this.showInNav = !this.showInNav;
    }
}
