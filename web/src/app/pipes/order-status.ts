// capitalize.pipe.ts
import {Pipe, PipeTransform} from '@angular/core';

import {Product} from "../models";

@Pipe({name: 'orderstatus'})
export class OrderStatusPipe implements PipeTransform {
    
    statusOptions = [
        ,
    
    
    ];
    
    constructor() {
    
    }
    
    transform(value): any {
        switch (+value) {
            case 1:
                return {value: 1, label: 'Awaiting', icon: 'primary'};
            case 2:
                return {value: 2, label: 'Processing', icon: 'accent'};
            case 11:
                return {value: 11, label: 'Delivered', icon: 'warn'};
            case 12:
                return {value: 12, label: 'Canceled', icon: 'basic'};
            default:
                return {value: value, label: value, icon: 'basic'};
        }
        
        
    }
}
