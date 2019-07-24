import { NgModule } from '@angular/core';

import { CartComponent } from "./components/cart/cart.component";
import { CartItemComponent } from './components/cart-item/cart-item.component';
import { WidgetComponent } from './widget/widget.component';
import { OrderComponent } from './components/order/order.component';
import { CartSumComponent } from './components/cart-sum/cart-sum.component';
import { SharedModule } from "../shared/shared.module";
import { CartRoutingModule } from "./cart-routing.module";

@NgModule({
  imports: [
    SharedModule,
    CartRoutingModule
  ],
  exports: [
    WidgetComponent,
    CartItemComponent
  ],
  declarations: [
    CartComponent,
    WidgetComponent,
    CartItemComponent,
    OrderComponent,
    CartSumComponent
  ]
})
export class CartModule { }
