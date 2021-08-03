import {Injectable} from '@angular/core';
import {Router, CanActivate, ActivatedRoute} from '@angular/router';
import {WarehouseService} from '../../../services/warehouse.service';
import {JwtHelperService} from "@auth0/angular-jwt";

@Injectable({
    providedIn: 'root'
})
export class GroupGuard implements CanActivate {

    groups = ['admin', 'owner', 'craftsman', 'supplier', 'sales'];

    jwtHelper: JwtHelperService = new JwtHelperService();

    constructor(private router: Router, private route: ActivatedRoute, private warehouseService: WarehouseService) {
    }

    canActivate() {
        const token = localStorage.getItem('token');
        const jwtPayload = this.jwtHelper.decodeToken(token);

        if (jwtPayload.group_id == 'admin') {
            return true;

        } else if (jwtPayload.group_id == 'owner') {
            if (jwtPayload.isWarehouseActivated) {
                return true;
            }
            this.router.navigate(['/auth/warehouse-entry']);
            localStorage.removeItem('token');
            return false;

        } else if (jwtPayload.group_id == 'craftsman') {
            return true;

        } else if (jwtPayload.group_id == 'supplier') {
            return true;

        } else if (jwtPayload.group_id == 'sales') {
            return true;

        } else if (jwtPayload.group_id && jwtPayload.group_id !== 'customer') {
            return true;

        } else {
            this.router.navigate(['/auth/login']);
            return false;
        }
        // if (jwtPayload.group_id === 'customer') {
        //   this.router.navigate(['/userpanel']);
        //   return false;
        // }
        // not logged in so redirect to login page
        // this.router.navigate(['/auth/login']);
        // return false;
    }
}
