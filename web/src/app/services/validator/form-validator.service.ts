import {Injectable} from '@angular/core';
import {FormControl} from "@angular/forms";
import {Observable} from "rxjs";
import {AuthService} from "../auth.service";

@Injectable()
export class FormValidatorService {

    constructor(private authService: AuthService,) {
    }

    static phoneNumberValidator(control) {
        if (RegExp('(^(01){1}[3-9]{1}\\d{8})$').test(control.value)) {
            return null;
        } else {
            return {'phoneNumber': true};
        }
    }

    static emailValidator(control) {
        if (!control.value) {
            return null;
        }
        else if (RegExp(/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/).test(control.value)) {
            return null;
        } else {
            return {'email': true};
        }
    }

    static passwordValidator(control) {
        if (RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})').test(control.value)) {
            return null;
        } else {
            return {'password': true};
        }
    }

    phoneNumberUniqueValidator = (control: FormControl): any => {
        return Observable.timer(20).switchMap(() => {
            let formData = {
                username: control.value
            };
            return this.authService.usernameUnique(formData).map(res => {
                if (!res.isunique) {
                    return {phoneNumberUnique: true, error: true};
                }
                return null;
            });
        });
    };


}
