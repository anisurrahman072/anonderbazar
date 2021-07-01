// capitalize.pipe.ts

import {Pipe, PipeTransform} from '@angular/core';

@Pipe({name: 'refundStatus', pure: false})
export class RefundStatusPipe implements PipeTransform {
    private isAddedInCart: any;

    constructor() {
    }

    transform(value): any {
        switch (+value) {
            case 0:
                return 'Not Refunded';
            case 1:
                return 'Refunded';
            default:
                return value;
        }
    }
}
