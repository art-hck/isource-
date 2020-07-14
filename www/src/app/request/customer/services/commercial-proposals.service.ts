import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Uuid } from "../../../cart/models/uuid";
import { PositionsWithSuppliers } from "../../back-office/models/positions-with-suppliers";
import { CommercialProposalReviewBody } from "../../common/models/commercial-proposal-review-body";


@Injectable({
  providedIn: "root"
})
export class CommercialProposalsService {

  constructor(private api: HttpClient) {}

  positionsWithOffers(requestId: Uuid) {
    const url = `requests/customer/${requestId}/positions-with-offers`;
    return this.api.get<PositionsWithSuppliers>(url);
  }

  accept(requestId: Uuid, positionIdsWithProposalIds: { [key in Uuid]: Uuid }) {
    const url = `requests/customer/${requestId}/commercial-proposals/accept`;
    return this.api.post(url, positionIdsWithProposalIds);
  }

  review(requestId: Uuid, body: CommercialProposalReviewBody) {
    const url = `requests/customer/${requestId}/commercial-proposals/change-statuses`;
    return this.api.post(url, body);
  }
}
