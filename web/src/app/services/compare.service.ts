import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import {AppSettings} from '../config/app.config';
import {JwtHelper} from 'angular2-jwt';
import {HttpClient, HttpErrorResponse} from "@angular/common/http";
import {UserService} from "./user.service";
import {catchError} from "rxjs/operators";
import {Cart, Product} from "../models";
import {of} from "rxjs/observable/of";

@Injectable()
export class CompareService {
    jwtHelper: JwtHelper = new JwtHelper();
    public token: string;

    constructor(private http: HttpClient, private userService: UserService) {
        // set token if saved in local storage
        // const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        // this.token = currentUser && currentUser.token;
    }

    getAllCompare(): Product[] {
        const compareProducts = localStorage.getItem('compare');
        if (compareProducts) {
            return JSON.parse(compareProducts);
        } else {
            return [];
        }
    }

    setFullCompare(products: Product[]): boolean {
        localStorage.setItem('compare', JSON.stringify(products));
        return true;
    }

    addToCompare(product: Product) {
        let compareProducts: Product[] = this.getAllCompare();
        compareProducts.push(product);
        this.setFullCompare(compareProducts);
    }

    removeAllcompare() {
        localStorage.removeItem('compare');
    }

    removeFromCompare(product: Product) {
        let compareProducts = this.getAllCompare(); 
        if (compareProducts) {
            this.setFullCompare(compareProducts.filter(x=>x.id!==product.id)) 
        }
    }


}
