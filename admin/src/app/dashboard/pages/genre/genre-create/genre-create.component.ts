import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NzNotificationService } from 'ng-zorro-antd';
import { UploadMetadata, FileHolder } from 'angular2-image-upload';
import { Observable } from 'rxjs';
import { BrandService } from '../../../../services/brand.service';
import { AuthService } from '../../../../services/auth.service';
import { GenreService } from '../../../../services/genre.service';

@Component({
  selector: 'app-genre-create',
  templateUrl: './genre-create.component.html',
  styleUrls: ['./genre-create.component.css']
})
export class GenreCreateComponent implements OnInit {
  validateForm: FormGroup;
  ImageFile: File;
  @ViewChild('Image') Image;
  currentUser: any;

  ckConfig = {
    uiColor: '#662d91',
    toolbarGroups: [
      { name: 'document', groups: ['mode', 'document', 'doctools'] },
      {
        name: 'editing',
        groups: ['find', 'selection', 'spellchecker', 'editing']
      },
      { name: 'forms', groups: ['forms'] }
    ],
    removeButtons: 'Source,Save,Templates,Find,Replace,Scayt,SelectAll'
  };

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private _notification: NzNotificationService,
    private fb: FormBuilder,
    private authService: AuthService,
    private genreService: GenreService
  ) {
    this.validateForm = this.fb.group({
      name: ['', [Validators.required]],
      code:[''],
      details:[''],
      image: ['']
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
    formData.append('details', value.details);
    formData.append('code', value.code);
    formData.append('warehouse_id', this.currentUser.warehouse.id);

    if (this.ImageFile) {
      formData.append('hasImage', 'true');
      formData.append('image', this.ImageFile, this.ImageFile.name);
    } else {
      formData.append('hasImage', 'false');
    }
    this.genreService.insert(formData).subscribe(result => {
      if (result.id) {
        this._notification.create(
          'success',
          'New genre  has been successfully added.',
          result.name
        );
        this.router.navigate(['/dashboard/genre/details/', result.id]);
      }
    });
  };
  // Event method for removing picture
  onRemoved(file: FileHolder) {
    this.ImageFile = null;
  }
  // Event method for storing imgae in variable
  onBeforeUpload = (metadata: UploadMetadata) => {
    this.ImageFile = metadata.file;
    return metadata;
  };
  // Event method for resetting the form
  resetForm($event: MouseEvent) {
    $event.preventDefault();
    this.validateForm.reset();
    for (const key in this.validateForm.controls) {
      this.validateForm.controls[key].markAsPristine();
    }
  }
  // Event method for setting up form in validation
  getFormControl(name) {
    return this.validateForm.controls[name];
  }
  // For initiating the section element with data
  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
  }

  onUploadStateChanged(state: boolean) {}
}
