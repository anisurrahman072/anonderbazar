import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {
    FormBuilder,
    FormGroup,
    Validators
} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {NzNotificationService} from 'ng-zorro-antd';
import {CategoryProductService} from '../../../../../services/category-product.service';
import {UploadMetadata, FileHolder} from 'angular2-image-upload';
import { CmsService } from '../../../../../services/cms.service';

@Component({
    selector: 'app-category-product-create',
    templateUrl: './category-product-create.component.html',
    styleUrls: ['./category-product-create.component.css']
})
export class CategoryProductCreateComponent implements OnInit {
    validateForm: FormGroup;
    offers: any = [];
    parentCheck = true;
    ImageFile: File[] = [];
    @ViewChild('Image') Image;
    categorySearchOptions = [];
    subCategorySearchOptions = [];
    submitting: boolean = false;


    constructor(private router: Router, private cmsService: CmsService, private route: ActivatedRoute,
                private _notification: NzNotificationService,
                private fb: FormBuilder,
                private categoryProductService: CategoryProductService) {
        this.validateForm = this.fb.group({
            name: ['', [Validators.required]],
            parent: ['', []],
            offer_id: ['', []],
            sub_parent: ['', []],
            code:['', [Validators.required]],
            image: [null, []],
        });
    }
    //Event method for submitting the form
    submitForm = ($event, value) => {
        this.submitting = true;
        $event.preventDefault();
        for (const key in this.validateForm.controls) {
            this.validateForm.controls[key].markAsDirty();
        }

        const formData: FormData = new FormData();
        formData.append('name', value.name);
        formData.append('code', value.code);
        let parent_id = 0;
        if(value.sub_parent){
            parent_id = value.sub_parent.id;
        } else if(value.parent){
            parent_id = value.parent.id;
        }
        formData.append('parent_id', ''+parent_id);

        formData.append('type_id', '2');
        if (value.offer_id) {
            formData.append('offer_id', value.offer_id);
        }
        if (this.ImageFile.length.toString() != "0") {
            formData.append('hasImage', 'true');

            formData.append('imageCounter', this.ImageFile.length.toString());

            for (let i = 0; i < this.ImageFile.length; i++) {
                formData.append('image' + i, this.ImageFile[i], this.ImageFile[i].name);
            }
        } else {
            formData.append('hasImage', 'false');
        }
        this.categoryProductService.insert(formData)
            .subscribe((result: any) => {
                this.submitting = false;
                if (result.id) {
                    this._notification.create('success', 'Product category ', result.name);
                    this.router.navigate(['/dashboard/category/product/details/', result.id]);

                }
            },
        (error: any) => {
            this.submitting = false;
            this._notification.create('error', 'Error occurred!', "Product Category didn't created!!");
        });
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

        this.categoryProductService.getAllCategory().subscribe((result: any) => {
            this.categorySearchOptions = result;
        });
        this.cmsService
      .getAllSearch({page: 'POST', section: 'HOME', subsection: 'OFFER'})
      .subscribe(result => {
            this.offers = result;
      });
    }
    //Event method on category change
    onCategoryChange(categoryId){
        this.parentCheck = false;
        this.categoryProductService.getSubcategoryByCategoryId(categoryId.id).subscribe((result: any) => {
            this.subCategorySearchOptions = result;
        });
    }
}
