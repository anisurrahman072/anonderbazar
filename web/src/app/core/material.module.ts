import {NgModule} from '@angular/core';
import {
    MatButtonModule,
    MatMenuModule,
    MatToolbarModule,
    MatIconModule,
    MatCardModule, MatSliderModule, MatAutocompleteModule, MatButtonToggleModule, MatCheckboxModule, MatChipsModule,
    MatDatepickerModule, MatDividerModule, MatDialogModule, MatExpansionModule, MatGridListModule, MatInputModule,
    MatListModule, MatNativeDateModule, MatPaginatorModule, MatProgressBarModule, MatProgressSpinnerModule,
    MatRadioModule, MatSlideToggleModule, MatSelectModule, MatRippleModule, MatSidenavModule, MatSnackBarModule,
    MatSortModule, MatStepperModule, MatTableModule, MatTabsModule, MatTooltipModule
} from '@angular/material';
import {BsDropdownModule, ModalModule, PopoverModule, RatingModule} from "ngx-bootstrap";

@NgModule({
    imports: [RatingModule.forRoot(),PopoverModule.forRoot(),ModalModule.forRoot(),BsDropdownModule.forRoot()],
    exports: [
        MatButtonModule,
        MatMenuModule,
        MatToolbarModule,
        MatIconModule,
        MatCardModule,
        MatSliderModule,
        MatAutocompleteModule,
        MatButtonModule,
        MatButtonToggleModule,
        MatCardModule,
        MatCheckboxModule,
        MatChipsModule,
        MatDatepickerModule,
        MatDialogModule,
        MatDividerModule,
        MatExpansionModule,
        MatGridListModule,
        MatIconModule,
        MatInputModule,
        MatListModule,
        MatMenuModule,
        MatNativeDateModule,
        MatPaginatorModule,
        MatProgressBarModule,
        MatProgressSpinnerModule,
        MatRadioModule,
        MatRippleModule,
        MatSelectModule,
        MatSidenavModule,
        MatSliderModule,
        MatSlideToggleModule,
        MatSnackBarModule,
        MatSortModule,
        MatStepperModule,
        MatTableModule,
        MatTabsModule,
        MatToolbarModule,
        MatTooltipModule,
        RatingModule,
        PopoverModule,
        ModalModule,
        BsDropdownModule
    ]
})
export class MaterialModule {
}
