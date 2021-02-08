import {Injectable} from '@angular/core';
import {Router, CanActivate, ActivatedRouteSnapshot, CanActivateChild} from '@angular/router';
import {AccessControlPipe} from "../../../pipes/accessControl.pipe";


@Injectable({
    providedIn: 'root'
})
export class AccessControl implements CanActivate, CanActivateChild {

    constructor(private router: Router, private accessControlPipe: AccessControlPipe) {
    }

    canActivate(route: ActivatedRouteSnapshot) {

        let accessData = route.data["accessData"];
        try {
            if (this.accessControlPipe.transform(accessData, true)) {
                return true;
            } else {
                this.router.navigate(['/']);
                return false;
            }
        } catch (e) {
            this.router.navigate(['/']);
            return false;
        }
    }

    canActivateChild(route: ActivatedRouteSnapshot) {
        return this.canActivate(route);
    }
}
