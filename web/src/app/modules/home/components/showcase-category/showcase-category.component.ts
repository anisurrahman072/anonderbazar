import { Component, Input, OnInit } from "@angular/core";
import { NguCarousel } from "@ngu/carousel";
import { Observable } from "rxjs/Observable";
import { CategoryProductService } from "../../../../services/category-product.service";
import { AppSettings } from "../../../../config/app.config";

@Component({
  selector: "home-showcase-category",
  templateUrl: "./showcase-category.component.html",
  styleUrls: ["./showcase-category.component.scss"]
})
export class ShowcaseCategoryComponent implements OnInit {
  @Input() dataCategoryList: Observable<any>;

  public carouselTile: NguCarousel = {
    grid: { xs: 1, sm: 1, md: 2, lg: 2, all: 0 },
    slide: 2,
    speed: 600,
    animation: "lazy",
    point: {
      visible: false
    },
    loop: true,
    load: 3,
    touch: true,
    easing: "ease"
  };
  IMAGE_ENDPOINT = AppSettings.IMAGE_ENDPOINT;
 
  constructor(private categoryProductService: CategoryProductService) { }
  //Event method for getting all the data for the page
  ngOnInit() { 
  }

  public carouselTileLoad(evt: any) { 
  }

  // carouselLoad will trigger this funnction when your load value reaches
  // it is helps to load the data by parts to increase the performance of the app
  // must use feature to all carousel
}
