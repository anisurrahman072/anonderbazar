import {Injectable} from '@angular/core';
import {Router, CanActivate} from '@angular/router';
import {JwtHelperService} from '@auth0/angular-jwt';


@Injectable({
    providedIn: 'root'
})
export class IsAdmin implements CanActivate {


    constructor(private router: Router, public jwtHelper: JwtHelperService) {
    }

    canActivate() {
        const token = localStorage.getItem('token');
        const jwtPayload = this.jwtHelper.decodeToken(token);

        try {
            if (jwtPayload.group_id === 'admin') {
                return true;
            } else {
                this.router.navigate(['/dashboard']);
                return false;
            }
        } catch (e) {
            this.router.navigate(['/dashboard']);
            return false;
        }
    }
}
