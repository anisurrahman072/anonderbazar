import { Component, OnInit } from '@angular/core'; 
import { ProductService, CategoryProductService } from '../../../../../services';
import { Observable } from 'rxjs/Observable';
import { Options, LabelType } from 'ng5-slider';

@Component({
  selector: 'right-side-filter-search',
  templateUrl: './right-side-filter-search.component.html',
  styleUrls: ['./right-side-filter-search.component.scss']
})
export class RightSideFilterSearchComponent implements OnInit {
  public isCollapsed_category=false;
  public isCollapsed_price=false;
  public isCollapsed_color=false;
  public isCollapsed_size=false;
  public isCollapsed = false;
  public isCollapsed_filter = true;
  public isCollapsed_category_sub = false;
  public isCollapsed_class = false;


  

  minPrice: any = 0;
  maxPrice: any = 0;
  allCategory: Observable<any>;

  options: Options = {
    floor: 0,
    ceil:  this.maxPrice,
    translate: (value: number, label: LabelType): string => {
      switch (label) {
        case LabelType.Low:
          return '৳ ' + value;
        case LabelType.High:
          return '৳ ' + value;
        default:
          return '৳ ' + value;
      }
    }
  };

  constructor(


    private productService: ProductService,
    private categoryProductService: CategoryProductService
  ) { }
 // init the component
  ngOnInit() {
    this.getAllCategories();
    this.getMinPriceOfProduct();
    this.getMaxPriceOfProduct(); 
  }
  //Event method for getting all the data for the page
  private getAllCategories() {
    this.categoryProductService.getAll().subscribe(result => {
      this.allCategory = result;
    });
  }
  //Event method for getting all the data for the page
  private getMinPriceOfProduct() {
    this.productService.getMinPrice().subscribe(result => {
      this.minPrice = result.min;
      
    });
  }
  //Event method for getting all the data for the page
  private getMaxPriceOfProduct() {
    this.productService.getMaxPrice().subscribe(result => {
      this.maxPrice = result.max;
      
    });
  }


}
