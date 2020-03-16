import { Uuid } from "../../../cart/models/uuid";
import { RequestDocument } from "./request-document";
import { ContragentList } from "../../../contragent/models/contragent-list";
import { Winner } from "./winner";
import { ContractStatus } from "../enum/сontract-status";

export class Contract {
  id: Uuid;
  request: {
    id: Uuid
  };
  customer: ContragentList;
  supplier: ContragentList;
  createdDate: string;
  winners: Winner[];
  documents: RequestDocument[];
  status: ContractStatus;
}
