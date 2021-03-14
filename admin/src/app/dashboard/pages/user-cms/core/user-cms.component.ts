import {Component, OnInit, ViewChild} from '@angular/core';
import {FileHolder, UploadMetadata} from 'angular2-image-upload';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {NzNotificationService} from 'ng-zorro-antd';
import {CmsService} from '../../../../services/cms.service';

import {AuthService} from '../../../../services/auth.service';
import {environment} from "../../../../../environments/environment";

@Component({
    selector: 'app-cms',
    templateUrl: './user-cms.component.html',
    styleUrls: ['./user-cms.component.css']
})
export class UserCmsComponent implements OnInit {
    @ViewChild('Image')
    currentUser: any;
    IMAGE_ENDPOINT = environment.IMAGE_ENDPOINT;

    cmsPostData: any;
    isAddModalVisible = false;

    validateForm: FormGroup;
    ImageFile: File;
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

    Image: any;

    _isSpinning: any = false;

    id: any;

    currentPostId: any;
    submitting: boolean = false;

    constructor(
        private cmsService: CmsService,
        private authService: AuthService,
        private _notification: NzNotificationService,
        private fb: FormBuilder
    ) {
        this.validateForm = this.fb.group({
            title: ['', [Validators.required]],
            description: ['', [Validators.required]]
        });
    }

    ngOnInit() {
        this.currentUser = this.authService.getCurrentUser();
    }

    // Method for showing the modal
    showCreateModal = () => {
        this.isAddModalVisible = true;
    };
    // Modal method
    handleModalOk = e => {
        this.isAddModalVisible = false;
    };
    // Modal method
    handleModalCancel = e => {
        this.resetForm(e);
        this.isAddModalVisible = false;
    };
    // Event method for submitting the form
    submitForm = ($event, value) => {
        this.submitting = true;
        this._isSpinning = true;
        $event.preventDefault();
        for (const key in this.validateForm.controls) {
            this.validateForm.controls[key].markAsDirty();
        }

        let formData = new FormData();
        formData.append('title', value.title);
        formData.append('description', value.description);
        formData.append('page', 'POST');
        formData.append('section', 'NONE');
        formData.append('sub_section', 'NONE');
        formData.append('user_id', this.currentUser.id);

        if (this.ImageFile) {
            formData.append('hasImage', 'true');
            formData.append('image', this.ImageFile, this.ImageFile.name);
        } else {
            formData.append('hasImage', 'false');
        }

        this.cmsService.customPostInsert(formData).subscribe(result => {
            this.submitting = false;
            this._notification.create('success', 'Added Successfully.', "User CMS added successfully.");

            this._isSpinning = false;
            this.isAddModalVisible = false;
            this.resetForm(null);

        }, error => {
            this.submitting = false;
            this._notification.create('error', 'Error Occurred!', "Error occurred while adding user CMS!");
        });
    };

    // Method for removing the image
    onRemoved(file: FileHolder) {
        this.ImageFile = null;
    }

    selected($event) {
    }

    // Method for storing the image in variable before submit
    onBeforeUpload = (metadata: UploadMetadata) => {
        this.ImageFile = metadata.file;
        return metadata;
    };

    // Event method for resetting the form
    resetForm($event: MouseEvent) {
        this.ImageFile = null;

        $event ? $event.preventDefault() : null;
        this.validateForm.reset();
        for (const key in this.validateForm.controls) {
            this.validateForm.controls[key].markAsPristine();
        }
    }

    // Event method for setting up form in validation
    getFormControl(title) {
        return this.validateForm.controls[title];
    }

    onUploadStateChanged(state: boolean) {
    }
}
