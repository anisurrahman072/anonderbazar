import {Component, OnInit, ViewChild} from '@angular/core';
import {CmsService} from '../../../../../../services/cms.service';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {NzNotificationService} from 'ng-zorro-antd';
import {environment} from "../../../../../../../environments/environment";
import {CategoryProductService} from '../../../../../../services/category-product.service';

@Component({
    selector: 'app-cms-offer',
    templateUrl: './cms-offer.component.html',
    styleUrls: ['./cms-offer.component.css']
})
export class CmsOfferComponent implements OnInit {
    @ViewChild('Image')
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
    selectedSubSection: any = 'CATEGORY';
    subsectionOptions: any;
    ImageFileEdit: any[] = [];
    sectionoptionsData = [
        {
            section: 'HOME',
            sub_section: ['MIDDLE', 'CATEGORY']
        },
        {section: 'NONE', sub_section: ['NONE']}
    ];
    selectedSection = this.sectionoptionsData[0];
    cmsFeatureData: any[];
    isEditModalVisible = false;
    editValidateForm: FormGroup;
    sub_section: any;
    category_id: any;
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
    imageIndex: any;
    _isSpinning: any = false;
    id: any;
    currentFeatureId: any;
    allcategories: any;
    IMAGE_ENDPOINT = environment.IMAGE_ENDPOINT;

    constructor(private cmsService: CmsService,
                private _notification: NzNotificationService,
                private categoryProductService: CategoryProductService,
                private fb: FormBuilder) {

    }

    //Event method for getting all the data for the page
    ngOnInit() {
        this.editValidateForm = this.fb.group({
            section: ['', [Validators.required]],
            sub_section: ['', [Validators.required]],
            title: ['', [Validators.required]],
            category_id: ['', ''],
            lowerlimit: ['', ''],
            upperlimit: ['', ''],
            // images: ['', ''],
            description: ['', '']
        });
        this.getData();
    }

    sectionChange(value) {

        this.subsectionOptions = null;
        this.selectedSubSection = 'CATEGORY';
        let subsectionOptions = this.sectionoptionsData.filter(item => {
            return item.section === value;
        });
        if (typeof subsectionOptions[0] !== 'undefined' && typeof subsectionOptions[0].sub_section !== 'undefined')
            this.subsectionOptions = subsectionOptions[0].sub_section;
    }

    //Event method for getting all the data for the page
    getData() {
        this._isSpinning = true;
        this.cmsService
            .getBySubSectionName('CATEGORY')
            .subscribe(result => {
                console.log('getBySubSectionName', result);
                this.cmsFeatureData = result;
                this.cmsFeatureData.forEach(element => {
                    if (element.data_value[0].category_id) {
                        this.categoryProductService.getById(element.data_value[0].category_id).subscribe(category => {
                            element.data_value[0].category_id = category;
                        });
                    }
                });
                this._isSpinning = false;
            }, (err) => {
                this._isSpinning = false;
            });
        this.categoryProductService.getAllCategory().subscribe(result => {
            this.allcategories = result;
            this._isSpinning = false;
        }, (err) => {
            this._isSpinning = false;
        });
    }

    //Method for showing the modal
    showEditModal = (id, i) => {
        if (typeof this.cmsFeatureData[i] !== 'undefined') {
            this.currentFeatureId = i;
            this.id = id;
            this.imageIndex = i;
            let editValue = this.cmsFeatureData[i].data_value[0];
            editValue.section = this.cmsFeatureData[i].section;
            editValue.sub_section = this.cmsFeatureData[i].sub_section;
            editValue.category_id = this.cmsFeatureData[i].data_value[0].category_id.id;
            editValue.images = this.cmsFeatureData[i].image;
            this.editValidateForm.patchValue(editValue);

            this.isEditModalVisible = true;
        }

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
        formData.append('category_id', value.category_id);
        formData.append('lowerlimit', value.lowerlimit);
        formData.append('upperlimit', value.upperlimit);
        formData.append('description', value.description);
        formData.append('id', this.id.toString());
        formData.append('dataValueId', this.currentFeatureId.toString());


        this.cmsService.customPostUpdate(formData).subscribe(result => {
            this.getData();
            this._isSpinning = false;
            this.isEditModalVisible = false;
            this.resetForm(null);
        }, (err) => {
            this._isSpinning = false;
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

    //Event method for deleting category offer
    deleteConfirm(index, id) {
        this.cmsService.delete(id).subscribe(result => {
            this.getData();
        });
    }
}
