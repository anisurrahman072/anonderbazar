import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {
    FormBuilder,
    FormGroup,
    Validators
} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {NzNotificationService} from 'ng-zorro-antd';
import {UploadMetadata, FileHolder} from 'angular2-image-upload';
import {DesignCategoryService} from "../../../../../services/design-category.service";

@Component({
    selector: 'app-design-category-create',
    templateUrl: './design-category-create.component.html',
    styleUrls: ['./design-category-create.component.css']
})
export class DesignCategoryCreateComponent implements OnInit {
    validateForm: FormGroup;
    ImageFile: File;
    @ViewChild('Image') Image;
    designCategorySearchOptions = [];
    
    
    constructor(private router: Router, private route: ActivatedRoute,
                private _notification: NzNotificationService,
                private fb: FormBuilder,
                private designCategoryService: DesignCategoryService) {
        this.validateForm = this.fb.group({
            name: ['', [Validators.required]],
            code:[''],
            parent_id: [0, []],
            image: ['']
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
        formData.append('parent_id', value.parent_id);
        
        if (this.ImageFile) {
            formData.append('image', this.ImageFile, this.ImageFile.name);
            formData.append('hasImage', 'true');
            
        } else {
            formData.append('hasImage', 'false');
        }
        this.designCategoryService.insert(formData)
            .subscribe(result => {
                if (result.id) {
                    this._notification.create('success', 'new desgin category has been successfully added.', result.name);
                    this.router.navigate(['/dashboard/designcategory/details', result.id]);
                    
                }
            });
    };
    //Event method for removing picture
    onRemoved(file: FileHolder) {
        this.ImageFile = null;
    }
    //Event method for storing imgae in variable
    onBeforeUpload = (metadata: UploadMetadata) => {
        
        this.ImageFile = metadata.file;
        return metadata;
    }
    //Event method for resetting the form
    resetForm($event: MouseEvent) {
        $event.preventDefault();
        this.validateForm.reset();
        for (const key in this.validateForm.controls) {
            this.validateForm.controls[key].markAsPristine();
        }
    }
        //Event method for storing imgae in variable
    getFormControl(name) {
        return this.validateForm.controls[name];
    }
     // init the component
    ngOnInit() {
        this.designCategoryService.getAllDesignCategory().subscribe(result => {
            this.designCategorySearchOptions = result;
        });
        
    }
    
}
