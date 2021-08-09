import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {NzNotificationService} from "ng-zorro-antd";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {RoleManagementService} from "../../../../services/role-management.service";
import {forkJoin} from "rxjs";

@Component({
    selector: 'app-role-management-edit',
    templateUrl: './role-management-edit.component.html',
    styleUrls: ['./role-management-edit.component.css']
})
export class RoleManagementEditComponent implements OnInit {

    validateForm: FormGroup;
    _isSpinning: any = false;
    submitting: boolean = false;
    sub: any;
    id: any;
    groupData: any;

    allGroupsPermissions: any = [];
    perm_labels: any = {};
    perm_keys: any = {};

    permissionKeysArray: any = [];
    permissionLabelsArray: any = [];

    isCheckedArray: any = {};

    isDisabled = null;
    isDismissed: Boolean = false;

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private _notification: NzNotificationService,
        private fb: FormBuilder,
        private roleManagementService: RoleManagementService,
    ) {
    }

    ngOnInit() {
        this.sub = this.route.params.subscribe(params => {
            this._isSpinning = true;
            this.id = +params['id'];

            forkJoin([this.roleManagementService.getGroupsById(this.id), this.roleManagementService.getAllGroupsPermissions()])
                .subscribe(result => {
                    /** First API call */
                    this.groupData = result[0].data;
                    console.log("this.groupData: ", this.groupData);
                    if (!this.groupData) {
                        this._isSpinning = false;
                        this._notification.error('Failed!', 'Something went wrong');
                        return;
                    }
                    this.permissionKeysArray = this.groupData.accessList;

                    let payload = {
                        name: this.groupData.name,
                        description: this.groupData.description
                    }
                    let grpName = this.groupData.name;
                    if (grpName === 'admin' || grpName === 'owner' || grpName === 'customer') {
                        this.isDisabled = 'disabled';
                    }

                    this.validateForm.patchValue(payload);
                    this._isSpinning = false;

                    /** Second API call */
                    /** Getting all the available permissions in this project and creating an array which will contain only already_added permissions for this group */
                    this.allGroupsPermissions = result[1].data;
                    console.log("this.allGroupsPermissions: ", this.allGroupsPermissions);
                    this.allGroupsPermissions.forEach(section => {
                        this.perm_labels[section.perm_section] = section.perm_labels.split(',');
                        this.perm_keys[section.perm_section] = section.perm_keys.split(',');

                        let checkArray = [];
                        for (let i = 0; i < this.perm_keys[section.perm_section].length; i++) {
                            if (this.permissionKeysArray && this.permissionKeysArray.length > 0 && this.permissionKeysArray.includes(this.perm_keys[section.perm_section][i])) {
                                checkArray.splice(i, 0, true);
                                this.permissionLabelsArray.push(this.perm_labels[section.perm_section][i]);
                            } else {
                                checkArray.splice(i, 0, false);
                            }
                        }
                        this.isCheckedArray[section.perm_section] = checkArray;
                    })

                }, error => {
                    this._isSpinning = false;
                    this._notification.error('Failed!', 'Something went wrong');
                    console.log('group edit error: ', error);
                })

            /*this.roleManagementService.getGroupsById(this.id)
                .subscribe(result => {
                    this.groupData = result.data;
                    console.log("this.groupData: ", this.groupData);
                    if (!this.groupData) {
                        this._isSpinning = false;
                        this._notification.error('Failed!', 'Something went wrong');
                        return;
                    }
                    this.permissionKeysArray = this.groupData.accessList;

                    let payload = {
                        name: this.groupData.name,
                        description: this.groupData.description
                    }
                    let grpName = this.groupData.name;
                    if (grpName === 'admin' || grpName === 'owner' || grpName === 'customer') {
                        this.isDisabled = 'disabled';
                    }

                    this.validateForm.patchValue(payload);
                    this._isSpinning = false;
                }, error => {
                    this._isSpinning = false;
                    this._notification.error('Failed!', 'Something went wrong');
                    console.log('group edit error: ', error);
                })

            /!** Getting all the available permissions in this project and creating an array which will contain only already_added permissions for this group *!/
            this.roleManagementService.getAllGroupsPermissions()
                .subscribe(result => {
                this.allGroupsPermissions = result.data;
                console.log("this.allGroupsPermissions: ", this.allGroupsPermissions);
                this.allGroupsPermissions.forEach(section => {
                    this.perm_labels[section.perm_section] = section.perm_labels.split(',');
                    this.perm_keys[section.perm_section] = section.perm_keys.split(',');

                    let checkArray = [];
                    for (let i = 0; i < this.perm_keys[section.perm_section].length; i++) {
                        if (this.permissionKeysArray && this.permissionKeysArray.length > 0 && this.permissionKeysArray.includes(this.perm_keys[section.perm_section][i])) {
                            checkArray.splice(i, 0, true);
                            this.permissionLabelsArray.push(this.perm_labels[section.perm_section][i]);
                        } else {
                            checkArray.splice(i, 0, false);
                        }
                    }
                    this.isCheckedArray[section.perm_section] = checkArray;
                    console.log("Assss: ", );
                })
            })*/
        })

        this.validateForm = this.fb.group({
            name: ['', [Validators.required]],
            description: ['', [Validators.required]],
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
                this._notification.error('Nothing', 'Select at least one permission for this group or you can delete this group from the list view');
                this._isSpinning = false;
                return;
            } else {
                formData.append('permissionKeysArray', JSON.stringify(this.permissionKeysArray));
            }
        }

        this.roleManagementService.groupUpdate(formData, this.id).subscribe(result => {
            this.submitting = false;
            this._notification.success('Updated', "Group updated Successfully");
            this._isSpinning = false;
            this.resetForm(null);
            this.permissionKeysArray = [];
            this.permissionLabelsArray = [];
            this.router.navigate(['/dashboard/role-management']);
        }, error => {
            this.submitting = false;
            this._isSpinning = false;
            this._notification.error('Error!', "Error occurred while updating the group!");
            console.log('group update error: ', error);
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
        if (this.permissionKeysArray && this.permissionKeysArray.length > 0 && this.permissionKeysArray.includes(value)) {
            let index = this.permissionKeysArray.indexOf(value);
            this.permissionKeysArray.splice(index, 1);
        } else {
            this.permissionKeysArray.push(value);
        }
    }

    /** Method called to add checked box's permission labels to an array to show the selected labels */
    addToLabelArray(value) {
        if (this.permissionLabelsArray && this.permissionLabelsArray.length > 0 && this.permissionLabelsArray.includes(value)) {
            let index = this.permissionLabelsArray.indexOf(value);
            this.permissionLabelsArray.splice(index, 1);
        } else {
            this.permissionLabelsArray.push(value);
        }
    }

}
