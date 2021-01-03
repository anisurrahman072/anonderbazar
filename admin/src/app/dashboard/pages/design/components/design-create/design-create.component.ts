import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormControl
} from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import {
  NzInputDirectiveComponent,
  NzNotificationService
} from "ng-zorro-antd";
import { UploadMetadata, FileHolder } from "angular2-image-upload";
import { UserService } from "../../../../../services/user.service";
import { AuthService } from "../../../../../services/auth.service";
import { DesignService } from "../../../../../services/design.service";
import { DesignCategoryService } from "../../../../../services/design-category.service";
import { GenreService } from "../../../../../services/genre.service";

@Component({
  selector: "app-design-create",
  templateUrl: "./design-create.component.html",
  styleUrls: ["./design-create.component.css"]
})
export class DesignCreateComponent implements OnInit {
  tagOptions: any = [];
  validateForm: FormGroup;
  ImageFile: File;
  fieldArray: Array<any> = [];
  newAttribute: any = {};
  controlArray = [];

  instanceid: number = 0;
  @ViewChild("Image") Image;
  designCategorySearchOptions: any = {};
  designSubcategorySearchOptions: any = {};
  genreSearchOptions: any = {};

  ckConfig = {
    uiColor: "#662d91",
    toolbarGroups: [
      { name: "document", groups: ["mode", "document", "doctools"] },
      {
        name: "editing",
        groups: ["find", "selection", "spellchecker", "editing"]
      },
      { name: "forms", groups: ["forms"] }
    ],
    removeButtons: "Source,Save,Templates,Find,Replace,Scayt,SelectAll"
  };

  @ViewChild("input") input: NzInputDirectiveComponent;
  currentUser: any;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private _notification: NzNotificationService,
    private fb: FormBuilder,
    private authService: AuthService,
    private designCategoryService: DesignCategoryService,
    private designService: DesignService,
    private genreService: GenreService
  ) {
    this.validateForm = this.fb.group({
      name: ["", [Validators.required]],
      code: [""],
      design_category_id: ["", []],
      design_subcategory_id: ["", []],
      genre_id: ["", []],
      details: ["", []]
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
    formData.append("code", value.code);
    let design_category_id = [],
      design_subcategory_id = [],
      genre_id = [];
    for (let i = 0; i < this.instanceid; i++) {
      design_category_id.push(
        this.validateForm.value["design_category_id[" + i + "]"]
      );
      design_subcategory_id.push(
        this.validateForm.value["design_subcategory_id[" + i + "]"]
      );
      genre_id.push(this.validateForm.value["genre_id[" + i + "]"]);
    }
    formData.append("design_category_id", JSON.stringify(design_category_id));
    formData.append("genre_id", JSON.stringify(genre_id));
    formData.append("warehouse_id", this.currentUser.warehouse.id);

    formData.append(
      "design_subcategory_id",
      JSON.stringify(design_subcategory_id)
    );

    if (value.details) {
      formData.append("details", value.details);
    }

    if (this.ImageFile) {
      formData.append("hasImage", "true");
      formData.append("image", this.ImageFile, this.ImageFile.name);
    } else {
      formData.append("hasImage", "false");
    }
    this.designService.insert(formData).subscribe(result => {
      if (result.id) {
        this._notification.create(
          "success",
          "New design has been successfully added.",
          result.name
        );
        this.router.navigate(["/dashboard/design/details/", result.id]);
      }
    });
  };
  // Method for add custom field form
  addField(e?: MouseEvent) {
    if (e) {
      e.preventDefault();
    }
    const id = this.instanceid; 

    const design_category_control = {
      id,
      controlInstance: `design_category_id[${id}]`
    }; 
    const design_subcategory_control = {
      id,
      controlInstance1: `design_subcategory_id[${id}]`
    }; 
    const genre_control = {
      id,
      controlInstance2: `genre_id[${id}]`
    }; 
    let choice = [];
    choice.push(
      design_category_control,
      design_subcategory_control,
      genre_control
    );
    const index = this.controlArray.push(choice);
    this.validateForm.addControl(
      this.controlArray[index - 1][0].controlInstance,
      new FormControl(null, Validators.required)
    );
    this.validateForm.addControl(
      this.controlArray[index - 1][1].controlInstance1,
      new FormControl(null, Validators.required)
    );
    this.validateForm.addControl(
      this.controlArray[index - 1][2].controlInstance2,
      new FormControl(null, Validators.required)
    );
    this.instanceid++;
  }

  removeField(i, e: MouseEvent) {
    e.preventDefault();
    if (this.controlArray.length > 1) {
      const index = this.controlArray.indexOf(i);
      this.controlArray.splice(index, 1); 
      this.validateForm.removeControl(i.controlInstance);
    }
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
    this.currentUser = this.authService.getCurrentUser();
    this.addField();

    this.designCategoryService.getAllDesignCategory().subscribe(result => {
      this.designCategorySearchOptions = result;
    });

    this.genreService.getAll().subscribe(result => {
      this.genreSearchOptions = result;
    });

    this.designCategorySearchOptions = null;
    this.designSubcategorySearchOptions = null;
    this.genreSearchOptions = null;
  }

  categorySearchChange($event) {}
  //Method for category change
  categoryChange($event) {
    const query = encodeURI($event); 
    if (query !== "null") {
      this.designCategoryService
        .getDesignSubcategoryByDesignCategoryId(query)
        .subscribe(result => {
          this.designSubcategorySearchOptions = result;
        });
    } else {
      this.designSubcategorySearchOptions = {};
    }
  }

  subcategorySearchChange($event) {}

  genreSearchChange($event) {}
  // Method for adding custom field
  addFieldValue() {
    this.fieldArray.push(this.newAttribute);
    this.newAttribute = {};
  }
  // Method for deleting custom field
  deleteFieldValue(index) {
    this.fieldArray.splice(index, 1);
  }
}
