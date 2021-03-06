import {Injectable} from '@angular/core';
import {Router, CanActivate} from '@angular/router';
import {JwtHelper} from 'angular2-jwt';
import {LoginModalService} from "../services/ui/loginModal.service";
import {AuthService} from "../services";

@Injectable()
export class IsLoggedIn implements CanActivate {
    jwtHelper: JwtHelper = new JwtHelper();


    constructor(private router: Router,
                private authService: AuthService,
                private loginModalService: LoginModalService) {
    }

    canActivate() {

        try {
            const token = this.authService.getToken();
            if (token) {
                const jwtPayload = this.jwtHelper.decodeToken(token);

                if (jwtPayload) {
                    return true;

                } else {
                    this.loginModalService.showLoginModal(true);
                    this.router.navigate(['/']);
                    return false;
                }

            } else {
                this.loginModalService.showLoginModal(true);

                this.router.navigate(['/']);
                return false;

            }


        } catch (e) {
            this.router.navigate(['/']);
            return false;
        }
    }
}
