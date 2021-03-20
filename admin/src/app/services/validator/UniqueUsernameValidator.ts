import {AbstractControl, AsyncValidator, ValidationErrors} from "@angular/forms";
import {Injectable} from "@angular/core";
import {Observable} from "rxjs/Observable";
import {catchError, map} from "rxjs/operators";
import {UserService} from "../user.service";
import {of} from "rxjs";

@Injectable({providedIn: 'root'})
export class UniqueUsernameValidator implements AsyncValidator {
    constructor(private userService: UserService) {
    }

    validate(
        ctrl: AbstractControl
    ): Promise<ValidationErrors | null> | Observable<ValidationErrors | null> {
        return this.userService.checkUsername(ctrl.value).pipe(
            map(res => (res.success === false ? {error: true, taken: true} : null)),
            catchError(() => of({error: true, taken: true}) )
        );
    }
}
