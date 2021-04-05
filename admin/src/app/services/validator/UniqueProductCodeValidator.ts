import {AbstractControl, AsyncValidator, FormControl, ValidationErrors} from "@angular/forms";
import {Injectable} from "@angular/core";
import {Observable} from "rxjs/Observable";
import {catchError, debounceTime, distinctUntilChanged, first, map, switchMap} from "rxjs/operators";
import {of} from "rxjs";
import {ProductService} from "../product.service";

@Injectable({providedIn: 'root'})
export class UniqueProductCodeValidator implements AsyncValidator {
    private excludeId = 0;
    constructor(private productService: ProductService) {
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
                switchMap(value => this.productService.uniqueCheckProductCode(value, this.excludeId)),
                map(res => (res.isunique === false ? {error: true, taken: true} : null)),
                catchError(() => of({error: true, taken: true})),
                first()
            );

    }
}
