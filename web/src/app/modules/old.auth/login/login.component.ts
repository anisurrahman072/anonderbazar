import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {Router} from "@angular/router";
import {AuthService} from "../../../services/auth.service";

import {Store} from "@ngrx/store";

import {NgProgress} from "@ngx-progressbar/core";
import * as fromStore from "../../../state-management";
import {LoginModalService} from "../../../services/ui/loginModal.service";


@Component({
    selector: 'app-front-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
    
    validateForm: FormGroup;

    
    
    constructor(private fb: FormBuilder,
                private router: Router,
                private progress: NgProgress,
                private store: Store<fromStore.HomeState>,
                private loginModalService: LoginModalService,
                private authService: AuthService) {
        this.validateForm = this.fb.group({
            userName: ['', [Validators.required]],
            password: ['', [Validators.required]],
            
        });
    }
    
    ngOnInit(): void {
        
        this.progress.complete('loadingModal');
        
    }
    
    
    submitForm = ($event, value) => {
        $event.preventDefault();
        for (const key in this.validateForm.controls) {
            this.validateForm.controls[key].markAsDirty();
        }
        this.authService.login(value.userName, value.password)
            .subscribe(result => {
                    
                    if (result && result.token) {
                        this.loginModalService.showLoginModal(false);
                        
                        // this.store.dispatch(<Action>{type: CURRENTUSER, payload: result.user});
                        
                        localStorage.setItem('currentUser', JSON.stringify({
                            username: result.username,
                            token: result.token
                        }));
                        localStorage.setItem('token', result.token);
                        
                        this.store.dispatch(new fromStore.LoadCurrentUser());
                        this.store.dispatch(new fromStore.LoadCart());
                        this.store.dispatch(new fromStore.LoadFavouriteProduct());

                        this.router.navigate(['/']);
                    } else {
                    
                    }
                },
                (err) => {
                  
                });
        
        
    }
    
    resetForm($event: MouseEvent) {
        $event.preventDefault();
        this.validateForm.reset();
        for (const key in this.validateForm.controls) {
            this.validateForm.controls[key].markAsPristine();
        }
    }
    
}
