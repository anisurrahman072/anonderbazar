import { Component, OnInit, ViewChild } from '@angular/core';
import { CmsService } from '../../../../services/cms.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzNotificationService } from 'ng-zorro-antd';
import { FileHolder, UploadMetadata } from 'angular2-image-upload';

import {environment} from "../../../../../environments/environment";

@Component({
  selector: 'app-cms-add',
  templateUrl: './cms-add.component.html',
  styleUrls: ['./cms-add.component.css']
})
export class CmsAddComponent implements OnInit {
  @ViewChild('Image')
  cmsAddData: any;
  isEditModalVisible = false;
  editValidateForm: FormGroup;
  IMAGE_ENDPOINT = environment.IMAGE_ENDPOINT;
  IMAGE_THUMB_ENDPOINT = environment.IMAGE_THUMB_ENDPOINT;

  ImageFile: File;

  Image: any;
  _isSpinning: any = false;
  id: any;
  data_value: any;
  currentAddId: any;

  constructor(
    private cmsService: CmsService,
    private _notification: NzNotificationService,
    private fb: FormBuilder
  ) {
    this.editValidateForm = this.fb.group({
      title: ['', [Validators.required]],
      description: ['', [Validators.required]]
    });
  }
  //Event method for getting all the data for the page
  ngOnInit() {
    this.getData();
  }
  //Event method for getting all the data for the page
  getData() {
    this.cmsService.getBySectionName('ADVERTISEMENT').subscribe(result => {
      this.id = result[0].id;
      this.cmsAddData = result[0].data_value;
    });
  }
  //Method for showing the edit modal
  showEditModal = i => {
    this.currentAddId = i;
    this.editValidateForm.patchValue(this.cmsAddData[i]);
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
    formData.append('title', value.title);
    formData.append('description', value.description);
    formData.append('id', this.id.toString());
    formData.append('dataValueId', this.currentAddId.toString());

    if (this.ImageFile) {
      formData.append('hasImage', 'true');
      formData.append('image', this.ImageFile, this.ImageFile.name);
    } else {
      formData.append('hasImage', 'false');
    }

    this.cmsService.customUpdate(formData).subscribe(result => {
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

  onRemoved(file: FileHolder) {
    this.ImageFile = null;
  }
  onUploadStateChanged(state: boolean) {}
  onBeforeUpload = (metadata: UploadMetadata) => {
    this.ImageFile = metadata.file;
    return metadata;
  };
}
