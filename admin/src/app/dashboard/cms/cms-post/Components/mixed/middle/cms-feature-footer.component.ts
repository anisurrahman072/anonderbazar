import {Component, OnInit, ViewChild} from '@angular/core';
import {CmsService} from '../../../../../../services/cms.service';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {NzNotificationService} from 'ng-zorro-antd';
import {FileHolder, UploadMetadata} from 'angular2-image-upload';

import {environment} from "../../../../../../../environments/environment";

@Component({
    selector: 'app-cms-feature-footer',
    templateUrl: './cms-feature-footer.component.html',
    styleUrls: ['./cms-feature-footer.component.css']
})
export class CmsFeatureFooterComponent implements OnInit {
    options = [
        {value: 'android', label: 'android'},
        {value: 'apple', label: 'apple'},
        {value: 'windows', label: 'windows'},
        {value: 'ie', label: 'ie'},
        {value: 'chrome', label: 'chrome'},
        {value: 'github', label: 'github'},
        {value: 'aliwangwang', label: 'aliwangwang'},
        {value: 'dingding', label: 'dingding'}
    ];
    selectedOption = this.options[0]; 
    selectedSubSection: any;
    subsectionOptions: any;
    sectionoptionsData = [
        {
            section: 'HOME',
            sub_section: ['BANNER', 'MIDDLE', 'BOTTOM']
        },
        {section: 'NONE', sub_section: ['NONE']}
    ];
    selectedSection = this.sectionoptionsData[0];
    cmsFeatureData: any[];
    isEditModalVisible = false;
    editValidateForm: FormGroup;
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
    @ViewChild('Image')
    Image: any;
    imageIndex: any;
    _isSpinning: any = false;
    id: any;
    currentFeatureId: any;
    IMAGE_ENDPOINT = environment.IMAGE_ENDPOINT;

    constructor(private cmsService: CmsService,
                private _notification: NzNotificationService,
                private fb: FormBuilder) {
        this.editValidateForm = this.fb.group({
            section: ['', [Validators.required]],
            sub_section: ['', [Validators.required]],
            title: ['', [Validators.required]],
            description: ['', [Validators.required]]
        });
    }

    sectionChange(value) {

        this.subsectionOptions = null;
        this.selectedSubSection = null;
        let subsectionOptions = this.sectionoptionsData.filter(item => {
            return item.section === value;
        });
        if (typeof subsectionOptions[0].sub_section !== 'undefined')
            this.subsectionOptions = subsectionOptions[0].sub_section;
    }
  //Event method for getting all the data for the page
    ngOnInit() { 
        this.getData();
    } 
      //Event method for getting all the data for the page
    getData() {
        this.cmsService
            .getAllSearch({page: 'POST', section: 'HOME', subsection: 'MIDDLE'})
            .subscribe(result => {
                this.cmsFeatureData = result;
            });
    }
  //Method for showing the modal
    showEditModal = (id, i) => {
        this.currentFeatureId = i;
        this.id = id;
        this.imageIndex = i;
        let editValue = this.cmsFeatureData[i].data_value[0];
        editValue.section = this.cmsFeatureData[i].section;
        editValue.sub_section = this.cmsFeatureData[i].sub_section;
        this.editValidateForm.patchValue(editValue);
        this.isEditModalVisible = true;
    };

    handleModalOk = e => {
        this.isEditModalVisible = false;
    };
    handleModalCancel = e => {
        this.resetForm(e);
        this.isEditModalVisible = false;
    };
//Event method for submitting the edit form
    submitEditForm = ($event, value) => {
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
        formData.append('id', this.id.toString());
        formData.append('dataValueId', this.currentFeatureId.toString());

        if (this.ImageFile) {
            formData.append('hasImage', 'true');
            formData.append('image', this.ImageFile, this.ImageFile.name);
        } else {
            formData.append(
                'image',
                this.cmsFeatureData[this.imageIndex].data_value[0].image
            );
        }

        this.cmsService.customPostUpdate(formData).subscribe(result => {
            this.getData(); 
            this._isSpinning = false;
            this.isEditModalVisible = false;
            this.resetForm(null);
        });
    };
//Event method for resetting the form

    resetForm($event: MouseEvent) {
        this.ImageFile = null; 
        $event ? $event.preventDefault() : null;
        this.editValidateForm.reset();
        for (const key in this.editValidateForm.controls) {
            this.editValidateForm.controls[key].markAsPristine();
        }
    }
//Event method for setting up form in validation

    getEditFormControl(title) {
        return this.editValidateForm.controls[title];
    }
  //Method for removing the image

    onRemoved(file: FileHolder) {
        this.ImageFile = null;
    }

    onUploadStateChanged(state: boolean) {
    }
  //Method for storing image in variable

    onBeforeUpload = (metadata: UploadMetadata) => {
        this.ImageFile = metadata.file;
        return metadata;
    };
//Event method for deleting middle section
    deleteConfirm(index, id) {
        this.cmsService.delete(id).subscribe(result => {
            this.getData();
        });
    }
}
