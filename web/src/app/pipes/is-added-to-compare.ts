// capitalize.pipe.ts

import {Pipe, PipeTransform} from '@angular/core';
import * as fromStore from "../state-management";
import {Store} from "@ngrx/store";
import {map} from "rxjs/operator/map";
import {Product} from "../models";

@Pipe({name: 'isaddedtocompare', pure: false})
export class IsAddedToComparePipe implements PipeTransform {
    private isCompared: any;
    
    constructor(private store: Store<fromStore.HomeState>) {
        // this.compare$ = this.store.select<any>(fromStore.getCompare);
    }
    
    transform(value: Product[], args: Product): any {
        this.isCompared = value.filter(p => {
            return p.id === args.id
        });
        return this.isCompared.length ? true : false;
        
    }
}
