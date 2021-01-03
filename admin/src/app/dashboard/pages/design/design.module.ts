import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import {DesignCoreComponent} from "./core/design-core.component";
import {DesignListComponent} from "./components/design-list/design-list.component";
import {DesignReadComponent} from "./components/design-read/design-read.component";
import {DesignCreateComponent} from "./components/design-create/design-create.component";
import {DesignEditComponent} from "./components/design-edit/design-edit.component";
import {UiModule} from "../../shared/ui.module";
import {DesignRoutingModule} from "./design-routing.module";

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        DesignRoutingModule,
        UiModule
    ],
    declarations: [
        DesignCoreComponent,
        DesignListComponent,
        DesignReadComponent,
        DesignCreateComponent,
        DesignEditComponent
    ]
})
export class DesignModule {
}
