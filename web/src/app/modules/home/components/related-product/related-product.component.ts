import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-related-product',
  templateUrl: './related-product.component.html',
  styleUrls: ['./related-product.component.scss']
})
export class RelatedProductComponent implements OnInit {
  @Input() products:any;
  constructor() { }

  ngOnInit() {
  }

}
