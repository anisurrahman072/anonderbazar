import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {UserService} from "../../../../services/user.service";
import {UIService} from "../../../../services/ui/ui.service";
import {AuthService} from "../../../../services/auth.service";
import {environment} from "../../../../../environments/environment";
import {FormBuilder, FormGroup} from "@angular/forms";

@Component({
    selector: 'app-user',
    templateUrl: './user.component.html',
    styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit, OnDestroy {
    private currentWarehouseId: any | string;

    data = [];
    _isSpinning = true;
    IMAGE_ENDPOINT = environment.IMAGE_ENDPOINT;
    IMAGE_THUMB_ENDPOINT = environment.IMAGE_THUMB_ENDPOINT;
    currentUser: any;
    private currentWarehouseSubscriprtion: any;

    categoryId: any = null;
    subcategoryId: any = null;

    limit: number = 20;
    page: number = 1;
    total: number;
    nameSearchValue: string = '';
    emailSearchValue: string = '';
    phoneSearchValue: string = '';
    usernameSearchValue: string = '';

    sortKey: string = '';
    sortValue: string = '';

    subcategorySearchOptions: any;
    categorySearchOptions: any[] = [];
    loading: boolean = false;

    isUserVisible: boolean = false;
    validateProductForm: FormGroup;
    allUser: any;
    userPage: number = 1;
    userTotal: number;
    private storedExcelUsers: any = [];
    private excelPageSelectAll = [];
    @ViewChild('excelSelectAll') excelSelectAll;

    constructor(
        private userService: UserService,
        private uiService: UIService,
        private authService: AuthService,
        private fb: FormBuilder,
    ) {
        this.validateProductForm = this.fb.group({
            userChecked: ['', []],
        });
    }

    // init the component
    ngOnInit(): void {
        this.currentUser = this.authService.getCurrentUser();

        this.currentWarehouseSubscriprtion = this.uiService.currentSelectedWarehouseInfo.subscribe(
            warehouseId => {
                this.currentWarehouseId = warehouseId || '';
                this.getPageData();
            }
        );
    }
    ngOnDestroy(): void {
        this.currentWarehouseSubscriprtion
            ? this.currentWarehouseSubscriprtion.unsubscribe()
            : '';
    }
    //Event method for deleting user
    deleteConfirm(id) {
        this.userService.delete(id).subscribe(result => {
        });
    }

    showProductModal = () => {

        this.excelSelectAll.nativeElement.checked = false;
        this.isUserVisible = true;
        this.storedExcelUsers= [];
        this.excelPageSelectAll = [];

        this.getPageData(null, true);
    };

    //Event method for getting all the data for the page
    getPageData(event?: any, forExcel?: boolean) {
        if (event) {
            this.page = event;
        }
        this._isSpinning = true;
        this.userService
            .getAllShopOwner(
                this.page,
                this.currentWarehouseId,
                this.limit,
                this.emailSearchValue || '',
                this.nameSearchValue || '',
                this.phoneSearchValue || '',
                this.usernameSearchValue || '',
                this.sortKey,
                this.filterTerm(this.sortValue)
            )
            .subscribe(
                result => {
                    this.total = result.total;
                    this._isSpinning = false;

                    if(!forExcel){
                        this.data = result.data;
                    }
                    else {
                        this.allUser = result.data.map(data => {
                            return {
                                ...data,
                                checked: false
                            }
                        });

                        console.log('Annnnn1', this.allUser );

                        const thisTotal = this.allUser.length;

                        if (typeof this.storedExcelUsers[this.page - 1] === 'undefined') {
                            this.storedExcelUsers[this.page - 1] = [];
                        }
                        if (typeof this.excelPageSelectAll[this.page - 1] === 'undefined') {
                            this.excelPageSelectAll[this.page - 1] = false;
                        }

                        this.excelSelectAll.nativeElement.checked = !!this.excelPageSelectAll[this.page - 1];

                        /** Jokhon porer abr ager page gulote jawa hocce tokhon jodi age konota check kra hoe thake
                         tahole seita abr aikahne checked show korte hobe */
                        if (this.storedExcelUsers[this.page - 1].length) {
                            for (let index = 0; index < thisTotal; index++) {
                                const foundIndex = this.storedExcelUsers[this.page - 1].findIndex((storedUser) => {
                                    return storedUser.id == this.allUser[index].id;
                                });
                                this.allUser[index].checked = foundIndex !== -1;
                            }
                        } else {
                            for (let index = 0; index < thisTotal; index++) {
                                this.allUser[index].checked = false;
                            }
                        }
                    }


                },
                error => {
                    this._isSpinning = false;
                }
            );
    }

    selectAllExcel($event) {

        const isChecked = !!$event.target.checked;
        console.log('ann1 selectAllCsv', isChecked);
        if (!isChecked) {
            this.storedExcelUsers[this.csvPage - 1] = [];
        }
        this.csvPageSelectAll[this.csvPage - 1] = isChecked;
        const len = this.csvOrders.length;
        /** Check or uncheck all the checkbox of the current users in the current page */
        for (let i = 0; i < len; i++) {
            /** If parent checkbox is true then check all other unchecked boxes */
            this.csvOrders[i].checked = isChecked;

            /** Now push all the checked users in STORE */
            if (isChecked) {
                const foundIndex = this.storedCsvOrders[this.csvPage - 1].findIndex((storedOder) => {
                    return storedOder.id == this.csvOrders[i].id;
                });
                if (foundIndex === -1) {
                    this.storedCsvOrders[this.csvPage - 1].push(this.csvOrders[i]);
                }
            }
        }
        console.log('this.storedCsvOrders', this.storedCsvOrders[this.csvPage - 1]);
    }

    //Event method for setting up filter data
    private filterTerm(sortValue: string): string {
        switch (sortValue) {
            case 'ascend':
                return 'ASC';
            case 'descend':
                return 'DESC';
            default:
                return '';
        }
    }

    //Event method for setting up filter data
    sort(sort: { key: string, value: string }) {
        this.page = 1;
        this.sortKey = sort.key;
        this.sortValue = sort.value;
        this.getPageData();
    }

    //Event method for resetting all filters
    resetAllFilter() {
        this.limit = 5;
        this.page = 1;
        this.nameSearchValue = '';
        this.emailSearchValue = '';
        this.phoneSearchValue = '';
        this.usernameSearchValue = null;
        this.sortKey = "";
        this.sortValue = "";
        this.categoryId = null;
        this.subcategoryId = null;
        this.subcategorySearchOptions = [];
        this.getPageData();
    }

    //Event method for pagination change
    changePage(page: number, limit: number) {
        this.page = page;
        this.limit = limit;
        this.getPageData();
        return false;
    }

    //Method for subcategory id change
    subcategoryIdChange($event) {
        this.page = 1;
        this.getPageData();
    }

    subcategoryIdSearchChange($event) {
    }

    handleCancel = e => {
        this.isUserVisible = false;
    };

    handleOk = e => {
        this.isUserVisible = false;
    };

    submitForm($event: any, value: any) {
    }
}
