import {Injectable, OnInit} from '@angular/core';
import 'rxjs/add/operator/map';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs';

export interface filterList {
    searchTerm: string;
    categoryList: any[];
    subcategoryList: any[];
    brandList: any[];
    typeList: any[];
    priceRange: number[];
    brandFilterApply: boolean;
    categoryFilterApply: boolean;
    typeFilterApply: boolean;
    priceFilterApply: boolean;
}

const initialState: filterList = {
    searchTerm: '',
    categoryList: [],
    subcategoryList: [],
    brandList: [],
    typeList: [],
    priceRange: [1, 500000],
    brandFilterApply: false,
    categoryFilterApply: false,
    typeFilterApply: false,
    priceFilterApply: false
};

@Injectable()
export class FilterUiService {
    private filterSearchOption = new BehaviorSubject<filterList>(initialState);
    public currentFilterSearchOption = this.filterSearchOption.asObservable();


    private categoryType = new BehaviorSubject<String>('');
    currentcategoryType = this.categoryType.asObservable();


    private categoryname = new BehaviorSubject<String>('');
    currentcategoryname = this.categoryname.asObservable();


    private categoryId = new BehaviorSubject<number>(null);
    currentcategoryId = this.categoryId.asObservable();

    private searchterm = new BehaviorSubject<String>(null);
    currentsearchterm = this.searchterm.asObservable();

    private filterCategories = new BehaviorSubject<any>(null);
    currentFilterCategories = this.filterCategories.asObservable();

    constructor() {
    }

    updateFilterSearchOption(_filterSearchOption: filterList) {
        this.filterSearchOption.next(_filterSearchOption);
    }

    updateCategoryList(categoryList: any[], searchTerm: string) {
        const newState = {...initialState, categoryList, searchTerm};
        this.filterSearchOption.next(newState);
    }

    changeCurrentCategories(id: number){
        this.filterCategories.next(id);
    }
    changeProducts(){
        return this.filterCategories;
    }

    getCategoryId():Observable<any>{
        return this.categoryId.asObservable();
    }

    changeCategoryId(id: number) {
        this.categoryId.next(id);
    }

    changeCategoryType(type: String) {
        this.categoryType.next(type);
    }

    changeCategoryName(name:String) {
        this.categoryname.next(name);
    }

    changesearchterm(name:String) {
        this.searchterm.next(name);
    }
    
}
