// capitalize.pipe.ts
import {Pipe, PipeTransform} from '@angular/core';

import {Product} from "../models";

@Pipe({name: 'paymentstatus'})
export class PaymentStatusPipe implements PipeTransform {
    constructor() {
    }

    transform(value): any {
        switch (+value) {
            case 1:
                return {value: 1, label: 'Unpaid'};
            case 2:
                return {value: 2, label: 'Partially Paid'};
            case 3:
                return {value: 3, label: 'Unpaid'};
            case 4:
                return {value: 4, label: 'Not applicable'};
            default:
                return {value: value, label: value};
        }
    }
}
