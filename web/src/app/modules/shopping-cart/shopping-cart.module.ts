import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ShoppingCartRoutingModule } from './shopping-cart-routing.module';
import {ShoppingCartComponent} from "./shopping-cart/shopping-cart.component";
import {CartItemComponent} from "./shopping-cart/components/cart-item/cart-item.component";
import {MaterialModule} from "../../core/material.module";

@NgModule({
  imports: [
    CommonModule,
    ShoppingCartRoutingModule,
    MaterialModule,
  ],
  declarations: [ShoppingCartComponent, CartItemComponent]
})
export class ShoppingCartModule { }
