// capitalize.pipe.ts

import {Pipe, PipeTransform} from '@angular/core';

@Pipe({name: 'paymentApprovalStatus', pure: false})
export class PaymentApprovalStatusPipe implements PipeTransform {
    private isAddedInCart: any;

    constructor() {
    }

    transform(value): any {
        switch (+value) {
            case 1:
                return 'Pending';
            case 2:
                return 'Approved';
            case 3:
                return 'Rejected';
            default:
                return value;
        }
    }
}
