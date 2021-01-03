// capitalize.pipe.ts

import {Pipe, PipeTransform} from '@angular/core';

@Pipe({name: 'statustype'})
export class SuborderTypePipe implements PipeTransform {
  transform(value: number, args: string[]): any {
    // if (!value) return value;
    
      if (value === 1) {
          return 'Pending'
      }
      else if (value === 2) {
          return 'Processing'
      }
      else if (value === 3) {
          return 'Delivered'
      }
      else if (value === 4) {
          return ' Canceled'
      }
    
  }
}
