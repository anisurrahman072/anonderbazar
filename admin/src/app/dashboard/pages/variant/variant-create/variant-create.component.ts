import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NzNotificationService } from 'ng-zorro-antd';
import { UploadMetadata, FileHolder } from 'angular2-image-upload';
import { VariantService } from '../../../../services/variant.service';

@Component({
  selector: 'app-variant-create',
  templateUrl: './variant-create.component.html',
  styleUrls: ['./variant-create.component.css']
})
export class VariantCreateComponent implements OnInit {
  validateForm: FormGroup;
  typeSearchOptions = [
    { label: 'Yes', value: 1 },
    { label: 'No', value: 0 }
  ];
  submitting: boolean = false;


  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private _notification: NzNotificationService,
    private fb: FormBuilder,
    private variantService: VariantService
  ) {
    this.validateForm = this.fb.group({
      name: ['', [Validators.required]],
      type: ['', [Validators.required]]
    });
  }
//Event method for submitting the form
  submitForm = ($event, value) => {
    this.submitting = true;
    $event.preventDefault();
    for (const key in this.validateForm.controls) {
      this.validateForm.controls[key].markAsDirty();
    }
    const formData: FormData = new FormData();
    formData.append('name', value.name);
    formData.append('type', value.type);
    this.variantService.insert(formData).subscribe(result => {
      if (result) {
        this.submitting = false;
        this._notification.create(
          'success',
          'New attribute has been successfully added.',
          result.name
        );
        this.router.navigate(['/dashboard/variant/details/', result.id]);
      }
    },
       error => {
         this.submitting = false;
         this._notification.create(
             'error',
             'Error Occurred!',
             "Attribute didn't created!"
         );
       } );
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

  ngOnInit() {}
}
