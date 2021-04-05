import {AbstractControl, AsyncValidator, FormControl, ValidationErrors} from "@angular/forms";
import {Injectable} from "@angular/core";
import {Observable} from "rxjs/Observable";
import {catchError, debounceTime, distinctUntilChanged, first, map, switchMap} from "rxjs/operators";
import {of} from "rxjs";
import {BrandService} from "../brand.service";
import {FormGroup} from "@angular/forms/src/model";

@Injectable({providedIn: 'root'})
export class UniqueBrandNameValidator implements AsyncValidator {
    constructor(private brandService: BrandService) {
    }

    validate(
        ctrl: AbstractControl
    ): Promise<ValidationErrors | null> | Observable<ValidationErrors | null> {
        console.log('form group', ctrl.parent);
        console.log('values', ctrl.parent.value);
        const id = ctrl.parent.get('id') as FormControl;
        let existingId = 0;
        if(id && id.value){
            existingId = parseInt(id.value);
        }
        return ctrl.valueChanges
            .pipe(
                debounceTime(200),
                distinctUntilChanged(),
                switchMap(value => this.brandService.checkBrandNameUniqueNess(value, existingId)),
                map(res => (res.isunique === false ? {error: true, taken: true} : null)),
                catchError(() => of({error: true, taken: true})),
                first()
            );

    }
}
