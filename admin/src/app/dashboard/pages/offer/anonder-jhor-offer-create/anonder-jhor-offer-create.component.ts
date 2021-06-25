import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {FileHolder, UploadMetadata} from 'angular2-image-upload';
import {NzNotificationService} from 'ng-zorro-antd';
import {environment} from "../../../../../environments/environment";
import {ProductService} from "../../../../services/product.service";
import * as ___ from 'lodash';
import {OfferService} from "../../../../services/offer.service";
import moment from "moment";

@Component({
  selector: 'app-anonder-jhor-offer-create',
  templateUrl: './anonder-jhor-offer-create.component.html',
  styleUrls: ['./anonder-jhor-offer-create.component.css']
})
export class AnonderJhorOfferCreateComponent implements OnInit {

  @Input() isVisible: Boolean;
  validateForm: FormGroup;
  ImageFile: File;
  @ViewChild('Image')
  Image: any;
  IMAGE_ENDPOINT = environment.IMAGE_ENDPOINT;
  _isSpinning: any = false;
  submitting: boolean = false;

  Calc_type;
  /*variables taken for ngmodel in nz-select*/
  selectionType;
  categoryId;
  subCategoryId;
  subSubCategoryId;

  /**variables used for storing subCat and subSubCat options*/
  allCategoryIds
  allSubCategoryIds;
  allSubSubCategoryIds;

  constructor(
      private router: Router,
      private _notification: NzNotificationService,
      private fb: FormBuilder,
      private offerService: OfferService,
  ) {
    this.validateForm = this.fb.group({
      categoryId: ['', [Validators.required]],
      subCategoryId: ['', []],
      subSubCategoryId: ['', []],
      offerStartDate: ['', Validators.required],
      offerEndDate: ['', Validators.required],
      calculationType: ['', [Validators.required]],
      discountAmount: ['', [Validators.required]],
    });
  }

  ngOnInit() {
    this.getAllCategories()
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

    formData.append('categoryId', value.categoryId);
    formData.append('offerStartDate', moment(value.offerStartDate).format('YYYY-MM-DD HH:mm:ss'));
    formData.append('offerEndDate', moment(value.offerEndDate).format('YYYY-MM-DD HH:mm:ss'));
    formData.append('calculationType', value.calculationType);
    formData.append('discountAmount', value.discountAmount);


    if (value.subCategoryId) {
      formData.append('subCategoryId', this.subCategoryId);
    }
    if (value.subSubCategoryId) {
      formData.append('subSubCategoryId', this.subSubCategoryId);
    }

    if (this.ImageFile) {
      formData.append('hasImage', 'true');
      formData.append('image', this.ImageFile, this.ImageFile.name);
    } else {
      formData.append('hasImage', 'false');
    }


    this.offerService.anonderJhorOfferInsert(formData).subscribe(result => {
      console.log('jhor offer subimit', result);
      this.submitting = false;
      if (result.code === 'INVALID_SUBSUBCAT') {
        this._notification.error('Sub-sub-Category exists', "Sub-sub-Category already exists in another offer ");
        this._isSpinning = false;
      } else {
        this._notification.success('Offer Added', "Feature Title: ");
        this._isSpinning = false;
        this.resetForm(null);
        this.isVisible = false;
        this.router.navigate(['/dashboard/offer/anonder-jhor']);
      }
    }, error => {
      this.submitting = false;
      this._notification.error('Error Occurred!', "Error occurred while adding offer!");
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

  /** Event method for setting up form in validation */
  getFormControl(name) {
    return this.validateForm.controls[name];
  }

  /** Event method for removing picture */
  onRemoved(file: FileHolder) {
    this.ImageFile = null;
  }

  onUploadStateChanged(state: boolean) {
  }

  /** Event method for storing image in variable */
  onBeforeUpload = (metadata: UploadMetadata) => {
    this.ImageFile = metadata.file;
    return metadata;
  }

  getAllCategories() {
    this.offerService.getAllOptions('Category wise', '', '')
        .subscribe(result => {
          this.allCategoryIds = result.data;
          this.allSubCategoryIds = '';
          this.allSubSubCategoryIds = '';
        })
  }

  getAllSubCategories(event) {
    this.offerService.getAllOptions('Category wise', event, '')
        .subscribe(result => {
          this.allSubCategoryIds = result.data;
          this.allSubSubCategoryIds = '';
        })
  }

  getAllSubSubCategories(event) {
    this.offerService.getAllOptions('Category wise', this.categoryId, event)
        .subscribe(result => {
          this.allSubSubCategoryIds = result.data;
        })
  }

  handleOk = (e) => {
    this.isVisible = false;
  }

  handleCancel = (e) => {
    this.isVisible = false;
  }
}
