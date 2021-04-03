import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {UserService} from "../../../../services/user.service";
import {UIService} from "../../../../services/ui/ui.service";
import {AuthService} from "../../../../services/auth.service";
import {environment} from "../../../../../environments/environment";
import {FormBuilder, FormGroup} from "@angular/forms";
import * as ___ from 'lodash';
import {ExportService} from "../../../../services/export.service";

@Component({
    selector: 'app-customer',
    templateUrl: './customer.component.html',
    styleUrls: ['./customer.component.css']
})
export class CustomerComponent implements OnInit, OnDestroy {
    private currentWarehouseId: any | string;

    data = [];
    _isSpinning = true;
    IMAGE_ENDPOINT = environment.IMAGE_ENDPOINT;
    currentUser: any;
    private currentWarehouseSubscriprtion: any;

    categoryId: any = null;
    subcategoryId: any = null;

    limit: number = 10;
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
        private exportService: ExportService,
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

    //Event method for deleting customer
    deleteConfirm(id) {
        this.userService.delete(id).subscribe(result => {
        });
    }

    //Event method for getting all the data for the page
    getPageData(event?: any, forExcel?: boolean) {
        if (event) {
            this.page = event;
        }
        this._isSpinning = true;
        this.userService.getAllCustomer(
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

                        console.log('Ascccceee', this.allUser);

                        const thisTotal = this.allUser.length;

                        if (typeof this.storedExcelUsers[this.page - 1] === 'undefined') {
                            this.storedExcelUsers[this.page - 1] = [];
                        }
                        if (typeof this.excelPageSelectAll[this.page - 1] === 'undefined') {
                            this.excelPageSelectAll[this.page - 1] = false;
                        }

                        this.excelSelectAll.nativeElement.checked = !!this.excelPageSelectAll[this.page - 1];

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

    showProductModal = () => {

        this.excelSelectAll.nativeElement.checked = false;
        this.isUserVisible = true;
        this.storedExcelUsers= [];
        this.excelPageSelectAll = [];

        this.getPageData(null, true);
    };

    handleCancel = e => {
        this.isUserVisible = false;
    };

    handleOk = e => {
        this.isUserVisible = false;
    };

    generateExcel($event: any, value: any) {
        this.isUserVisible = false;
        if (!(this.storedExcelUsers.length > 0)){
            return false;
        }

        let allStoredUsers = ___.flatten(this.storedExcelUsers);
        let excelData = [];

        allStoredUsers.forEach(user => {
            if(user){
                let location = '';
                if(user.upazila_name){
                    location += user.upazila_name;
                }
                if(user.zilla_name){
                    if(location.length !== 0){
                        location += ';'
                    }
                    location += user.zilla_name;
                }
                if(user.division_name){
                    if(location.length !== 0){
                        location += ';'
                    }
                    location += user.division_name;
                }
                if(location.length === 0){
                    location += 'null'
                }
                let phone = user.phone+'';
                let national_id = user.national_id+'';
                excelData.push({
                    'User Id': user.id,
                    'User Name': user.customer_name,
                    'Email': user.email,
                    'Phone': phone,
                    'National Id': national_id,
                    'Location': location
                });
            }
        });

        const header = [
            'User Id',
            'User Name',
            'Email',
            'Phone',
            'National Id',
            'Location'
        ];

        this.exportService.downloadFile(excelData, header, 'Customer');
    }

    selectAllExcel($event) {

        const isChecked = !!$event.target.checked;
        if (!isChecked) {
            this.storedExcelUsers[this.userPage - 1] = [];
        }
        this.excelPageSelectAll[this.userPage - 1] = isChecked;
        const len = this.allUser.length;
        for (let i = 0; i < len; i++) {
            this.allUser[i].checked = isChecked;

            if (isChecked) {
                const foundIndex = this.storedExcelUsers[this.userPage - 1].findIndex((storedUser) => {
                    return storedUser.id == this.allUser[i].id;
                });
                if (foundIndex === -1) {
                    this.storedExcelUsers[this.userPage - 1].push(this.allUser[i]);
                }
            }
        }
    }

    _refreshStatus($event, value) {
        if ($event && $event.currentTarget.checked) {
            this.storedExcelUsers[this.userPage - 1].push(value);
        } else {
            let findValue = this.storedExcelUsers[this.userPage - 1].findIndex((item) => {
                return item.id == value.id
            });
            if (findValue !== -1) {
                this.storedExcelUsers[this.userPage - 1].splice(findValue, 1);
            }
        }
    }

    //Event method for getting all the data for the page
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
}
