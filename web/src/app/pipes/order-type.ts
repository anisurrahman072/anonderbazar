// capitalize.pipe.ts

import {Pipe, PipeTransform} from '@angular/core';

@Pipe({name: 'ordertype'})
export class OrderTypePipe implements PipeTransform {
    transform(value: number): any {
        // if (!value) return value;

        if (value === 1) {
            return 'Regular payment'
        } else {
            return 'Partial payment'
        }

    }
}
