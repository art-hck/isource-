import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { getCurrencySymbol } from "@angular/common";
import { KimPriceOrder } from "../../../common/models/kim-price-order";
import { KimPriceOrderProposal } from "../../../common/models/kim-price-order-proposal";

@Component({
  selector: 'app-kim-price-order-proposal-detail',
  templateUrl: './price-order-proposal-detail.component.html',
  styleUrls: ['./price-order-proposal-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PriceOrderProposalDetailComponent {

  @Input() priceOrder: KimPriceOrder;
  @Input() proposal: KimPriceOrderProposal;
  getCurrencySymbol = getCurrencySymbol;
}
