import {Component, OnInit} from "@angular/core";
import {AreaService} from "../../../services/area.service";
import {ActivatedRoute, Router} from "@angular/router";
import {UserService} from "../../../services/user.service";
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";


@Component({
    selector: 'app-signup',
    templateUrl: './signup.component.html',
    styleUrls: ['./signup.component.scss']
})

export class SignupComponent implements OnInit {
    divisionSearchOptions: any;
    zilaSearchOptions: any;
    upazilaSearchOptions: any;
    genderSearchOptions = [
        {label: 'Male', value: 'male'},
        {label: 'Female', value: 'female'},
        {label: 'Not Specified', value: 'not-specified'}
    ];
    validateForm: FormGroup;
    
    constructor(private route: ActivatedRoute,
                private router: Router,
                private areaService: AreaService,
                private userService: UserService,
                private fb: FormBuilder) {
        this.validateForm = this.fb.group({
            username: ['', [Validators.required]],
            password: ['', [Validators.required]],
            confirmPassword: ['', [Validators.required]],
            email: ['', [Validators.required]],
            first_name: ['', [Validators.required]],
            last_name: ['', [Validators.required]],
            phone: ['', [Validators.required]],
            gender: ['', [Validators.required]],
            upazila_id: ['', [Validators.required]],
            zila_id: ['', [Validators.required]],
            division_id: ['', [Validators.required]],
        });
    }
    
    resetForm($event: MouseEvent) {
        $event.preventDefault();
        this.validateForm.reset();
        for (const key in this.validateForm.controls) {
            this.validateForm.controls[key].markAsPristine();
        }
    }
    
    getFormControl(name) {
        return this.validateForm.controls[name];
    }
    
    submitForm = ($event, value) => {
        const formData: FormData = new FormData();
        formData.append('username', value.username);
        formData.append('password', value.password);
        formData.append('confirmPassword', value.password);
        formData.append('email', value.email);
        formData.append('first_name', value.first_name);
        formData.append('last_name', value.last_name);
        formData.append('phone', value.phone);
        formData.append('gender', value.gender);
        formData.append('group_id', '2');
        formData.append('upazila_id', value.upazila_id);
        formData.append('zila_id', value.zila_id);
        formData.append('division_id', value.division_id);
        formData.append('address', " ");
        formData.append('permanent_address', " ");
        formData.append('national_id', " ");
        formData.append('father_name', " ");
        formData.append('mother_name', " ");


        formData.append('active', '1');
        
        this.userService.insert(formData)
                .subscribe((result => {
                    if (result) {
                        return result;
                    } else {
                        return ("Error happened")
                    }
                }),
            );
    }
    
    ngOnInit(): void {
        this.areaService.getAllDivision().subscribe(result => {
            this.divisionSearchOptions = result;
        });
    }
    
    divisionChange($event) {
        var divisionId = $event.target.value;
        this.areaService.getAllZilaByDivisionId(divisionId).subscribe(result => {
            this.zilaSearchOptions = result;
        });
    }
    
    zilaChange($event) {
        var zilaId = $event.target.value;
        this.areaService.getAllUpazilaByZilaId(zilaId).subscribe(result => {
            this.upazilaSearchOptions = result;
        });
    }
    
}
