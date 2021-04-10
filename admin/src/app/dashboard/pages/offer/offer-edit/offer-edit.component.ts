import {Component, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {FileHolder, UploadMetadata} from 'angular2-image-upload';
import {NzNotificationService} from 'ng-zorro-antd';
import {CmsService} from '../../../../services/cms.service';
import {environment} from "../../../../../environments/environment";

@Component({
    selector: 'app-offer-edit',
    templateUrl: './offer-edit.component.html',
    styleUrls: ['./offer-edit.component.css']
})
export class OfferEditComponent implements OnInit {
    validateForm: FormGroup;
    ImageFile: File;
    BannerImageFile: File;
    @ViewChild('Image')
    Image: any;
    IMAGE_ENDPOINT = environment.IMAGE_ENDPOINT;
    linkVisible: boolean = false;
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
    _isSpinning: any = false;
    sub: any;
    id: any;
    ImageFileEdit: any;
    BannerImageFileEdit: any;
    data: any;

    isShowHomepage: boolean;
    isShowCarousel: boolean;

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private _notification: NzNotificationService,
        private fb: FormBuilder,
        private cmsService: CmsService,
    ) {

    }

    // init the component
    ngOnInit() {
        this.validateForm = this.fb.group({
            title: ['', [Validators.required]],
            offer_type: ['', [Validators.required]],
            frontend_position: ['', ''],
            link: ['', ''],
            description: ['', [Validators.required]],
            showHome: ['',[]],
            showCarousel: ['',[]]
        });
        this.sub = this.route.params.subscribe(params => {
            this._isSpinning = true;
            this.id = +params['id']; // (+) converts string 'id' to a number
            this.cmsService.getById(this.id)
                .subscribe(result => {
                    this.ImageFileEdit = [];
                    this.BannerImageFileEdit = [];
                    this.data = result;

                    let showHome = this.data.data_value[0].showInHome === 'true' ? true : false;
                    let showCarousel = this.data.data_value[0].showInCarousel === 'true' ? true : false;
                    this.isShowHomepage = showHome;
                    this.isShowCarousel = showCarousel;

                    let payload = {
                        title: this.data.data_value[0].title,
                        offer_type: this.data.sub_section,
                        link: this.data.data_value[0].link,
                        description: this.data.data_value[0].description,
                        showHome: showHome,
                        showCarousel: showCarousel,
                        frontend_position: this.data.frontend_position
                    };
                    this.validateForm.patchValue(payload);
                    if (this.data && this.data.data_value[0].image) {
                        this.ImageFileEdit.push(this.IMAGE_ENDPOINT + this.data.data_value[0].image);
                    }
                    if (this.data && this.data.data_value[0].banner_image) {
                        this.BannerImageFileEdit.push(this.IMAGE_ENDPOINT + this.data.data_value[0].banner_image);
                    }
                    this._isSpinning = false;
                }, () => {
                    this._isSpinning = false;
                });
        });
    }

//Event method for submitting the form
    submitForm = ($event, value) => {
        $event.preventDefault();

        this._isSpinning = true;
        for (const key in this.validateForm.controls) {
            this.validateForm.controls[key].markAsDirty();
        }

        let formData = new FormData();
        let showInCarousel = this.isShowCarousel ? "true" : "false";
        let showInHome = this.isShowHomepage ? "true" : "false";
        formData.append('id', this.id);
        formData.append('title', value.title);
        formData.append('subsection', value.offer_type);
        formData.append('link', value.link);
        formData.append('description', value.description);
        formData.append('showInCarousel', showInCarousel);
        formData.append('showInHome', showInHome);
        formData.append('frontend_position', value.frontend_position);
        if (this.ImageFile) {
            formData.append('hasImage', 'true');
            formData.append('image', this.ImageFile, this.ImageFile.name);
        } else {
            formData.append('hasImage', 'false');
        }

        if (this.BannerImageFile) {
            formData.append('hasBannerImage', 'true');
            formData.append('image', this.BannerImageFile, this.BannerImageFile.name);
        } else {
            formData.append('hasBannerImage', 'false');
        }

        this.cmsService.updateOffer(formData).subscribe(result => {
            this._notification.success('Offer Added', "Feature Title: ");
            this._isSpinning = false;
            this.resetForm(null);
            this.router.navigate(['/dashboard/offer']);
        }, () => {
            this._isSpinning = false;
        });
    };

    //Event method for resetting the form
    resetForm($event: MouseEvent) {
        $event ? $event.preventDefault() : null;
        this.validateForm.reset();
        for (const key in this.validateForm.controls) {
            this.validateForm.controls[key].markAsPristine();
        }
    }

//Event method for setting up form in validation
    getFormControl(name) {
        return this.validateForm.controls[name];
    }

//Event method for removing picture
    onRemoved(file: FileHolder) {
        this.ImageFile = null;
    }
    onBannerRemoved(file: FileHolder) {
        this.BannerImageFile = null;
    }

//Event method for storing imgae in variable
    onBeforeUpload = (metadata: UploadMetadata) => {
        this.ImageFile = metadata.file;
        return metadata;
    }

    onBeforeBannerUpload = (metadata: UploadMetadata) => {
        this.BannerImageFile = metadata.file;
        return metadata;
    }

    // Method for change offer type
    typeChange($event) {
        if ($event === 'OFFER') {
            this.linkVisible = true;
        } else {
            this.linkVisible = false;
        }
    }

    changeShowHomepage(){
        this.isShowHomepage = !this.isShowHomepage;
    }
    changeShowCarousel(){
        this.isShowCarousel = !this.isShowCarousel;
    }
}
