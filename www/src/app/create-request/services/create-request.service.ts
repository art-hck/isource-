import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import {RequestItem} from "../models/request-item";


@Injectable()
export class CreateRequestService {

  constructor(
    protected api: HttpClient
  ) {
  }

  addRequest(requestItem: RequestItem) {
    return this.api.post(
      `requests/customer/add-request`,
      {
        positions: [{
          name: requestItem.name,
          productionDocument: requestItem.productionDocument,
          measureUnit: requestItem.measureUnit,
          quantity: requestItem.quantity,
          deliveryDate: requestItem.deliveryDate,
          isDeliveryDateAsap: requestItem.isDeliveryAsap,
          deliveryBasis: requestItem.deliveryBasis,
          startPrice: requestItem.startPrice,
          currency: requestItem.currency,
          paymentTerms: requestItem.paymentTerms,
          relatedServices: requestItem.relatedServices,
          comments: requestItem.comments
        }]
      })
  }
}
