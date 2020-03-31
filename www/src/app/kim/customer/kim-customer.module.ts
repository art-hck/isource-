import { NgModule } from '@angular/core';
import { NgxsModule } from "@ngxs/store";
import { KimPriceOrderState } from "./states/kim-price-order.state";
import { KimCommonModule } from "../common/kim-common.module";
import { KimPriceOrderFormComponent } from "./components/kim-price-order-form/kim-price-order-form.component";
import { KimPriceOrderListComponent } from "./components/kim-price-order-list/kim-price-order-list.component";
import { KimCartComponent } from "./components/kim-cart/kim-cart.component";
import { KimCatalogComponent } from "./components/kim-catalog/kim-catalog.component";
import { KimPriceOrderService } from "./services/kim-price-order.service";
import { KimCustomerRoutingModule } from "./kim-customer-routing.module";


@NgModule({
  declarations: [
    KimPriceOrderFormComponent,
    KimPriceOrderListComponent,
    KimCartComponent,
    KimCatalogComponent,
  ],
  providers: [
    KimPriceOrderService
  ],
  imports: [
    KimCommonModule,
    KimCustomerRoutingModule,
    NgxsModule.forFeature([
      KimPriceOrderState
    ])
  ]
})
export class KimCustomerModule { }
