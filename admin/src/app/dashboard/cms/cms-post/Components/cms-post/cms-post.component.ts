import {Component, OnInit, ViewChild} from '@angular/core';
import {CmsService} from '../../../../../services/cms.service';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {NzNotificationService} from 'ng-zorro-antd';
import {FileHolder, UploadMetadata} from 'angular2-image-upload';
import {environment} from "../../../../../../environments/environment";
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';

@Component({
    selector: 'app-cms-post',
    templateUrl: './cms-post.component.html',
    styleUrls: ['./cms-post.component.css']
})
export class CmsPostComponent implements OnInit {
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

    selectedSection: any;
    selectedSubSection: any;
    subsectionOptions: any;
    sectionoptionsData = [
        {
            section: 'HOME',
            sub_section: ['BANNER', 'MIDDLE', 'BOTTOM']
        },
        {section: 'NONE', sub_section: ['NONE']}
    ];
    cmsPostData: any;
    isAddModalVisible = false;
    isEditModalVisible = false;
    IMAGE_ENDPOINT = environment.IMAGE_ENDPOINT;
    editValidateForm: FormGroup;

    validateForm: FormGroup;
    ImageFile: File = null;

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

    @ViewChild('Image')
    Image: any;
    imageIndex: any;
    _isSpinning: any = false;
    id: any;
    currentPostId: any;

    constructor(private cmsService: CmsService,
                private _notification: NzNotificationService,
                private fb: FormBuilder) {

    }

    //Event method for getting all the data for the page
    ngOnInit() {
        this.editValidateForm = this.fb.group({
            section: ['', [Validators.required]],
            sub_section: ['', [Validators.required]],
            title: ['', [Validators.required]],
            description: ['', [Validators.required]]
        });

        this.getData();
    }

    //Event method for getting all the data for the page
    getData() {
        this.cmsService
            .getAllSearch({page: 'POST', section: 'NONE', subsection: 'NONE'})
            .subscribe(result => {
                this.id = result[0].id;
                this.cmsPostData = result;
            });
    }

    //Method for cms section change
    sectionChange(value) {

        this.subsectionOptions = null;
        this.selectedSubSection = null;
        let subsectionOptions = this.sectionoptionsData.filter(item => {
            return item.section === value;
        });

        if (subsectionOptions.length > 0 && typeof subsectionOptions[0].sub_section !== 'undefined'){
            this.subsectionOptions = subsectionOptions[0].sub_section;
        }

    }

    //Method for showing the edit modal
    showEditModal = (id, i) => {
        this.currentPostId = i;
        this.id = id;
        this.imageIndex = i;
        let editValue = this.cmsPostData[i].data_value[0];
        editValue.section = this.cmsPostData[i].section;
        editValue.sub_section = this.cmsPostData[i].sub_section;
        editValue.ImageFile = this.cmsPostData[i].image;
        this.editValidateForm.patchValue(editValue);
        this.isEditModalVisible = true;
    };

    handleModalOk = e => {
        // this.isEditModalVisible = false;
    };

    handleModalCancel = e => {
        this.resetForm(e);

        // this.isEditModalVisible = false;
    };

    testSubmit = ($event, value) => {
        console.log('testSubmit', value);
    }
    // Event method for submitting the edit form
    submitEditForm = ($event, value) => {
        /*console.log('submitEditForm', value);*/
        $event.preventDefault();

        this._isSpinning = true;
        for (const key in this.editValidateForm.controls) {
            this.editValidateForm.controls[key].markAsDirty();
        }

        let formData = new FormData();
        formData.append('section', value.section);
        formData.append('sub_section', value.sub_section);
        formData.append('title', value.title);
        formData.append('description', value.description);
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
            /*console.log('customPostUpdate', result);*/
            this.getData();
            this._notification.success('success', 'Post Update Succeeded');
            this._isSpinning = false;
            this.isEditModalVisible = false;
            this.resetForm(null);
        });
    };

    //Event method for resetting the form
    resetForm($event: MouseEvent) {
        /*console.log('resetForm')*/
        this.ImageFile = null;
        $event ? $event.preventDefault() : null;
        this.editValidateForm.reset();
        for (const key in this.editValidateForm.controls) {
            this.editValidateForm.controls[key].markAsPristine();
        }
    }

    //Method for removing the image
    onRemoved(file: FileHolder) {
        this.ImageFile = null;
    }

    selected($event) {
    }

    //Method for storing image in variable
    onBeforeUpload = (metadata: UploadMetadata) => {
        this.ImageFile = metadata.file;
        return metadata;
    };

    //Event method for setting up form in validation
    getFormControl(title) {
        return this.validateForm.controls[title];
    }

    //Event method for setting up edit form in validation
    getEditFormControl(title) {
        return this.editValidateForm.controls[title];
    }

    onUploadStateChanged(state: boolean) {
    }

    //Event method for deleting post
    deleteConfirm(index, id) {
        this.cmsService.delete(id).subscribe(result => {
            this.getData();
        });
    }
}
