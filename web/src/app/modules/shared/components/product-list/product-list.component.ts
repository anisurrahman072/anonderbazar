import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';
import {Observable} from "rxjs/Observable";
import {Product} from "../../../../models";

@Component({
    selector: 'app-product-list',
    templateUrl: './product-list.component.html',
    styleUrls: ['./product-list.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductListComponent implements OnInit {
    @Input() dataProductList: Observable<any>;
    @Input() dataTitle;
    
    
    constructor() {
    }
    
    ngOnInit() {
    
        
    }
    
}
