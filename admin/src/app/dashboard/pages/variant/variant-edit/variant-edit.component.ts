import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {Subscription} from 'rxjs';
import {NzNotificationService} from 'ng-zorro-antd';
import {VariantService} from '../../../../services/variant.service';

@Component({
    selector: 'app-variant-edit',
    templateUrl: './variant-edit.component.html',
    styleUrls: ['./variant-edit.component.css']
})
export class VariantEditComponent implements OnInit, OnDestroy{

    id: number;
    data: any;
    sub: Subscription;
    typeSearchOptions = [
        {label: 'Yes', value: 1},
        {label: 'No', value: 0}

    ];

    validateForm: FormGroup;
    //Event method for submitting the form
    submitForm = ($event, value) => {
        $event.preventDefault();
        for (const key in this.validateForm.controls) {
            this.validateForm.controls[key].markAsDirty();
        }
        const formData: FormData = new FormData();
        formData.append('name', value.name);
        formData.append('type', value.type);
        this.variantService.update(this.id, formData)
            .subscribe(result => {

                this._notification.create('success', 'Update successful', this.data.name);
                this.router.navigate(['/dashboard/variant/details/', this.id]);
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

//Event method for setting up form in validation
    getFormControl(name) {
        return this.validateForm.controls[name];
    }

    constructor(private router: Router, private route: ActivatedRoute, private _notification: NzNotificationService,
                private fb: FormBuilder, private variantService: VariantService) {
        this.validateForm = this.fb.group({
            name: ['', [Validators.required]],
            type: ['', [Validators.required]]
        });
    }
 // init the component
    ngOnInit() {
        this.sub = this.route.params.subscribe(params => {
            this.id = +params['id']; // (+) converts string 'id' to a number
            this.variantService.getById(this.id)
                .subscribe(result => {
                    this.data = result;
                    this.validateForm.patchValue(this.data);
                });
        });

    }

    ngOnDestroy(): void {
        this.sub ? this.sub.unsubscribe() : '';

    }

}
