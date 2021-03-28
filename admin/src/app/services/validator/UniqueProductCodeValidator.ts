import {AbstractControl, AsyncValidator, ValidationErrors} from "@angular/forms";
import {Injectable} from "@angular/core";
import {Observable} from "rxjs/Observable";
import {catchError, debounceTime, distinctUntilChanged, first, map, switchMap} from "rxjs/operators";
import {of} from "rxjs";
import {ProductService} from "../product.service";

@Injectable({providedIn: 'root'})
export class UniqueProductCodeValidator implements AsyncValidator {
    constructor(private productService: ProductService) {
    }

    validate(
        ctrl: AbstractControl
    ): Promise<ValidationErrors | null> | Observable<ValidationErrors | null> {
        return ctrl.valueChanges
            .pipe(
                debounceTime(200),
                distinctUntilChanged(),
                switchMap(value => this.productService.uniqueCheckProductCode(value)),
                map(res => (res.isunique === false ? {error: true, taken: true} : null)),
                catchError(() => of({error: true, taken: true})),
                first()
            );

    }
}
