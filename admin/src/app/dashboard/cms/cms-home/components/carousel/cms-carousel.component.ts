import { Component, OnInit, ViewChild } from '@angular/core';
import { CmsService } from '../../../../../services/cms.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FileHolder, UploadMetadata } from 'angular2-image-upload';
import { NzNotificationService } from 'ng-zorro-antd';
import {environment} from "../../../../../../environments/environment";

@Component({
  selector: 'app-cms-carousel',
  templateUrl: './cms-carousel.component.html',
  styleUrls: ['./cms-carousel.component.css']
})
export class CmsCarouselComponent implements OnInit {
  cmsCarouselData: any;
  isAddModalVisible = false;
  isEditModalVisible = false;
  IMAGE_ENDPOINT = environment.IMAGE_ENDPOINT;
  editValidateForm: FormGroup;

  validateForm: FormGroup;
  ImageFile: File;
  @ViewChild('Image')
  Image: any;

  _isSpinning: any = false;

  id: any;

  currentCarouselId: any;
  submitting: boolean = false;

  constructor(
    private cmsService: CmsService,
    private _notification: NzNotificationService,
    private fb: FormBuilder
  ) {
    this.validateForm = this.fb.group({
      title: ['', [Validators.required]],
      short1: ['', [Validators.required]],
      short2: ['', [Validators.required]],
      short3: ['', [Validators.required]],
      linktext: ['', [Validators.required]],
      link: ['', [Validators.required]],
    });

    this.editValidateForm = this.fb.group({
      title: ['', [Validators.required]],
      short1: ['', [Validators.required]],
      short2: ['', [Validators.required]],
      short3: ['', [Validators.required]],
      linktext: ['', [Validators.required]],
      link: ['', [Validators.required]],
    });
  }
  //Event method for getting all the data for the page
  ngOnInit() {
    this.getData();
  }
  //Event method for getting all the data for the page
  getData() {
    this.cmsService.getBySectionName('CAROUSEL').subscribe(result => {
      this.id = result[0].id;
      this.cmsCarouselData = result[0].data_value;
      this.cmsCarouselData.forEach(element => {
        element.description = JSON.parse(element.description);
      });
    });
  }
  //Method for showing the modal
  showCreateModal = () => {
    this.isAddModalVisible = true;
  };
  //Method for showing the edit modal
  showEditModal = i => {
    this.currentCarouselId = i;
    let textDescription = this.cmsCarouselData[i].description;
    this.cmsCarouselData[i]['short1'] = textDescription.short1;
    this.cmsCarouselData[i]['short2'] = textDescription.short2;
    this.cmsCarouselData[i]['short3'] = textDescription.short3;
    this.cmsCarouselData[i]['linktext'] = textDescription.linktext;
    this.cmsCarouselData[i]['link'] = textDescription.link;
    this.editValidateForm.patchValue(this.cmsCarouselData[i]);
    this.isEditModalVisible = true;
  };

  handleModalOk = e => {
    this.isAddModalVisible = false;
    this.isEditModalVisible = false;
  };

  handleModalCancel = e => {
    this.resetForm(e);
    this.isAddModalVisible = false;
    this.isEditModalVisible = false;
  };
//Event method for submitting the form
  submitForm = ($event, value) => {
    this.submitting = true;
    this._isSpinning = true;
    $event.preventDefault();
    for (const key in this.validateForm.controls) {
      this.validateForm.controls[key].markAsDirty();
    }

    let formData = new FormData();
    formData.append('title', value.title);
    formData.append('description', JSON.stringify({'short1': value.short1,'short2': value.short2,'short3': value.short3,'linktext': value.linktext,'link': value.link}));
    formData.append('id', this.id.toString());

    if (this.ImageFile) {
      formData.append('hasImage', 'true');
      formData.append('image', this.ImageFile, this.ImageFile.name);
    } else {
      formData.append('hasImage', 'false');
    }

    this.cmsService.customInsert(formData).subscribe(result => {
      this.submitting = false;
      this.cmsCarouselData.push(result.data);
      this._isSpinning = false;
      this.isAddModalVisible = false;
      this._notification.create(
          "success",
          "New Carousel has been successfully added.",
          result.name
      );
      this.resetForm(null);
    },
        error => {
          this.submitting = false;
          this._notification.create(
              "error",
              "Error Occurred!",
              "New Carousel didn't added successfully!"
          );

        });
    this.getData();
  };
//Event method for submitting the edit form
  submitEditForm = ($event, value) => {
    $event.preventDefault();

    this._isSpinning = true;
    for (const key in this.editValidateForm.controls) {
      this.editValidateForm.controls[key].markAsDirty();
    }

    let formData = new FormData();
    formData.append('title', value.title);
    formData.append('description', JSON.stringify({'short1': value.short1,'short2': value.short2,'short3': value.short3,'linktext': value.linktext,'link': value.link}));
    formData.append('id', this.id.toString());
    formData.append('dataValueId', this.currentCarouselId.toString());

    if (this.ImageFile) {
      formData.append('hasImage', 'true');
      formData.append('image', this.ImageFile, this.ImageFile.name);
    } else {
      formData.append('hasImage', 'false');
    }

    this.cmsService.customUpdate(formData).subscribe(result => {
      this.cmsCarouselData[this.currentCarouselId] = result.data;
      this._notification.success('success', 'Carousel Update Succeeded');
      this._isSpinning = false;
      this.isEditModalVisible = false;
      this.resetForm(null);
    });
    this.getData();
  };
  //Method for removing the image
  onRemoved(file: FileHolder) {
    this.ImageFile = null;
  }

  selected($event) {}
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
    this.editValidateForm.reset();
    for (const key in this.editValidateForm.controls) {
      this.editValidateForm.controls[key].markAsPristine();
    }
  }
//Event method for setting up form in validation
  getFormControl(title) {
    return this.validateForm.controls[title];
  }
//Event method for setting up edit form in validation
  getEditFormControl(title) {
    return this.editValidateForm.controls[title];
  }

  onUploadStateChanged(state: boolean) {}
//Event method for deleting carousel
  deleteCarousel(i) {
    this._isSpinning = true;
    let deletePayload = {
      id: this.id,
      carouselId: i
    };
    this.cmsService.customDelete(deletePayload).subscribe(result => {
      this._notification.success('Delete', 'Carousel Delete Successfully');
      this._isSpinning = false;
      this.getData();
    });
  }
}
