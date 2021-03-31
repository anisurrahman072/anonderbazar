import {AbstractControl, AsyncValidator, FormControl, ValidationErrors} from "@angular/forms";
import {Injectable} from "@angular/core";
import {Observable} from "rxjs/Observable";
import {catchError, debounceTime, distinctUntilChanged, first, map, switchMap} from "rxjs/operators";
import {UserService} from "../user.service";
import {of} from "rxjs";

@Injectable({providedIn: 'root'})
export class UniquePhoneValidator implements AsyncValidator {
    private excludeId = 0;
    constructor(private userService: UserService) {
    }
    public setExcludeId(excludeId: number){
        this.excludeId = excludeId;
    }
    validate(
        ctrl: AbstractControl
    ): Promise<ValidationErrors | null> | Observable<ValidationErrors | null> {

        return ctrl.valueChanges
            .pipe(
                debounceTime(200),
                distinctUntilChanged(),
                switchMap(value => this.userService.checkPhone(value, this.excludeId)),
                map(res => (res.isunique === false ? {error: true, taken: true} : null)),
                catchError(() => of({error: true, taken: true})),
                first()
            );

    }
}
