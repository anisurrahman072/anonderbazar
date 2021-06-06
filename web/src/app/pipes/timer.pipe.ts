import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
    name: 'timer'
})
export class TimerPipe implements PipeTransform {
    transform(value: number, arg?: any) {
        return `${Math.floor(value / 60)}:${('0' + (value % 60)).slice(-2)}`;
    }
}
