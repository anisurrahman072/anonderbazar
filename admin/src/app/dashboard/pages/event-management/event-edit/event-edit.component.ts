import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NzNotificationService } from 'ng-zorro-antd';
import { UploadMetadata, FileHolder } from 'angular2-image-upload';
import { Observable } from 'rxjs';
import { AuthService } from '../../../../services/auth.service';
import { EventService } from '../../../../services/event.service';

import * as moment from 'moment';
import { EventPriceService } from '../../../../services/event-price.service';
import {environment} from "../../../../../environments/environment";
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';

@Component({
  selector: 'app-event-edit',
  templateUrl: './event-edit.component.html',
  styleUrls: ['./event-edit.component.css']
})
export class EventEditComponent implements OnInit {
  Editor = ClassicEditor;

  _isSpinning: boolean = false;
  validateForm: FormGroup;
  ImageFile: File;
  ImageFileEdit: any[] = [];
  IMAGE_ENDPOINT = environment.IMAGE_ENDPOINT;
  @ViewChild('Image') Image;
  currentUser: any;
  eventTypeSearchOptions: any = [
    { label: "মেলা", value: 1 },
    { label: "প্রশিক্ষণ", value: 2 },
    { label: "ইভেন্ট", value: 3 }
  ];
  data: any;
  id: number;
  sub: any;
  status_id: any;
  listOfPrice = [];
  addedPrices = [];
  event_starttime: Date = new Date();uri_id: any;
  event_endtime: Date = new Date();
  ckConfig = {
    uiColor: "#662d91",
    toolbarGroups: [
      {
        name: "basicstyles",
        group: [
          "Bold",
          "Italic",
          "Underline",
          "Strike",
          "Subscript",
          "Superscript",
          "-",
          "JustifyLeft",
          "JustifyCenter",
          "JustifyRight",
          "JustifyBlock",
          "-",
          "BidiLtr",
          "BidiRtl",
          "Language"
        ]
      },
      {
        name: "paragraph",
        groups: ["JustifyLeft", "JustifyCenter", "JustifyRight", "JustifyBlock"]
      },
      { name: "styles", groups: ["Styles", "Format", "Font", "FontSize"] }
    ],
    removeButtons: "Source,Save,Templates,Find,Replace,Scayt,SelectAll"
  };
  constructor(private router: Router,
    private route: ActivatedRoute,
    private eventService: EventService,
    private eventPriceService: EventPriceService,
    private _notification: NzNotificationService,
    private fb: FormBuilder,
    private authService: AuthService) {
    this.validateForm = this.fb.group({
      event_type: ['', [Validators.required]],
      name: ['', [Validators.required]],
      admin_email: ['', [Validators.required]],
      admin_phone: ['', [Validators.required]],
      event_place: [""],
      description: [''],
      event_startdate: [""],
      event_enddate: [""],
      event_starttime: [""],
      event_endtime: [""],
      event_price_ids: [""],
      registration_lastdate: [""],
      image: ['', []]

    });
  }

//Event method for submitting the form
  submitForm = ($event, value) => {
    $event.preventDefault();
    for (const key in this.validateForm.controls) {
      this.validateForm.controls[key].markAsDirty();
    }
    const formData: FormData = new FormData();
    formData.append('name', value.name);
    formData.append("admin_email", value.admin_email);
    formData.append("admin_phone", value.admin_phone);
    formData.append("event_place", value.event_place);
    formData.append('description', value.description);
    formData.append("event_startdate", value.event_startdate);
    formData.append("event_enddate", value.event_enddate);
    formData.append("event_starttime", value.event_starttime);
    formData.append("event_endtime", value.event_endtime);
    formData.append("registration_lastdate", value.registration_lastdate);
    formData.append("event_price_ids", value.event_price_ids);
    formData.append('event_type', value.event_type.toString());


    if (this.ImageFile) {
      formData.append('image', this.ImageFile, this.ImageFile.name);
      formData.append('hasImage', 'true');
    } else {
      formData.append('hasImage', 'false');
    }
    this._isSpinning = true;
    this.eventService.update(this.id, formData).subscribe(
      result => {
        this._notification.create('success', 'Update successful for ', this.data.name);
        setTimeout(() => {
          this._isSpinning = false;
          this.router.navigate(["/dashboard/event/details/", result.eventManagement[0].id, { 'status': this.status_id }]);
        }, 2000);
      },
      error => {
        this._notification.create('error', ' failed', 'Update failed');
        this._isSpinning = false;
      }
    );
  }
   // init the component
  ngOnInit() {
    this.status_id = this.route.snapshot.paramMap.get('status');


    this.sub = this.route.params.subscribe(params => {
      this.id = +params['id']; // (+) converts string 'id' to a number
      this.eventService.getById(this.id).subscribe(result => {
        this.data = result;
        this.ImageFileEdit = [];
        this.event_starttime = result.event_starttime;
        this.event_endtime = result.event_endtime;
        this.validateForm.patchValue(this.data);
        if (this.data && this.data.image) {
          this.ImageFileEdit.push(this.IMAGE_ENDPOINT + this.data.image);
        }
        this.eventPriceService.getAllEventPrice().subscribe(result => {
          this.listOfPrice = result.data;
        });
      });
    });

  }
  //Event method for resetting the form
  resetForm($event: MouseEvent) {
    $event.preventDefault();
    this.validateForm.reset();
    for (const key in this.validateForm.controls) {
      this.validateForm.controls[key].markAsPristine();
    }
  }
    //Event method for storing imgae in variable
  getFormControl(name) {
    return this.validateForm.controls[name];
  }
//Event method for removing picture
  onRemoved(file: FileHolder) {
    this.ImageFile = null;
  }
//Event method for storing imgae in variable
  onBeforeUpload = (metadata: UploadMetadata) => {
    this.ImageFile = metadata.file;
    return metadata;
  };
    //Method for price change

  priceChange($event) {
    let query = encodeURI($event);
    this.eventPriceService.getSelectedPrices(query).subscribe(result => {
      this.addedPrices = result.data;
    });

  }

}
