import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {Subscription} from 'rxjs';
import {NzNotificationService} from 'ng-zorro-antd';
import {FileHolder, UploadMetadata} from 'angular2-image-upload';
import {GenreService} from "../../../../services/genre.service";

import {environment} from "../../../../../environments/environment";

@Component({
    selector: 'app-genre-edit',
    templateUrl: './genre-edit.component.html',
    styleUrls: ['./genre-edit.component.css']
})
export class GenreEditComponent implements OnInit, OnDestroy {
    id: number;
    data: any;
    sub: Subscription;
    ImageFileEdit: any[] = [];
    IMAGE_ENDPOINT = environment.IMAGE_ENDPOINT;
    validateForm: FormGroup;
    ImageFile: File;
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
    @ViewChild('Image') Image;
    // Event method for submitting the form
    submitForm = ($event, value) => {
        $event.preventDefault();
        for (const key in this.validateForm.controls) {
            this.validateForm.controls[key].markAsDirty();
        }
        const formData: FormData = new FormData();
        formData.append('name', value.name);
        formData.append('code', value.code);
        if (this.ImageFile) {
            formData.append('hasImage', 'true');
            
            formData.append('image', this.ImageFile, this.ImageFile.name);
        } else {
            formData.append('hasImage', 'false');
        }
        this.genreService.update(this.id, formData)
            .subscribe(result => {
                this._notification.create('success', 'Update successful', this.data.name);
                this.router.navigate(['/dashboard/genre/details/', this.id]);
            });
    }
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

    constructor(private router: Router, private route: ActivatedRoute,
                private _notification: NzNotificationService,
                private fb: FormBuilder,
                private genreService: GenreService) {
        this.validateForm = this.fb.group({
            name: ['', [Validators.required]],
            code:[''],
            details:[''],
            image: [null, []],
        });
    }

    ngOnInit() {
        this.sub = this.route.params.subscribe(params => {
            this.id = +params['id']; // (+) converts string 'id' to a number
            this.genreService.getById(this.id)
                .subscribe(result => {
                    this.data = result;
                    this.validateForm.patchValue(this.data);
                });
        });

    }
    // Event method for removing picture
    onRemoved(file: FileHolder) {
        this.ImageFile = null;
    }
    // Event method for storing imgae in variable
    onBeforeUpload = (metadata: UploadMetadata) => {
        this.ImageFile = metadata.file;
        return metadata;
    }

    ngOnDestroy(): void {
        this.sub ? this.sub.unsubscribe() : '';
    
    }


}
