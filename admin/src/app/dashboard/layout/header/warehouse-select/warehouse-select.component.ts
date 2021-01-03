import {Component, OnInit} from '@angular/core';
import {WarehouseService} from "../../../../services/warehouse.service";
import {UIService} from "../../../../services/ui/ui.service";
import {AuthService} from "../../../../services/auth.service";

@Component({
    selector: 'app-warehouse-select',
    templateUrl: './warehouse-select.component.html',
    styles: []
})
export class WarehouseSelectComponent implements OnInit {
    warehouseSearchOptions: any[] = [];
    selectedWarehouse: any;
    
    constructor(private uiService: UIService,
                private authService: AuthService,
                private warehouseService: WarehouseService) {
    }
    
    ngOnInit() {
        this.uiService.selectedWarehouseUpdate(this.authService.getCurrentWarehouse());
        this.uiService.currentSelectedWarehouseInfo.subscribe(res => {
            this.selectedWarehouse = res;
        });
        
        
        this.warehouseService.getAll(1,30).subscribe(result => {
            this.warehouseSearchOptions = result;
            
        })
        
    }
    
    warehouseChange($event) {
        this.uiService.selectedWarehouseUpdate($event);
    }
    
    warehouseSearchChange($event) {
        
    }
    
}
