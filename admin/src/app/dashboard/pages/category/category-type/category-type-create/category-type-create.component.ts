import {Component, OnInit, ViewChild} from '@angular/core';
import {
    FormBuilder,
    FormGroup,
    Validators
} from '@angular/forms';

import {CategoryTypeService} from '../../../../../services/category-type.service';
import {NzNotificationService} from 'ng-zorro-antd';
import {ActivatedRoute, Router} from '@angular/router';

import {FileHolder, UploadMetadata} from 'angular2-image-upload';

@Component({
    selector: 'app-category-type-create',
    templateUrl: './category-type-create.component.html',
    styleUrls: ['./category-type-create.component.css']
})
export class CategoryTypeCreateComponent implements OnInit {
    validateForm: FormGroup;
    ImageFile: File;
    @ViewChild('Image') Image;

    constructor(private router: Router, private route: ActivatedRoute,
                private _notification: NzNotificationService,
                private fb: FormBuilder,
                private categoryTypeService: CategoryTypeService) {
        this.validateForm = this.fb.group({
            name: ['', [Validators.required]],
            code:[''],
            image: ['']
        });
    }


    submitForm = ($event, value) => {
        $event.preventDefault();
        for (const key in this.validateForm.controls) {
            this.validateForm.controls[key].markAsDirty();
        }

        
        const formData: FormData = new FormData();
        formData.append('name', value.name);
        formData.append('code', value.code);
        formData.append('type_id', '1');
        if (this.ImageFile) {
            formData.append('image', this.ImageFile, this.ImageFile.name);
            formData.append('hasImage', 'true');

        } else {
            formData.append('hasImage', 'false');

        }
        this.categoryTypeService.insert(formData)
            .subscribe((result: any) => {
                if (result.id) {
                    this._notification.create('success', 'New product Class has been successfully added.', result.name);
                    this.router.navigate(['/dashboard/category/type/details/', result.id]);

                }
            });
    }

    onRemoved(file: FileHolder) {
        this.ImageFile = null;
    }

    onBeforeUpload = (metadata: UploadMetadata) => { 
        this.ImageFile = metadata.file;
        return metadata;
    }


    resetForm($event: MouseEvent) {
        $event.preventDefault();
        this.validateForm.reset();
        for (const key in this.validateForm.controls) {
            this.validateForm.controls[key].markAsPristine();
        }
    }

    getFormControl(name) {
        return this.validateForm.controls[name];
    }

    ngOnInit() {
    }
}
