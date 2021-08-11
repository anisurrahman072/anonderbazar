import {Pipe, PipeTransform} from '@angular/core';
import {AuthService} from "../services/auth.service";

@Pipe({name: 'accessControl'})
export class AccessControlPipe implements PipeTransform {
    constructor(private authService: AuthService) {
    }

    transform(value: string, args: boolean): boolean {
        return this.authService.getAccessControlList().includes(value);
    }
}
