import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {environment} from "../../../../../environments/environment";
import {OfferService} from "../../../../services/offer.service";
import moment from "moment";
import {NzNotificationService} from "ng-zorro-antd";

@Component({
    selector: 'app-anonder-jhor',
    templateUrl: './anonder-jhor.component.html',
    styleUrls: ['./anonder-jhor.component.css']
})
export class AnonderJhorComponent implements OnInit {

    /** Anonder Jhor variables */
    anonderJhorData: any;
    isAnonderJhorEdit: Boolean = false;
    AnonderJhorBannerImageFile: File;
    AnonderJhorBannerImageFileEdit: any;
    status: Boolean = false;

    /** Common Variables */
    validateForm: FormGroup;
    IMAGE_ENDPOINT = environment.IMAGE_ENDPOINT;
    _isSpinning: any = false;


    constructor(
        private fb: FormBuilder,
        private offerService: OfferService,
        private _notification: NzNotificationService,
    ) {
    }

    ngOnInit() {
        this.getAnonderJhor();
    }

    /** Method called to get data of anonder Jhor */
    getAnonderJhor() {
        this.offerService.getAnonderJhor()
            .subscribe(result => {
                this._isSpinning = true
                console.log('anonder jhor data: ', result.data);
                if(result.data) {
                    this.anonderJhorData = result.data;
                    this.status = this.anonderJhorData.status;
                    this._isSpinning = false;
                }else {
                    this._isSpinning = false;
                    this._notification.error('failed', 'Sorry, something went wrong');
                }
            }, () => {
                this._isSpinning = false;
            });
    }

    /** Event method called for editing anonder jhor */
    editAnonderJhor() {
        if (this.isAnonderJhorEdit) {
            this.validateForm = this.fb.group({
                bannerImage: ['', [Validators.required]],
                startDate: ['', [Validators.required]],
                endDate: ['', [Validators.required]],
            });

            this.AnonderJhorBannerImageFileEdit = [];

            let payload = {
                startDate: this.anonderJhorData.start_date ? this.anonderJhorData.start_date : '',
                endDate: this.anonderJhorData.end_date ? this.anonderJhorData.end_date : ''
            }
            this.validateForm.patchValue(payload);

            if (this.anonderJhorData && this.anonderJhorData.banner_image) {
                this.AnonderJhorBannerImageFileEdit.push(this.IMAGE_ENDPOINT + this.anonderJhorData.banner_image.image);
            }

            this._isSpinning = false;
        }
    }

/** Event method for submitting the form */
    submitForm = ($event, value) => {
        $event.preventDefault();
        this._isSpinning = true;

        for (const key in this.validateForm.controls) {
            this.validateForm.controls[key].markAsDirty();
        }

        let formData = new FormData();

        formData.append('startDate', moment(value.startDate).format('YYYY-MM-DD HH:mm:ss'));
        formData.append('endDate', moment(value.endDate).format('YYYY-MM-DD HH:mm:ss'));

        if (this.AnonderJhorBannerImageFile) {
            formData.append('hasBannerImage', 'true');
            formData.append('image', this.AnonderJhorBannerImageFile, this.AnonderJhorBannerImageFile.name);
        } else {
            formData.append('hasBannerImage', 'false');
        }

        this.offerService.updateAnonderJhor(formData).subscribe(result => {
            if (result) {
                this._notification.success('Update', "Anonder Jhor Updated Successfully");
                this._isSpinning = false;
                this.resetForm(null);

                this.getAnonderJhor();
                this.isAnonderJhorEdit = false;
            }
        }, () => {
            this._isSpinning = false;
        });
    };

    /** Event method for resetting the form */
    resetForm($event: MouseEvent) {
        $event ? $event.preventDefault() : null;
        this.validateForm.reset();
        for (const key in this.validateForm.controls) {
            this.validateForm.controls[key].markAsPristine();
        }
    }

    /** Event Method called to change the status of anonder jhor offer */
    jhorActiveStatusChange(event) {
        console.log('event: ', event);
        this.offerService.jhorActiveStatusChange(event)
            .subscribe(result => {
                console.log('status : ', result);
                if(result.code === 'INVALID_ACTION') {
                    this._notification.error('Sorry!', 'Offer time ended, you can not change status');
                }
                this.status = result.status;
                this.getAnonderJhor();
            });
    }

}
