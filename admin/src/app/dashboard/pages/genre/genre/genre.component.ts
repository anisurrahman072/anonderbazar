import { Component, OnInit } from '@angular/core';

import { AuthService } from '../../../../services/auth.service';
import { GenreService } from '../../../../services/genre.service';
import { NzNotificationService } from 'ng-zorro-antd';
import {environment} from "../../../../../environments/environment";

@Component({
  selector: 'app-genre',
  templateUrl: './genre.component.html',
  styleUrls: ['./genre.component.css']
})
export class GenreComponent implements OnInit {
  data = [];
  _isSpinning = true;
  IMAGE_ENDPOINT = environment.IMAGE_ENDPOINT;
  currentUser: any;

  limit: number = 10;
  page: number = 1;
  total: number;
  nameSearchValue: string = '';

  sortValue = {
    name: null,
    price: null
  };
  categoryId: any = null;
  subcategoryId: any = null;

  subcategorySearchOptions: any;
  categorySearchOptions: any[] = [];
  loading: boolean = false;

  constructor(
    private genreService: GenreService,
    private _notification: NzNotificationService,
    private authService: AuthService
  ) {}
  // For initiating the section element with data
  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.getPageData();
  }
  // Event method for getting all the data for the page
  getPageData() {
    this.loading = true;
    this.genreService
      .getAllgenre(
        this.page,
        this.limit,
        this.nameSearchValue || '',
        this.categoryId ? this.categoryId : '',
        this.subcategoryId ? this.subcategoryId : '',
        this.filterTerm(this.sortValue.name)
      )
      .subscribe(
        result => {
          this.loading = false;
          this.data = result.data;
          this.total = result.total;
          this._isSpinning = false;
        },
        error => {
          this.loading = false;
          this._isSpinning = false;
        }
      );
  }
  // Event method for setting up filter data
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
  // Event method for setting up filter data
  sort(sortName, sortValue) {
    this.page = 1;
    this.sortValue[sortName] = sortValue;
    this.getPageData();
  }
  // Event method for resetting all filters
  resetAllFilter() {
    this.limit = 5;
    this.page = 1;
    this.nameSearchValue = '';
    this.sortValue = {
      name: null,
      price: null
    };
    this.categoryId = null;
    this.subcategoryId = null;
    this.subcategorySearchOptions = [];
    this.getPageData();
  }
  // Event method for pagination change
  changePage(page: number, limit: number) {
    this.page = page;
    this.limit = limit;
    this.getPageData();
    return false;
  }
  // Event method for deleting genre
  deleteConfirm(id) {
    this.genreService.delete(id).subscribe(result => {
      this._notification.create('warning', 'Delete', 'Genre has been removed successfully');
      this.getPageData();
    });
  }
}
