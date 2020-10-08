import { Injectable } from '@angular/core';
import { Uuid } from "../../../cart/models/uuid";
import { Contract } from "../../common/models/contract";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { RequestDocument } from "../../common/models/request-document";
import { FormDataService } from "../../../shared/services/form-data.service";

@Injectable()
export class ContractService {
  constructor(private api: HttpClient, private formDataService: FormDataService) {}

  list(requestId): Observable<Contract[]> {
    const url = `requests/${requestId}/contracts`;
    return this.api.get<Contract[]>(url);
  }

  reject(contractId: Uuid) {
    const url = `requests/customer/contracts/${contractId}/reject`;
    return this.api.get<Contract>(url);
  }

  approve(contractId: Uuid) {
    const url = `requests/customer/contracts/${contractId}/approve`;
    return this.api.get<Contract>(url);
  }

  upload(contractId: Uuid, files: File[], comment?: string): Observable<RequestDocument[]> {
    const url = `requests/contracts/${contractId}/upload`;
    return this.api.post<RequestDocument[]>(url, this.formDataService.toFormData({ files, comments: [comment] }));
  }

  download(contractId: Uuid) {
    const url = `requests/contracts/${contractId}/generate`;
    return this.api.post(url, {}, { responseType: 'blob' });
  }
}
