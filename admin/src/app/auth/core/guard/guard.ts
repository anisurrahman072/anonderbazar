import {Injectable} from '@angular/core';
import {Router, CanActivate} from '@angular/router';
import {JwtHelperService} from '@auth0/angular-jwt';


@Injectable()
export class AuthGuard implements CanActivate {
    jwtHelper: JwtHelperService = new JwtHelperService();
    
    constructor(private router: Router) {
    }
    
    canActivate() {
        
        try {
            const token = localStorage.getItem('token');
            if (localStorage.getItem('currentUser') && token) {
                // if (!this.jwtHelper.isTokenExpired(token)) {
                //   return true;
                // }
                return true;
                
            }
            this.router.navigate(['/auth/login']);
            return false;
        } catch (e) {
            this.router.navigate(['/auth/login']);
            return false;
        }
    }
}
