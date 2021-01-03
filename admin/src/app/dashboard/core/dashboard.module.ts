import {NgModule} from '@angular/core';

import {DashboardHomeComponent} from '../pages/dashboard-home/dashboard-home.component';
import {TodoListComponent} from '../components/todo-list/todo-list.component';
import {HeaderComponent} from '../layout/header/header.component';
import {FooterComponent} from '../layout/footer/footer.component';
import {SidebarComponent} from '../layout/sidebar/sidebar.component';
import {DashboardCoreComponent} from './dashboard-core.component';
import {BreadcrumbComponent} from '../layout/breadcrumb/breadcrumb.component';
import {DashboardRoutingModule} from './dashboard-routing.module';

import {RunningOrderComponent} from '../components/running-order/running-order.component';
import {OnlineOrderComponent} from '../components/online-order/online-order.component';
import {CommonModule} from '@angular/common';
import {productGraphComponent} from '../components/product-graph/product-graph.component';
import {UiModule} from "../shared/ui.module";
import {WarehouseSelectComponent} from "../layout/header/warehouse-select/warehouse-select.component";
import {UserComponent} from "../pages/craftsman/user/user.component";
import {CustomerComponent} from "../pages/craftsman/customer/customer.component";
import {NgxChartsModule} from '@swimlane/ngx-charts';
import { EventRegisterComponent } from '../components/event-register/event-register.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        DashboardRoutingModule,
        ReactiveFormsModule,
        UiModule,
        NgxChartsModule,
    ],
    declarations: [
        DashboardHomeComponent,
        TodoListComponent,
        HeaderComponent,
        WarehouseSelectComponent,
        FooterComponent,
        SidebarComponent,
        DashboardCoreComponent,
        BreadcrumbComponent,
        RunningOrderComponent,
        OnlineOrderComponent,
        productGraphComponent,
        UserComponent,
        CustomerComponent,
        EventRegisterComponent,
    ], 
    
})
export class DashboardModule {
}
