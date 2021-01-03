// capitalize.pipe.ts

import {Pipe, PipeTransform} from '@angular/core';

@Pipe({name: 'varianttype'})
export class VariantTypePipe implements PipeTransform {
  transform(value: number, args: string[]): any {
    // if (!value) return value;
    
    if (value === 0) {
      return 'abstract'
    } else {
      if (value === 1) {
        return 'material'
        
      } else {
        return 'n/a'
      }
    }
    
  }
}
