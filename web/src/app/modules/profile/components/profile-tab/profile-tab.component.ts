import {Component, OnInit, ViewChild} from "@angular/core";
import {
    FormControl,
    Validators,
    FormGroup,
    FormBuilder
} from "@angular/forms";
import {Router} from "@angular/router";
import {NotificationsService} from "angular2-notifications";
import {FileHolder, UploadMetadata} from "angular2-image-upload";
import {AuthService, UserService, AreaService} from "../../../../services";
import {AppSettings} from "../../../../config/app.config";
import {FormValidatorService} from "../../../../services/validator/form-validator.service";
import {User} from "../../../../models";
import * as fromStore from "../../../../state-management";
import {Store} from "@ngrx/store";
import {LoaderService} from "../../../../services/ui/loader.service";
import {ToastrService} from "ngx-toastr";

@Component({
    selector: "Profile-tab",
    templateUrl: "./profile-tab.component.html",
    styleUrls: ["./profile-tab.component.scss"]
})
export class ProfileTabComponent implements OnInit {
    @ViewChild("Image") Image;
    user: any;
    email: any;
    value: any;
    buttonShowHide: any;
    imageShow: any;
    imageUpload: any;
    imageDone: any;
    imageEdit: any;
    ImageFileEdit: any[] = [];
    genderSearchOptions = [
        {label: "Not specified", value: "not-specified"},
        {label: "Male", value: "male"},
        {label: "Female", value: "female"},
        {label: "Third gender", value: "third-gender"}
    ];
    IMAGE_ENDPOINT = AppSettings.IMAGE_ENDPOINT;
    divisionSearchOptions: any;

    ImageFile: File;

    updateProfileForm: FormGroup;
    sub: any;
    user_id: any;

    /*
    * constructor for ProfileTabComponent
    */
    constructor(
        private userService: UserService,
        private authService: AuthService,
        private store: Store<fromStore.HomeState>,
        private fb: FormBuilder,
        private router: Router,
        private loaderService: LoaderService,
        private _notify: NotificationsService,
        private areaService: AreaService,
        private toastService: ToastrService,
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
    getPageData() {
        this.userService
            .getById(this.user_id)
            .subscribe(result => {
                this.user = result;
                this.ImageFileEdit = [];
            });
    }

    //Event called for updating profile data
    public formUpdateProfile = ($event, value) => {
        this.loaderService.showLoader();
        this.userService
            .update(this.authService.getCurrentUserId(), value)
            .subscribe(result => {
                this.user = result;
                this.store.dispatch(new fromStore.LoadCurrentUser());
                this.toastService.success("Profile updated successful", 'Success');
                this.loaderService.hideLoader();
                this.router.navigate([`/profile/orders`]);
            }, (error)=> {
                console.log(error);
                this.loaderService.hideLoader();
                this.toastService.error('Problem in updating profile', 'Problem!');
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
        this.loaderService.showLoader();
        this.userService
            .update(this.authService.getCurrentUserId(), formData)
            .subscribe(result => {
                this.loaderService.hideLoader();
                this.user = result;
                this.store.dispatch(new fromStore.LoadCurrentUser());
                this.toastService.success("Profile Image updated successful", 'Success');
            }, (error) => {
                console.log(error);
                this.loaderService.hideLoader();
                this.toastService.error('Problem in updating profile Image', 'Problem!');
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
