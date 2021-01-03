import {Component, OnInit, ViewChild} from '@angular/core';
import {CmsService} from '../../../../../services/cms.service';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {NzNotificationService} from 'ng-zorro-antd';
import {FileHolder, UploadMetadata} from 'angular2-image-upload';
import {environment} from "../../../../../../environments/environment";

@Component({
    selector: 'app-cms-header',
    templateUrl: './cms-header.component.html',
    styleUrls: ['./cms-header.component.css']
})
export class CmsHeaderComponent implements OnInit {
    selectedSection: any;
    selectedSubSection: any;
    subsectionOptions: any;
    genderSearchOptions = [
        {label: 'Male', value: 'male'},
        {label: 'Female', value: 'female'},
        {label: 'Not Specified', value: 'not-specified'}
    ];
    sectionoptionsData = [
        {
            section: 'HOME',
            sub_section: ['BANNER', 'MIDDLE', 'BOTTOM']
        },
        {section: 'NONE', sub_section: ['NONE']}
    ];
    cmsHeaderData: any;
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
    _isSpinning: any = false;
    id: any;
    currentHeaderId: any;
    IMAGE_ENDPOINT = environment.IMAGE_ENDPOINT;
    validateForm: FormGroup;
    imageIndex: any;

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
  //Event method for getting all the data for the page
    ngOnInit() {
        this.getData();
    }
    //Event method for banner section change
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
    getData() {
        this.cmsService
            .getAllSearch({page: 'POST', section: 'HOME', subsection: 'BANNER'})
            .subscribe(result => {
                this.cmsHeaderData = result;
            });
    }
  //Method for showing the modal
    showEditModal = (id, i) => {
        this.currentHeaderId = i;
        this.id = id;
        this.imageIndex = i;
        let editValue = this.cmsHeaderData[i].data_value[0];
        editValue.section = this.cmsHeaderData[i].section;
        editValue.sub_section = this.cmsHeaderData[i].sub_section;
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
//Event method for setting up form in validation
    getFormControl(title) {
        return this.validateForm.controls[title];
    }
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
        formData.append('dataValueId', this.currentHeaderId.toString());
        if (this.ImageFile) {
            formData.append('hasImage', 'true');
            formData.append('image', this.ImageFile, this.ImageFile.name);
        } else {
            formData.append(
                'image',
                this.cmsHeaderData[this.imageIndex].data_value[0].image
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
//Event method for setting up edit form in validation
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
//Event method for deleting banner
    deleteConfirm(index, id) {
        this.cmsService.delete(id).subscribe(result => {
            this.getData();
        });
    }
}
