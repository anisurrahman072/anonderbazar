import {UploadMetadata, FileHolder} from 'angular2-image-upload';
import {Validators} from '@angular/forms';
import {FormBuilder} from '@angular/forms';
import {NzNotificationService} from 'ng-zorro-antd';
import {FormGroup} from '@angular/forms';

import {Component, OnInit, ViewChild, ChangeDetectorRef} from '@angular/core';
import {CmsService} from '../../../../../services/cms.service';
import {environment} from "../../../../../../environments/environment";
import { CmsFeatureFooterService } from "../../../../../services/cms-feature-footer.service";

@Component({
    selector: 'app-cms-layout',
    templateUrl: './cms-layout.component.html',
    styleUrls: ['./cms-layout.component.css']
})
export class CmsLayoutComponent implements OnInit {
    selectedSection: any;
    selectedSubSection: any;
    subsectionOptions: any;
    sectionoptionsData = [
        {
            section: 'HOME', sub_section: ['BANNER', 'MIDDLE', 'BOTTOM', 'OFFER']
        },
        {section: 'NONE', sub_section: ['NONE']},
    ];

    cmsData: any;
    IMAGE_ENDPOINT = environment.IMAGE_ENDPOINT;


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
    @ViewChild('Image')
    Image: any;

    _isSpinning: any = false;

    id: any;

    currentPostId: any;

    constructor(private cdr: ChangeDetectorRef, private cmsService: CmsService,
                private _notification: NzNotificationService,
                private fb: FormBuilder,
                private _cmsFeatureFooterService: CmsFeatureFooterService
    ) {
    }

    ngOnInit() {
        this.validateForm = this.fb.group({
            section: ['', [Validators.required]],
            sub_section: ['', [Validators.required]],
            title: ['', [Validators.required]],
            description: ['', [Validators.required]]
        });
    }

    //Event method for layout section change
    sectionChange(value) {

        this.subsectionOptions = null;
        this.selectedSubSection = null;
        let filteredSubsectionOptions = this.sectionoptionsData.filter(item => {
            return item.section === value;
        });

        if (filteredSubsectionOptions.length > 0 && typeof filteredSubsectionOptions[0].sub_section !== 'undefined')
            this.subsectionOptions = filteredSubsectionOptions[0].sub_section;
        this.cdr.detectChanges();
    }
  //Method for showing the modal
    showCreateModal = () => {
        this.isAddModalVisible = true;
    };

    handleModalOk = e => {
        this.isAddModalVisible = false;
    };

    handleModalCancel = e => {
        this.resetForm(e);
        this.isAddModalVisible = false;
    };

    //Event method for getting all the data for the page
    getData() {
        this.cmsService.getAllSearch({page: 'POST', section: 'HOME', subsection: 'MIDDLE'})
            .subscribe(result => {
                this._cmsFeatureFooterService.sendCMSLayoutData(result);
            });
    }
//Event method for submitting the form

    submitForm = ($event, value) => {
        this._isSpinning = true;
        $event.preventDefault();
        for (const key in this.validateForm.controls) {
            this.validateForm.controls[key].markAsDirty();
        }

        let formData = new FormData();
        formData.append('title', value.title);
        formData.append('description', value.description);
        formData.append('page', 'POST');
        formData.append('section', value.section);
        formData.append('sub_section', value.sub_section);

        if (this.ImageFile) {
            formData.append('hasImage', 'true');
            formData.append('image', this.ImageFile, this.ImageFile.name);
        } else {
            formData.append('hasImage', 'false');
        }

        this.cmsService.customPostInsert(formData).subscribe(result => {
            this._isSpinning = false;
            this.isAddModalVisible = false;
            this.resetForm(null);

            this.getData();
/*            setInterval(() => {
                location.reload();
            }, 1000);*/
        });
    };
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
//Event method for resetting the form

    resetForm($event: MouseEvent) {
        this.ImageFile = null;

        $event ? $event.preventDefault() : null;
        this.validateForm.reset();
        for (const key in this.validateForm.controls) {
            this.validateForm.controls[key].markAsPristine();
        }
    }
//Event method for setting up form in validation

    getFormControl(title) {
        return this.validateForm.controls[title];
    }

    onUploadStateChanged(state: boolean) {
    }
}
