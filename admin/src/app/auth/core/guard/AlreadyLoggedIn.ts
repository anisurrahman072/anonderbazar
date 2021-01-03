import {Injectable} from '@angular/core';
import {Router, CanActivate} from '@angular/router';
import {JwtHelperService} from '@auth0/angular-jwt';

@Injectable()
export class AlreadyLoggedIn implements CanActivate {
    jwtHelper: JwtHelperService = new JwtHelperService();
    
    constructor(private router: Router) {
    }
    
    canActivate() {
        try {
            const token = localStorage.getItem('token');
            if (token) {
                this.router.navigate(['/dashboard']);
                return false;
            } else {
                return true;
            }
        } catch (e) {
            // this.router.navigate(['/auth/login']);
            return true;
        }
    }
}
