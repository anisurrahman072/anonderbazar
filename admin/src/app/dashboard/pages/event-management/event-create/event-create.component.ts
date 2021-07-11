import { Component, ElementRef, OnInit, ViewChild, Input } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { NzNotificationService } from "ng-zorro-antd";
import { UploadMetadata, FileHolder } from "angular2-image-upload";
import { Observable } from "rxjs";
import { AuthService } from "../../../../services/auth.service";
import { EventService } from "../../../../services/event.service";
import { EventPriceService } from "../../../../services/event-price.service";
import { splitMatchedQueriesDsl } from "@angular/core/src/view/util";
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';


@Component({
  selector: "app-event-create",
  templateUrl: "./event-create.component.html",
  styleUrls: ["./event-create.component.css"]
})
export class EventCreateComponent implements OnInit {
  Editor = ClassicEditor;
  config = {
    toolbar: {
      items: [
        'heading', '|', 'bold', 'italic', 'link',
        'bulletedList', 'numberedList', '|', 'indent', 'outdent', '|',
        'imageUpload',
        'blockQuote',
        'insertTable',
        'mediaEmbed',
        'undo', 'redo'
      ],
      heading: {
        options: [
          { model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
          { model: 'heading1', view: 'h1', title: 'Heading 1', class: 'ck-heading_heading1' },
          { model: 'heading2', view: 'h2', title: 'Heading 2', class: 'ck-heading_heading2' }
        ]
      },
      shouldNotGroupWhenFull: true,
      image: {
        toolbar: [
          'imageTextAlternative',
          'imageStyle:full',
          'imageStyle:side'
        ]
      }
    },
  };

  _isSpinning: boolean = false;
  validateForm: FormGroup;
  ImageFile: File[] = [];
  @ViewChild("Image") Image;
  currentUser: any;
  eventTypeSearchOptions: any = [
    { label: "মেলা", value: 1 },
    { label: "প্রশিক্ষণ", value: 2 },
    { label: "ইভেন্ট", value: 3 }
  ];
  event_type: number;
  listOfPrice = [];
  addedPrices = [];
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

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private eventService: EventService,
    private eventPriceService: EventPriceService,
    private _notification: NzNotificationService,
    private fb: FormBuilder,
    private authService: AuthService
  ) {
    this.validateForm = this.fb.group({
      name: ["", [Validators.required]],
      admin_email: ['', [Validators.required]],
      admin_phone: ['', [Validators.required]],
      event_place: [""],
      description: [""],
      event_startdate: [""],
      event_enddate: [""],
      event_starttime: [""],
      event_endtime: [""],
      registration_lastdate: [""],
      event_price_ids: [""],
      image: [""]
    });
  }
//Event method for submitting the form
  submitForm = ($event, value) => {
    $event.preventDefault();
    for (const key in this.validateForm.controls) {
      this.validateForm.controls[key].markAsDirty();
    }

    const formData: FormData = new FormData();
    formData.append("name", value.name);
    formData.append("admin_email", value.admin_email);
    formData.append("admin_phone", value.admin_phone);
    formData.append("event_place", value.event_place);
    formData.append("description", value.description);
    formData.append("event_startdate", value.event_startdate);
    formData.append("event_enddate", value.event_enddate);
    formData.append("event_starttime", value.event_starttime);
    formData.append("event_endtime", value.event_endtime);
    formData.append("registration_lastdate", value.registration_lastdate);
    formData.append("event_price_ids", value.event_price_ids);
    formData.append("event_type", this.event_type.toString());

    if (this.ImageFile.length) {
      formData.append('hasImage', 'true');
      formData.append('image', this.ImageFile[0], this.ImageFile[0].name);
    } else {
      formData.append('hasImage', 'false');

    }
    this._isSpinning = true;
    this.eventService.insert(formData).subscribe(
      result => {
        if (result.id) {
          this._notification.create(
            "success",
            "New event has been successfully added.",
            result.name
          );
          setTimeout(() => {
            this._isSpinning = false;
            this.router.navigate(["/dashboard/event/details/", result.id, { 'status': this.event_type }]);
          }, 1500);
        }
      },
      error => {
        this._isSpinning = false;
      }
    );
  };
//Event method for removing picture
  onRemoved(_file: FileHolder) {
    this.ImageFile = [];
  }
//Event method for storing imgae in variable
  onBeforeUpload = (metadata: UploadMetadata) => {
    try {
      this.ImageFile[0] = metadata.file;
      return metadata;

    } catch (error) {
    }
  }
//Event method for resetting the form
  resetForm($event: MouseEvent) {
    $event.preventDefault();
    this.validateForm.reset();
    for (const key in this.validateForm.controls) {
      this.validateForm.controls[key].markAsPristine();
    }
  }
//Event method for setting up form in validation
  getFormControl(name) {
    return this.validateForm.controls[name];
  }
 // init the component
  ngOnInit() {
    this.event_type = +this.route.snapshot.paramMap.get("status");
    this.currentUser = this.authService.getCurrentUser();
    this.eventPriceService.getAllEventPrice().subscribe(result => {
      this.listOfPrice = result.data;

    });
  }

  onUploadStateChanged(state: boolean) { }
  //Method for price change

  priceChange($event) {
    let query = encodeURI($event);
    this.eventPriceService.getSelectedPrices(query).subscribe(result => {
      this.addedPrices = result.data;

    });

  }
}
