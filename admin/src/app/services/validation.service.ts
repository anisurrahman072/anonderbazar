import {FormControl} from "@angular/forms";
import {Injectable} from "@angular/core";
import {Observable} from "rxjs";
import {UserService} from "./user.service";
import "rxjs/add/observable/timer";
import "rxjs/add/operator/switchMap";
import "rxjs-compat/add/operator/map";

@Injectable({
  providedIn: 'root'
})
export class ValidationService {


  constructor(private userService: UserService) {

  }

  emailValidator(control: FormControl): { [s: string]: boolean } {
    const EMAIL_REGEXP = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (!control.value) {
      return {required: true}
    } else if (!EMAIL_REGEXP.test(control.value)) {
      return {error: true, email: true};
    }
  };

  phoneValidator(control: FormControl): { [s: string]: boolean } {
    const PHONE_REGEXP = /^(?:\+88|01)?(?:\d{11}|\d{13})$/im;
    if (!control.value) {
      return {required: true}
    } else if (!PHONE_REGEXP.test(control.value)) {
      return {error: true, phone: true};
    }
  };

  userNameTakenValidator = (control: FormControl): any => {
    return Observable.timer(200).switchMap(() => {
      return this.userService.checkUsername(control.value).map(res => {
        if (res && res.success) {
          return null;
        }
        return {error: true, taken: true};
      });
    });
  };
  emailTakenValidator = (control: FormControl): any => {
    return Observable.timer(200).switchMap(() => {
      return this.userService.checkEmail(control.value).map(res => {
        if (res && res.success) {
          return null;
        }
        return {error: true, taken: true};
      });
    });
  };
  phoneTakenValidator = (control: FormControl): any => {
    return Observable.timer(200).switchMap(() => {
      return this.userService.checkPhone(control.value).map(res => {
        if (res && res.success) {
          return null;
        }
        return {error: true, taken: true};
      });
    });
  };


}
