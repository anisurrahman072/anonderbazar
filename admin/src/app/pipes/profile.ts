// capitalize.pipe.ts

import {Pipe, PipeTransform} from '@angular/core';

@Pipe({name: 'profiletype'})
export class ProfilePipe implements PipeTransform {
  transform(value: number, args: string[]): any {
    // if (!value) return value;
    
    if (value === 0) {
      return 'Not Active'
    } else {
      if (value === 1) {
        return 'Active'
        
      } else {
        return 'N/a'
      }
    }
    
  }
}
