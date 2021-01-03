import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AreaService } from '../../../services/area.service';
import { NzNotificationService } from 'ng-zorro-antd';
import { FileHolder, UploadMetadata } from 'angular2-image-upload';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { WarehouseService } from '../../../services/warehouse.service';
import { AuthService } from '../../../services/auth.service';
import { UserService } from '../../../services/user.service';
import { ValidationService } from "../../../services/validation.service";

@Component({
    selector: 'app-warehouse-entry',
    templateUrl: './warehouse-entry.component.html',
    styleUrls: ['./warehouse-entry.component.css']
})
export class WarehouseEntryComponent implements OnInit {
    validateForm: FormGroup;
    ImageFile: File;
    current = 0;
    index = 'first';
    @ViewChild('Image') Image;
    question_6_value = '1';
    question_7_value = '1';
    question_8_value = '1';
    private userID: any;
    divisionSearchOptions = [];
    zilaSearchOptions: any;
    upazilaSearchOptions: any;
    currentUser: any;
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
            { name: 'styles', groups: ['Styles', 'Format', 'Font', 'FontSize'] }
        ],
        removeButtons: 'Source,Save,Templates,Find,Replace,Scayt,SelectAll'
    };
    constructor(
        private router: Router,
        private authService: AuthService,
        private route: ActivatedRoute,
        private _notification: NzNotificationService,
        private fb: FormBuilder,
        private areaService: AreaService,
        private userService: UserService,
        private warehouseService: WarehouseService
    ) {
        this.validateForm = this.fb.group({
            name: ['', [Validators.required]],
            code: ['', [Validators.required]],
            employee_count: ['', [Validators.required]],
            license_no: ['', [Validators.required]],
            tin_no: ['', []],
            vat_no: ['', []],
            address: ['', [Validators.required]],
            division_id: [null, [Validators.required]],
            zila_id: [null, [Validators.required]],
            upazila_id: [null, [Validators.required]],
            postal_code: ['', [Validators.required]],
            phone: ['', [Validators.required]],
            email: ['', [Validators.required]],
            invoice_footer: ['', [Validators.required]],
            question_1: ['', [Validators.required]],
            question_2: ['', [Validators.required]],
            question_3: ['', [Validators.required]],
            question_4: ['', [Validators.required]],
            question_5: ['', [Validators.required]],
            question_6_value: ['', [Validators.required]],
            question_7_value: ['', [Validators.required]],
            question_8_value: ['', [Validators.required]],
            question_9: ['', [Validators.required]],
            logo: ['']
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
        formData.append('code', value.code);
        formData.append('phone', value.phone);
        formData.append('email', value.email);
        formData.append('employee_count', value.employee_count);
        formData.append('license_no', value.license_no);
        formData.append('tin_no', value.tin_no);
        formData.append('vat_no', value.vat_no);
        formData.append('country', "বাংলাদেশ");
        formData.append('division_id', value.division_id);
        formData.append('zila_id', value.zila_id);
        formData.append('upazila_id', value.upazila_id);
        formData.append('address', value.address);
        formData.append('postal_code', value.postal_code);
        formData.append('invoice_footer', value.invoice_footer);
        formData.append('question_1', value.question_1);
        formData.append('question_2', value.question_2);
        formData.append('question_3', value.question_3);
        formData.append('question_4', value.question_4);
        formData.append('question_5', value.question_5);
        formData.append('question_6_value', value.question_6_value);
        formData.append('question_7_value', value.question_7_value);
        formData.append('question_8_value', value.question_8_value);
        formData.append('question_9', value.question_9); 
        if (this.ImageFile) {
            formData.append('logo', this.ImageFile, this.ImageFile.name);
            formData.append('haslogo', 'true');
        } else {
            formData.append('haslogo', 'false');
        }
        
        this.warehouseService.insert(formData).subscribe(result => {
            if (result.id) {
                let updateData = { warehouse_id: result.id };
                this.userService.update(this.userID, updateData).subscribe(results => {
                    this._notification.create(
                        'success',
                        'নতুন দোকান সফলভাবে যুক্ত করা হয়েছে।',
                        result.name
                    );
                    this.router.navigate(['/auth/login']);
                });
            }
        });
    };
    //removing the image 

    onRemoved(file: FileHolder) {
        this.ImageFile = null;
    }
    //storing the image before upload

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
  //Event method for getting all the data for the page

    ngOnInit() {
        this.userID = this.authService.getCurrentUserId();
        if (this.userID == false) {
            this.router.navigate(['/auth/login']);
        }
        this.areaService.getAllDivision().subscribe(result => {
            this.divisionSearchOptions = result;
        });
    }
      //Method for division search change

    divisionSearchChange($event: string) {
        const query = encodeURI($event);
    }
      //Method for division change

    divisionChange($event) {
        const query = encodeURI($event);

        this.areaService.getAllZilaByDivisionId(query).subscribe(result => {
            this.zilaSearchOptions = result;
        });
    }
      //Method for zila change

    zilaChange($event) {
        const query = encodeURI($event); 
        this.areaService.getAllUpazilaByZilaId(query).subscribe(result => {
            this.upazilaSearchOptions = result; 
        });
    }
      //Method for zila search change

    zilaSearchChange($event: string) { }
      //Method for upazila search change

    upazilaSearchChange($event: string) { }


    pre(): void {
        this.current -= 1;
        this.changeContent();
    }

    next(): void {
        this.current += 1;
        this.changeContent();
    }

    done(): void {
    }

    changeContent(): void {
        switch (this.current) {
            case 0: {
                this.index = 'first';
                break;
            }
            case 1: {
                this.index = 'second';
                break;
            }
            case 2: {
                this.index = 'third';
                break;
            }
            default: {
                this.index = 'error';
            }
        }
    }
    get isHorizontal(): boolean {
        return this.validateForm.controls.formLayout && this.validateForm.controls.formLayout.value === 'horizontal';
      }

}
