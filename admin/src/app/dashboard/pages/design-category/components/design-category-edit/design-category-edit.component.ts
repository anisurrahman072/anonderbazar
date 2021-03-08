import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {Subscription} from 'rxjs';
import {FileHolder, UploadMetadata} from 'angular2-image-upload';
import {DesignCategoryService} from "../../../../../services/design-category.service";
import {environment} from "../../../../../../environments/environment";
import {NzNotificationService} from "ng-zorro-antd";

@Component({
    selector: 'app-design-category-edit',
    templateUrl: './design-category-edit.component.html',
    styleUrls: ['./design-category-edit.component.css']
})
export class DesignCategoryEditComponent implements OnInit, OnDestroy {
    @ViewChild('Image') Image;
    id: number;
    data: any = [];
    sub: Subscription;
    categorySearchOptions = [];
    ImageFileEdit: any[] = [];
    IMAGE_ENDPOINT = environment.IMAGE_ENDPOINT;
    validateForm: FormGroup;
    ImageFile: File;

    constructor(private router: Router, private route: ActivatedRoute,
                private _notification: NzNotificationService,
                private fb: FormBuilder,
                private designCategoryService: DesignCategoryService) {

    }

    // init the component
    ngOnInit() {
        this.validateForm = this.fb.group({
            name: ['', [Validators.required]],
            code: [''],
            parent_id: [null, []],
            image: ['']
        });
        this.designCategoryService.getAllDesignCategory().subscribe(result => {
            this.categorySearchOptions = result;
        });

        this.sub = this.route.params.subscribe(params => {
            this.id = +params['id'];
            this.designCategoryService.getById(this.id)
                .subscribe(result => {
                    this.data = result;
                    this.ImageFileEdit = [];
                    this.validateForm.patchValue(this.data);
                    if (this.data && this.data.image) {
                        this.ImageFileEdit.push(this.IMAGE_ENDPOINT + this.data.image);
                    }
                    this.validateForm.controls.parent_id.patchValue(this.data.parent_id);
                });
        });

    }

    // init the component
    submitForm = ($event, value) => {
        $event.preventDefault();
        for (const key in this.validateForm.controls) {
            this.validateForm.controls[key].markAsDirty();
        }
        const formData: FormData = new FormData();
        formData.append('name', value.name);
        formData.append('code', value.code);
        formData.append('parent_id', value.parent_id);
        if (this.ImageFile) {
            formData.append('image', this.ImageFile, this.ImageFile.name);
            formData.append('hasImage', 'true');
        } else {
            formData.append('hasImage', 'false');
        }
        this.designCategoryService.update(this.id, formData)
            .subscribe(result => {
                this._notification.create('success', 'Update successful', this.data.name);
                this.router.navigate(['/dashboard/designcategory/details/', this.id]);
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
    onRemoved(file: FileHolder) {
        this.ImageFile = null;
    }

    //Event method for storing imgae in variable
    onBeforeUpload = (metadata: UploadMetadata) => {
        this.ImageFile = metadata.file;
        return metadata;
    }


}
