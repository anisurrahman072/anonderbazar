import { Component, OnInit, ViewChild } from "@angular/core";
import {
  FormControl,
  Validators,
  FormGroup,
  FormBuilder
} from "@angular/forms";
import { AuthService, UserService, AreaService } from "./../../../../services";
import { AppSettings } from "../../../../config/app.config";
import { NotificationsService } from "angular2-notifications";
import { FileHolder, UploadMetadata } from "angular2-image-upload";
import {FormValidatorService} from "../../../../services/validator/form-validator.service";
import { Router } from "@angular/router";

@Component({
  selector: "Profile-tab",
  templateUrl: "./profile-tab.component.html",
  styleUrls: ["./profile-tab.component.scss"]
})
export class ProfileTabComponent implements OnInit {
  user = {};
  email: any;
  value: any;
  buttonShowHide: any;
  imageShow: any;
  imageUpload: any;
  imageDone: any;
  imageEdit: any;
  ImageFileEdit: any[] = [];
  genderSearchOptions = [
    { label: "Not specified", value: "not-specified" },
    { label: "Male", value: "male" },
    { label: "Female", value: "female" },
    { label: "Third gender", value: "third-gender" }
  ];
  IMAGE_ENDPOINT = AppSettings.IMAGE_ENDPOINT;
  divisionSearchOptions: any;
  zilaSearchOptions: any;
  division_newid: any;
  upazila_newid: any;
  zila_newid: any;
  ImageFile: File;
  @ViewChild("Image") Image;
  upazilaSearchOptions: any;
  updateProfileForm: FormGroup;
  sub: any;
  user_id: any;

  /*
  * constructor for ProfileTabComponent
  */
  constructor(
    private userService: UserService,
    private authService: AuthService,
    private fb: FormBuilder,
    private router: Router,
    private _notify: NotificationsService,
    private areaService: AreaService
  ) {
    this.email = new FormControl("", [Validators.required, Validators.email]);

    //Form validation
    this.updateProfileForm = this.fb.group({
      first_name: ["", Validators.required],
      last_name: ["", Validators.required],
      username: ["", Validators.required],
      email: ["", Validators.required],
      phone: ["", [Validators.required, FormValidatorService.phoneNumberValidator]], 
      gender: ["", Validators.required]
    });
  }

  ngOnInit() {
    this.value = true;
    this.imageShow = true;
    this.imageDone = false;
    this.imageEdit = true;
    this.imageUpload = false;
    this.buttonShowHide = "hide";
    this.user_id = this.authService.getCurrentUserId();
    this.getPageData();
    this.areaService.getAllDivision().subscribe(result => { 
      this.divisionSearchOptions = result;
    });
  }

  //Event called for getting profile data
  getPageData(){
    this.userService
      .getById(this.user_id)
      .subscribe(result => {
        this.user = result;
        this.ImageFileEdit = []; 
      });
  }

  //Event called for setting zila and updating data
  setZilaAndUpazilla(division_id, zila_id) {
    this.areaService.getAllZilaByDivisionId(division_id).subscribe(result => {
      this.zilaSearchOptions = result;
    });

    this.areaService.getAllUpazilaByZilaId(zila_id).subscribe(result => {
      this.upazilaSearchOptions = result;
    });
  }

  //Event called for updating profile data
  public formUpdateProfile = ($event, value) => {
    this.userService
      .update(this.authService.getCurrentUserId(), value)
      .subscribe(result => {
        this._notify.success("Profile update successful");
        this.router.navigate([`/profile/orders`]);
      });
  };

  //Event called for showing the image
  showImage() {
    this.imageShow = false;
    this.imageUpload = true;
    this.imageDone = true;
    this.imageEdit = false;
  }
  setValue() {
    this.value = false;
    this.buttonShowHide = "show";
  }

  //Event called for reseting form
  reset() { 
    this.value = true;
    this.buttonShowHide = "hide";
  }
  getErrorMessage() {
    return this.email.hasError("required")
      ? "You must enter a value"
      : this.email.hasError("email")
      ? "Not a valid email"
      : "";
  }

  //Event called for division change
  divisionChange($event) {
    var divisionId = $event.value;
    this.areaService.getAllZilaByDivisionId(divisionId).subscribe(result => {
      this.zilaSearchOptions = result;
    });
  }
  
  //Event called for zila change
  zilaChange($event) {
    var zilaId = $event.value;
    this.areaService.getAllUpazilaByZilaId(zilaId).subscribe(result => {
      this.upazilaSearchOptions = result;
    });
  }
  onRemoved(file: FileHolder) {
    this.ImageFile = null;
  }

  onBeforeUpload = (metadata: UploadMetadata) => {
    this.ImageFile = metadata.file;
    return metadata;
  };

  ngOnDestroy(): void {
    this.sub ? this.sub.unsubscribe() : "";
  }

  //Event called for updating image
  updateImage() {
    const formData: FormData = new FormData();
    if (this.ImageFile) {
      formData.append('hasImage', 'true');
      formData.append('avatar', this.ImageFile, this.ImageFile.name);
  } else {
      formData.append('hasImage', 'false');
  }
    this.userService
      .update(this.authService.getCurrentUserId(), formData)
      .subscribe(result => { 
        this._notify.success("Profile update successful");
        this.getPageData();
      });
    this.imageShow = true;
    this.imageUpload = false;
    this.imageDone = false;
    this.imageEdit = true;
  }

  getUpdateProfileFormControl(type) {
    return this.updateProfileForm.controls[type];
  }
}
