import {Injectable} from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class FormValidatorService {

    constructor() {
    }

    static phoneNumberValidator(control) {
        if (RegExp('^(?:\\+88|01)?(?:\\d{11}|\\d{13})$').test(control.value)) {
            return null;
        } else {
            return {'phoneNumber': true};
        }
    }

    static emailValidator(control) {
        if (control.value.match(/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/)) {
            return null;
        } else {
            return {'email': true};
        }
    }
}
