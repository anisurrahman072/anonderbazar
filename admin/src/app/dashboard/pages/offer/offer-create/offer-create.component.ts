import {Component, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {FileHolder, UploadMetadata} from 'angular2-image-upload';
import {NzNotificationService} from 'ng-zorro-antd';
import {CmsService} from '../../../../services/cms.service';
import {environment} from "../../../../../environments/environment";
import {ProductService} from "../../../../services/product.service";

@Component({
    selector: 'app-offer-create',
    templateUrl: './offer-create.component.html',
    styleUrls: ['./offer-create.component.css']
})
export class OfferCreateComponent implements OnInit {
    validateForm: FormGroup;
    ImageFile: File;
    BannerImageFile: File;
    smallOfferImage: File;
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
    submitting: boolean = false;

    isShowHomepage: boolean = false;
    isShowCarousel: boolean = false;

    Calc_type;
    isVisible: Boolean = false;
    allProducts: any = [];

    allProductPage: number = 1;
    allProductLimit: number = 20;
    offerProductIds: any = [];
    allProductNameSearch: string = '';
    allProductTotal = 0;

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private _notification: NzNotificationService,
        private fb: FormBuilder,
        private cmsService: CmsService,
        private productService: ProductService
    ) {
        this.validateForm = this.fb.group({
            title: ['', [Validators.required]],
            offer_type: ['', [Validators.required]],
            frontend_position: ['', ''],
            link: ['', ''],
            description: ['', []],
            discountAmount: ['', [Validators.required]],
            calculationType: ['', [Validators.required]],
            offerStartDate: ['', Validators.required],
            offerEndDate: ['', Validators.required],
            showHome: ['', []],
            showCarousel: ['', []]
        });
    }

    ngOnInit() {
        this.getAllProducts(1);
    }

//Event method for submitting the form
    submitForm = ($event, value) => {
        this.submitting = true;
        $event.preventDefault();

        this._isSpinning = true;
        for (const key in this.validateForm.controls) {
            this.validateForm.controls[key].markAsDirty();
        }

        let formData = new FormData();
        let showInCarousel = this.isShowCarousel ? 'true' : 'false';
        let showInHome = this.isShowHomepage ? 'true' : 'false';
        formData.append('title', value.title);
        formData.append('subsection', value.offer_type);
        formData.append('link', value.link);
        formData.append('description', value.description);
        formData.append('showInCarousel', showInCarousel);
        formData.append('showInHome', showInHome);
        formData.append('discountAmount', value.discountAmount);
        formData.append('calculationType', value.calculationType);
        formData.append('offerStartDate', value.offerStartDate);
        formData.append('offerEndDate', value.offerEndDate);
        if (value.frontend_position) {
            console.log('hhh', value.frontend_position);
            formData.append('frontend_position', value.frontend_position);
        }
        if (this.ImageFile) {
            formData.append('hasImage', 'true');
            formData.append('image', this.ImageFile, this.ImageFile.name);
        } else {
            formData.append('hasImage', 'false');
        }

        if (this.smallOfferImage) {
            formData.append('hasSmallImage', 'true');
            formData.append('image', this.smallOfferImage, this.smallOfferImage.name);
        } else {
            formData.append('hasSmallImage', 'false');
        }

        if (this.BannerImageFile) {
            formData.append('hasBannerImage', 'true');
            formData.append('image', this.BannerImageFile, this.BannerImageFile.name);
        } else {
            formData.append('hasBannerImage', 'false');
        }

        this.cmsService.offerInsert(formData).subscribe(result => {
            this.submitting = false;
            this._notification.success('Offer Added', "Feature Title: ");
            this._isSpinning = false;
            this.resetForm(null);
            this.router.navigate(['/dashboard/offer']);
        }, error => {
            this.submitting = false;
            this._notification.error('Error Occurred!', "Error occurred while adding offer!");
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

    onRemoveSmallOfferImage(file: FileHolder) {
        this.smallOfferImage = null;
    }

    onUploadStateChanged(state: boolean) {
    }

//Event method for storing image in variable
    onBeforeUpload = (metadata: UploadMetadata) => {
        this.ImageFile = metadata.file;
        return metadata;
    }
    onBeforeBannerUpload = (metadata: UploadMetadata) => {
        this.BannerImageFile = metadata.file;
        return metadata;
    }
    onBeforeUploadImage = (metadata: UploadMetadata) => {
        this.smallOfferImage = metadata.file;
        return metadata;
    }

// Method for change offer type
    typeChange($event) {
        console.log($event);
        if ($event === 'OFFER') {
            this.linkVisible = true;
        } else {
            this.linkVisible = false;
        }
    }

    changeShowHomepage() {
        this.isShowHomepage = !this.isShowHomepage;
    }

    /*changeShowCarousel() {
        this.isShowCarousel = !this.isShowCarousel;
    }*/

    getAllProducts(event: any) {
        if(event) {
            this.allProductPage = event;
        }

        this._isSpinning = true;
        this.productService.getAllWithPagination(this.allProductPage, this.allProductLimit, this.offerProductIds, this.allProductNameSearch)
            .subscribe(result => {
                console.log('all products to add to offer: rrrrr: ', result);

            })
    }

    showModal(): void {
        this.isVisible = true;
    }

    handleOk(): void {
        console.log('Button ok clicked!');
        this.isVisible = false;
    }

    handleCancel(): void {
        console.log('Button cancel clicked!');
        this.isVisible = false;
    }
}
