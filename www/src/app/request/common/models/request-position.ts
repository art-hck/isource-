import {Uuid} from "../../../cart/models/uuid";
import {RequestItem} from "./request-item";
import { RequestDocument } from "./request-document";

export class RequestPosition extends RequestItem {
  id: Uuid;
  userId: Uuid;
  contragentId: Uuid;
  createdDate: string;
  number: number;
  status: string;
  requestId: Uuid;
  statusChangedDate: string;
  statusExpectedDate: string;
  type: string;
  statusLabel: string;
  documents: RequestDocument[];
}
