import { Component, OnInit, ViewChild } from '@angular/core';
import { CmsService } from '../../../../../../services/cms.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzNotificationService } from 'ng-zorro-antd';
import { FileHolder, UploadMetadata } from 'angular2-image-upload'; 
import {environment} from "../../../../../../../environments/environment";

@Component({
  selector: 'app-cms-footer',
  templateUrl: './cms-footer.component.html',
  styleUrls: ['./cms-footer.component.css']
})
export class CmsFooterComponent implements OnInit {
  cmsFooterData: any[];
  isEditModalVisible = false;
  editValidateForm: FormGroup;
  ImageFile: File;
  @ViewChild('Image')
  Image: any;
  _isSpinning: any = false;
  id: any;
  currentFooterId: any;
  IMAGE_ENDPOINT = environment.IMAGE_ENDPOINT;

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
    this.cmsService.getBySubSectionName('FOOTER').subscribe(result => {
      this.id = result[0].id;
      this.cmsFooterData = result[0].data_value;
    });
  }
  //Method for showing the modal
  showEditModal = i => {
    this.currentFooterId = i;
    this.editValidateForm.patchValue(this.cmsFooterData[i]);
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
    formData.append('dataValueId', this.currentFooterId.toString());

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
  //Method for removing the image
  onRemoved(file: FileHolder) {
    this.ImageFile = null;
  }
  onUploadStateChanged(state: boolean) {}
  //Method for storing image in variable
  onBeforeUpload = (metadata: UploadMetadata) => {
    this.ImageFile = metadata.file;
    return metadata;
  };
}
