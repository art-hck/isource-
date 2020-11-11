import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { TechnicalCommercialProposal } from "../../common/models/technical-commercial-proposal";
import { Uuid } from "../../../cart/models/uuid";
import { RequestPosition } from "../../common/models/request-position";
import { FormDataService } from "../../../shared/services/form-data.service";
import { ProposalGroup } from "../../common/models/proposal-group";
import { CommonProposal, CommonProposalItem, CommonProposalPayload } from "../../common/models/common-proposal";

@Injectable()
export class TechnicalCommercialProposalService {

  constructor(protected api: HttpClient, private formDataService: FormDataService) {}

  list(requestId: Uuid, groupId: Uuid ) {
    const url = `requests/backoffice/${ requestId }/technical-commercial-proposals`;
    return this.api.post<CommonProposalPayload>(url, { groupId });
  }

  create(requestId: Uuid, groupId: Uuid, data: Partial<TechnicalCommercialProposal>) {
    const url = `requests/backoffice/${ requestId }/technical-commercial-proposals/create`;
    return this.api.post<CommonProposalPayload>(url, this.formDataService.toFormData({groupId, data}));
  }

  update(groupId: Uuid, data: Partial<CommonProposal> & { id: Uuid }) {
    const url = `requests/backoffice/technical-commercial-proposals/${ data.id }/edit-offer`;
    return this.api.post<CommonProposalPayload>(url, this.formDataService.toFormData({groupId, data}));
  }

  createItems(proposalId: Uuid, groupId: Uuid, items: Partial<CommonProposalItem>[]) {
    const url = `requests/backoffice/technical-commercial-proposals/${ proposalId }/add-positions`;
    return this.api.post<CommonProposalPayload>(url, this.formDataService.toFormData({ items, groupId }));
  }

  editItems(proposalId: Uuid, groupId: Uuid, items: Partial<CommonProposalItem>[]) {
    const url = `requests/backoffice/technical-commercial-proposals/${ proposalId }/edit-positions`;
    return this.api.post<CommonProposalPayload>(url, this.formDataService.toFormData({ items, groupId }));
  }

  publish({ id }: CommonProposal) {
    const url = `requests/backoffice/technical-commercial-proposals/${ id }/send-to-review`;
    return this.api.get<CommonProposal>(url);
  }

  publishPositions(groupId: Uuid, positionIds: Uuid[]) {
    const url = `requests/backoffice/technical-commercial-proposals/send-positions-to-review`;
    return this.api.post<CommonProposalPayload>(url, { groupId, positionIds });
  }

  downloadTemplate(requestId: Uuid, groupId: Uuid) {
    const url = `requests/backoffice/${ requestId }/technical-commercial-proposals/download-excel-template`;
    return this.api.post(url, { groupId }, { responseType: 'blob' });
  }

  uploadTemplate(requestId: Uuid, groupId: Uuid, files: File[]) {
    const url = `requests/backoffice/${ requestId }/technical-commercial-proposals/upload-excel`;
    const data = { files, groupId };

    return this.api.post<CommonProposalPayload>(url, this.formDataService.toFormData(data));
  }

  uploadTemplateFromGroups(requestId: Uuid, files: File[], requestTechnicalCommercialProposalGroupName: string) {
    const url = `requests/backoffice/${ requestId }/technical-commercial-proposal-groups/upload-excel`;
    const data = { files, requestTechnicalCommercialProposalGroupName };

    return this.api.post<ProposalGroup>(url, this.formDataService.toFormData(data));
  }

  downloadAnalyticalReport(requestId: Uuid, groupId: Uuid) {
    const url = `requests/backoffice/${ requestId }/analytic-report/download-by-tcp`;
    return this.api.post(url, { groupId }, { responseType: 'blob' });
  }

  availablePositions(requestId: Uuid, groupId?: Uuid) {
    const url = `requests/backoffice/${ requestId }/technical-commercial-proposals/available-request-positions`;
    return this.api.post<RequestPosition[]>(url, { groupId });
  }

  rollback(requestId: Uuid, groupId: Uuid, positionId: Uuid) {
    const url = `requests/backoffice/${ requestId }/technical-commercial-proposals/cancel-publish`;
    return this.api.post<CommonProposalPayload>(url, { groupId, positionId });
  }
}
