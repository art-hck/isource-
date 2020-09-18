import { Injectable } from "@angular/core";
import * as moment from "moment";
import { Position } from "./position";
import { Proposal } from "./proposal";
import { RequestPosition } from "../../../request/common/models/request-position";
import { TechnicalCommercialProposal } from "../../../request/common/models/technical-commercial-proposal";
import { TechnicalCommercialProposalByPosition } from "../../../request/common/models/technical-commercial-proposal-by-position";
import { TechnicalCommercialProposalPosition } from "../../../request/common/models/technical-commercial-proposal-position";

@Injectable({
  providedIn: "root"
})
export class ProposalHelperService {

  isValid(position: Position, proposal: Proposal): boolean {
    return this.isDateValid(position, proposal) && this.isQuantityValid(position, proposal);
  }

  isDateValid(position: Position, { deliveryDate }: Proposal): boolean {
    return position.isDeliveryDateAsap ||
      moment(deliveryDate).isSameOrBefore(moment(position.deliveryDate));
  }

  isQuantityValid(position: Position, { quantity }: Proposal): boolean {
    return position.quantity === quantity;
  }

  isPositionsValid(positions: TechnicalCommercialProposalByPosition[], proposal: TechnicalCommercialProposal) {
    return proposal.positions.length === positions.length;
  }

  isQuantityPositionsValid(positions: TechnicalCommercialProposalByPosition[], proposal: TechnicalCommercialProposal) {
    return proposal.positions.every(
      ({position, quantity}) => position.quantity === quantity);
  }

  isDatePositionsValid(positions: TechnicalCommercialProposalByPosition[], proposal: TechnicalCommercialProposal) {
    return proposal.positions.every(
      position => moment(position.deliveryDate).isSameOrBefore(moment(position.position.deliveryDate))
        || position.position.isDeliveryDateAsap);
  }

  getSummaryPrice(positions: TechnicalCommercialProposalPosition[]) {
    return positions.map(position => position.priceWithoutVat * position.quantity).reduce((sum, priceWithoutVat) => sum + priceWithoutVat, 0);
  }

  getRequestedQuantityLabel(position: Position, { quantity }: Proposal): string {
    return quantity > position.quantity ?
      ' - Количество больше нужного' :
      ' - Количество меньше нужного';
  }

  chooseBy(type: "date" | "price", position: Position, proposals: Proposal[]): Proposal["sourceProposal"] {
    return proposals.reduce((prev, curr) => {
      // Если выбран автовыбор по дате, дополнительно
      // проверяем соседние предложения на валидность
      if (type === 'date') {
        const prevValid = prev && this.isValid(position, prev);
        const currValid = curr && this.isValid(position, curr);
        if (prevValid && !currValid) { return prev; }
        if (!prevValid && currValid) { return curr; }
      }

      switch (type) {
        case "price":
          return prev.priceWithoutVat <= curr.priceWithoutVat ? prev : curr;
        case "date":
          if (moment(prev.deliveryDate).isSame(curr.deliveryDate)) {
            return prev.priceWithoutVat <= curr.priceWithoutVat ? prev : curr;
          } else {
            return moment(prev.deliveryDate).isBefore(curr.deliveryDate) ? prev : curr;
          }
      }
    }).sourceProposal;
  }
}
