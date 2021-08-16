import {Component, OnInit} from '@angular/core';
import {RoleManagementService} from "../../../../services/role-management.service";
import {Router} from "@angular/router";
import {NzNotificationService} from "ng-zorro-antd";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {ValidationService} from "../../../../services/validation.service";

@Component({
    selector: 'app-role-management-create',
    templateUrl: './role-management-create.component.html',
    styleUrls: ['./role-management-create.component.css']
})
export class RoleManagementCreateComponent implements OnInit {
    _isSpinning: any = false;
    allGroupsPermissions: any = [];
    perm_labels: any = {};
    perm_keys: any = {};
    validateForm: FormGroup;
    submitting: boolean = false;
    permissionKeysArray: any = [];
    permissionLabelsArray: any = [];

    isDismissed: Boolean = false;

    constructor(
        private roleManagementService: RoleManagementService,
        private router: Router,
        private _notification: NzNotificationService,
        private fb: FormBuilder,
        private validationService: ValidationService,
    ) {
        this.validateForm = this.fb.group({
            name: [
                '',
                [Validators.required],
                [this.validationService.groupNameExistsValidator.bind(this)]
            ],
            description: ['', [Validators.required]],
        })
    }

    ngOnInit() {
        this.roleManagementService.getAllGroupsPermissions().subscribe(result => {
            this.allGroupsPermissions = result.data;
            this.allGroupsPermissions.forEach(section => {
                this.perm_labels[section.perm_section] = section.perm_labels.split(',');
                this.perm_keys[section.perm_section] = section.perm_keys.split(',');
            })
        })
    }

    /** Event method for submitting the form */
    submitForm = ($event, value) => {
        this.submitting = true;
        $event.preventDefault();
        this._isSpinning = true;

        for (const key in this.validateForm.controls) {
            this.validateForm.controls[key].markAsDirty();
        }

        let formData = new FormData();
        formData.append('name', value.name);
        formData.append('description', value.description);

        if (this.permissionKeysArray) {
            if (this.permissionKeysArray.length <= 0) {
                this._notification.error('Nothing', 'Select at least one permission for this group');
                this._isSpinning = false;
                return;
            } else {
                formData.append('permissionKeysArray', JSON.stringify(this.permissionKeysArray));
            }
        }

        this.roleManagementService.groupInsert(formData).subscribe(result => {
            this.submitting = false;
            this._notification.success('Success', "New Group Created Successfully");
            this._isSpinning = false;
            this.resetForm(null);
            this.permissionKeysArray = [];
            this.router.navigate(['/dashboard/role-management']);
        }, error => {
            this.submitting = false;
            this._isSpinning = false;
            this._notification.error('Error!', "Error occurred while creating a new group!");
            console.log('group creation error: ', error);
        });
    }

    /** Event method for resetting the form */
    resetForm($event: MouseEvent) {
        $event ? $event.preventDefault() : null;
        this.validateForm.reset();
        for (const key in this.validateForm.controls) {
            this.validateForm.controls[key].markAsPristine();
        }
    }

    /** Event method for setting up form in validation */
    getFormControl(name) {
        return this.validateForm.controls[name];
    }

    /** Method called to add checked box's permission keys to an array */
    addToKeysArray(value) {
        if (this.permissionKeysArray.includes(value)) {
            let index = this.permissionKeysArray.indexOf(value);
            this.permissionKeysArray.splice(index, 1);
        } else {
            this.permissionKeysArray.push(value);
        }
    }

    /** Method called to add checked box's permission labels to an array to show the selected labels */
    addToLabelArray(value) {
        if (this.permissionLabelsArray.includes(value)) {
            let index = this.permissionLabelsArray.indexOf(value);
            this.permissionLabelsArray.splice(index, 1);
        } else {
            this.permissionLabelsArray.push(value);
        }
    }

}
