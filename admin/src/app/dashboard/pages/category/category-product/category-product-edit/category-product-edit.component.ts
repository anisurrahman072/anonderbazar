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
    id: number;
    data: any;
    sub: Subscription;
    categorySearchOptions = [];
    offers: any = [];
    IMAGE_ENDPOINT = environment.IMAGE_ENDPOINT;
    oldImages = [];
    validateForm: FormGroup;
    ImageFile: File[] = [];
    @ViewChild('Image') Image;

    constructor(
        private router: Router,
        private cmsService: CmsService,
        private route: ActivatedRoute,
        private _notification: NzNotificationService,
        private fb: FormBuilder,
        private categoryProductService: CategoryProductService) {
        this.validateForm = this.fb.group({
            name: ['', [Validators.required]],
            parent_id: [null, []],
            offer_id: [null, []],
            code: ['', [Validators.required]],
            image: [null, []],
        });
    }

    //Event method for submitting the form
    submitForm = ($event, value) => {
        $event.preventDefault();
        for (const key in this.validateForm.controls) {
            this.validateForm.controls[key].markAsDirty();
        }
        const formData: FormData = new FormData();
        formData.append('name', value.name);
        formData.append('code', value.code);
        if(value.parent_id === 'true')
            formData.append('parent_id', value.parent_id);
        if(value.offer_id === 'true')
            formData.append('offer_id', value.offer_id);
        if (this.ImageFile.length.toString() != "0") {
            formData.append('hasImage', 'true');
            formData.append('imageCounter', this.ImageFile.length.toString());

            for (let i = 0; i < this.ImageFile.length; i++) {
                formData.append('image' + i, this.ImageFile[i], this.ImageFile[i].name);
            }
        } else {
            formData.append('hasImage', 'false');
        }
        this.categoryProductService.update(this.id, formData)
            .subscribe(result => {
                this._notification.create('success', 'Update successful for ', this.data.name);
                this.router.navigate(['/dashboard/category/product/details/', this.id]);
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


    // init the component
    ngOnInit() {

        this.sub = this.route.params.subscribe((params: any) => {
            this.id = +params['id'];
            this.categoryProductService.getById(this.id)
                .subscribe((result: any) => {
                    this.data = result;
                    this.oldImages = [];
                    this.validateForm.patchValue(this.data);
                    if (this.data && this.data.image) {
                        this.oldImages.push(this.IMAGE_ENDPOINT + this.data.image);
                    }
                });
        });
        this.cmsService
            .getAllSearch({page: 'POST', section: 'HOME', subsection: 'OFFER'})
            .subscribe(result => {
                this.offers = result;
            });
    }

    ngOnDestroy(): void {
        this.sub ? this.sub.unsubscribe() : '';

    }

    //Event method for removing picture
    onRemoved(_file: FileHolder) {
        this.ImageFile.splice(
            this.ImageFile.findIndex(e => e.name === _file.file.name),
            1
        );
    }

    //Event method for storing imgae in variable
    onBeforeUpload = (metadata: UploadMetadata) => {
        this.ImageFile.push(metadata.file);
        return metadata;
    };
}
