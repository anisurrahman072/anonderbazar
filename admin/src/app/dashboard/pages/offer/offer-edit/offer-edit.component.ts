import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FileHolder, UploadMetadata } from 'angular2-image-upload';
import { NzNotificationService } from 'ng-zorro-antd';
import { CmsService } from '../../../../services/cms.service';
import {environment} from "../../../../../environments/environment";

@Component({
  selector: 'app-offer-edit',
  templateUrl: './offer-edit.component.html',
  styleUrls: ['./offer-edit.component.css']
})
export class OfferEditComponent implements OnInit {
  validateForm: FormGroup;
  ImageFile: File;
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
  sub:any;
  id:any;
  ImageFileEdit: any;
  data: any;
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private _notification: NzNotificationService,
    private fb: FormBuilder,
    private cmsService: CmsService,
  ) { 
    this.validateForm = this.fb.group({
      title: ['', [Validators.required]],
      offer_type: ['', [Validators.required]],
      link: ['', ''],
      description: ['', [Validators.required]]
    });
  }
 // init the component
  ngOnInit() { 
    
    this.sub = this.route.params.subscribe(params => {
      this.id = +params['id']; // (+) converts string 'id' to a number
      this.cmsService.getById(this.id)
          .subscribe(result => {
              console.log(result);
              this.ImageFileEdit = [];
              this.data = result;
              let payload = {
                title: this.data.data_value[0].title,
                offer_type: this.data.sub_section,
                link: this.data.data_value[0].link,
                description: this.data.data_value[0].description
              };
              this.validateForm.patchValue(payload);
              if (this.data && this.data.data_value[0].image) {
                  this.ImageFileEdit.push(this.IMAGE_ENDPOINT + this.data.data_value[0].image);
              }
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
    formData.append('id', this.id);
    formData.append('title', value.title);
    formData.append('subsection', value.offer_type);
    formData.append('link', value.link);
    formData.append('description', value.description); 
    if (this.ImageFile) {
        formData.append('hasImage', 'true');
        formData.append('image', this.ImageFile, this.ImageFile.name);
    } else {
      formData.append('hasImage', 'false');

    } 
    
    this.cmsService.updateOffer(formData).subscribe(result => {
        this._notification.success( 'Offer Added', "Feature Title: " );
        this._isSpinning = false; 
        this.resetForm(null);
        this.router.navigate(['/dashboard/offer']);
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

  onUploadStateChanged(state: boolean) {
  }
//Event method for storing imgae in variable
  onBeforeUpload = (metadata: UploadMetadata) => {
      this.ImageFile = metadata.file;
      return metadata;
  }
  // Method for change offer type
  typeChange($event){
    if ($event === 'OFFER') {
      this.linkVisible = true;
    }else{
      this.linkVisible = false;
    }
  }
}
