// capitalize.pipe.ts

import {Pipe, PipeTransform} from '@angular/core';
import {GLOBAL_CONFIGS} from "../../environments/global_config";

@Pipe({name: 'statustype'})
export class SuborderTypePipe implements PipeTransform {

    private statusOptions = GLOBAL_CONFIGS.ORDER_STATUSES_KEY_VALUE;

    getStatusLabel(statusCode) {

        if (typeof this.statusOptions[statusCode] !== 'undefined') {
            return this.statusOptions[statusCode];
        }
        return 'Unrecognized Status';
    }

    transform(value: number, args: string[]): any {
/*        // if (!value) return value;

        if (value === 1) {
            return 'Pending'
        } else if (value === 2) {
            return 'Processing'
        } else if (value === 3) {
            return 'Delivered'
        } else if (value === 4) {
            return ' Canceled'
        }*/

        return this.getStatusLabel(value);
    }
}
