import {Component, OnInit, ViewChild} from '@angular/core';
import {CmsService} from '../../../../../../services/cms.service';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {NzNotificationService} from 'ng-zorro-antd';
import {FileHolder, UploadMetadata} from 'angular2-image-upload';

import {AuthService} from '../../../../../../services/auth.service';
import {environment} from "../../../../../../../environments/environment";
import {AddNewCmsService} from "../../../../../../services/add-new-cms.service";
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';

@Component({
    selector: 'app-cms-post',
    templateUrl: './user-cms-post.component.html',
    styleUrls: ['./user-cms-post.component.css']
})
export class UserCmsPostComponent implements OnInit {
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
                    { model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
                    { model: 'heading1', view: 'h1', title: 'Heading 1', class: 'ck-heading_heading1' },
                    { model: 'heading2', view: 'h2', title: 'Heading 2', class: 'ck-heading_heading2' }
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

    currentUser: any;

    cmsPostData: any;
    isAddModalVisible = false;
    isEditModalVisible = false;
    IMAGE_ENDPOINT = environment.IMAGE_ENDPOINT;
    editValidateForm: FormGroup;

    validateForm: FormGroup;
    ImageFile: File;

    @ViewChild('Image')
    Image: any;
    imageIndex: any;

    _isSpinning: any = false;

    id: any;

    currentPostId: any;

    constructor(
        private cmsService: CmsService,
        private authService: AuthService,
        private _notification: NzNotificationService,
        private fb: FormBuilder,
        private _addNewCmsService: AddNewCmsService
    ) {

    }

    // For initiating the section element with data
    ngOnInit() {
        this.validateForm = this.fb.group({
            title: ['', [Validators.required]],
            description: ['', [Validators.required]]
        });

        this.editValidateForm = this.fb.group({
            title: ['', [Validators.required]],
            description: ['', [Validators.required]]
        });

        this.currentUser = this.authService.getCurrentUser();
        this.getData();
        this._addNewCmsService.userCMSData$.subscribe(data => {
            this.id = data[0].id;
            this.cmsPostData = data;
        })
    }

    // Method for getting all page data
    getData() {
        this.cmsService.getByUserId(this.currentUser.id).subscribe(result => {
            this.id = result[0].id;
            this.cmsPostData = result;
        });
    }

    // Method for showing the modal
    showCreateModal = () => {
        this.isAddModalVisible = true;
    };
    // Method for showing the edit form modal
    showEditModal = (id, i) => {
        this.currentPostId = i;
        this.id = id;
        this.imageIndex = i;
        this.editValidateForm.patchValue(this.cmsPostData[i].data_value[0]);
        this.isEditModalVisible = true;
    };
    // Modal method
    handleModalOk = e => {
        this.isAddModalVisible = false;
        this.isEditModalVisible = false;
    };
    // Modal method
    handleModalCancel = e => {
        this.resetForm(e);
        this.isAddModalVisible = false;
        this.isEditModalVisible = false;
    };
    // Event method for submitting the edit form
    submitEditForm = ($event, value) => {
        $event.preventDefault();

        this._isSpinning = true;
        for (const key in this.editValidateForm.controls) {
            this.editValidateForm.controls[key].markAsDirty();
        }

        let formData = new FormData();
        formData.append('title', value.title);
        formData.append('description', value.description);
        formData.append('page', 'POST');
        formData.append('section', 'NONE');
        formData.append('sub_section', 'NONE');
        formData.append('id', this.id);
        formData.append('dataValueId', '0');

        if (this.ImageFile) {
            formData.append('hasImage', 'true');
            formData.append('image', this.ImageFile, this.ImageFile.name);
        } else {
            formData.append(
                'image',
                this.cmsPostData[this.imageIndex].data_value[0].image
            );
        }

        this.cmsService.customPostUpdate(formData).subscribe(result => {
            this.cmsPostData[this.currentPostId].data_value[0] = result.data;
            this._notification.success('success', 'Post Update Succeeded');
            this._isSpinning = false;
            this.isEditModalVisible = false;
            this.resetForm(null);
            this.getData();
        }, (error) => {
            console.log(error);
            this._isSpinning = false;
            this._notification.error('Problems!', 'Post Update Failed');
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
        this.editValidateForm.reset();
        for (const key in this.editValidateForm.controls) {
            this.editValidateForm.controls[key].markAsPristine();
        }
    }

    // Event method for setting up form in validation
    getFormControl(title) {
        return this.validateForm.controls[title];
    }

    // Event method for setting up edit form in validation
    getEditFormControl(title) {
        return this.editValidateForm.controls[title];
    }

    onUploadStateChanged(state: boolean) {
    }

    // Method for deleting user cms post
    deleteConfirm(index, id) {
        console.log(id);
        this.cmsPostData = null;
        this.cmsService.delete(id).subscribe(result => {
            console.log('deleted', result);
            this.getData();
        }, (error) => {
            console.log(error);
            this._isSpinning = false;
            this._notification.error('Problems!', 'Post Delete Failed');
        });
    }
}
