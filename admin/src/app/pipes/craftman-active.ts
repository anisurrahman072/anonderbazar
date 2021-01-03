// capitalize.pipe.ts

import {Pipe, PipeTransform} from '@angular/core';

@Pipe({name: 'craftsmantype'})
export class CraftsmanPipe implements PipeTransform {
  transform(value: number, args: string[]): any {
    // if (!value) return value;
    
    if (value === 0) {
      return 'নাই'
    } else {
      if (value === 1) {
        return 'আছে'
        
      } else {
        return 'n/a'
      }
    }
    
  }
}
