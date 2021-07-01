import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { EventCreateComponent } from './event-create/event-create.component';
import { EventEditComponent } from './event-edit/event-edit.component';
import { EventReadComponent } from './event-read/event-read.component';
import { EventListComponent } from './event-list/event-list.component';
import {EventManagementRoutingModule} from './event-management-routing.module';
import {UiModule} from "../../shared/ui.module";
import {CKEditorModule} from "@ckeditor/ckeditor5-angular";

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        EventManagementRoutingModule,
        UiModule,
        CKEditorModule
    ],
  declarations: [EventCreateComponent, EventEditComponent, EventReadComponent, EventListComponent]
})
export class EventManagementModule { }
