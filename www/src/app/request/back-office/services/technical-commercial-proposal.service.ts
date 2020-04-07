import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, of } from "rxjs";
import { delay } from "rxjs/operators";
import { TechnicalCommercialProposal } from "../../common/models/technical-commercial-proposal";
import { Uuid } from "../../../cart/models/uuid";
import { RequestPosition } from "../../common/models/request-position";
import { FormDataService } from "../../../shared/services/form-data.service";
import { saveAs } from 'file-saver/src/FileSaver';

@Injectable()
export class TechnicalCommercialProposalService {

  constructor(protected api: HttpClient, private formDataService: FormDataService) {}

  list(requestId: Uuid) {
    const url = `requests/backoffice/${requestId}/technical-commercial-proposals`;
    return this.api.get<TechnicalCommercialProposal[]>(url);
  }

  create(requestId: Uuid, body: Partial<TechnicalCommercialProposal>) {
    const url = `requests/backoffice/${requestId}/technical-commercial-proposals/create`;
    return this.api.post<TechnicalCommercialProposal>(url, this.formDataService.toFormData(body));
  }

  update(proposal: Partial<TechnicalCommercialProposal> & {id: Uuid}) {
    const url = `requests/backoffice/technical-commercial-proposals/${proposal.id}/edit`;
    return this.api.post<TechnicalCommercialProposal>(url, this.formDataService.toFormData(proposal));
  }

  publish({id}: TechnicalCommercialProposal) {
    const url = `requests/backoffice/technical-commercial-proposals/${id}/send-to-review`;
    return this.api.get<TechnicalCommercialProposal>(url);
  }

  downloadTemplate(requestId: Uuid) {
    const url = `requests/backoffice/${requestId}/technical-commercial-proposals/download-excel-template`;
    return this.api.post(url, {}, {responseType: 'blob'});
  }

  uploadTemplate(requestId: Uuid, files: File[]) {
    const url = `requests/backoffice/${requestId}/technical-commercial-proposals/upload-excel`;
    return this.api.post<TechnicalCommercialProposal[]>(url, this.convertModelToFormData(files, null, 'files'));
  }

  availablePositions(requestId: Uuid) {
    const url = `requests/backoffice/${requestId}/technical-commercial-proposals/available-request-positions`;
    return this.api.get<RequestPosition[]>(url);
  }

  private delayPipe(min, max) {
    return delay(Math.floor(min + Math.random() * (max + 1 - min)));
  }

  /**
   * Функция для преобразования формы в FormData, при котором можно отправлять файлы
   *
   * @param model
   * @param form
   * @param namespace
   */
  convertModelToFormData(model: any, form: FormData = null, namespace = ''): FormData {
    const formData = form || new FormData();

    if (model instanceof File) {
      formData.append(namespace, model);
      return formData;
    }

    for (const propertyName in model) {
      if (!model.hasOwnProperty(propertyName) || !model[propertyName]) {
        continue;
      }

      const formKey = namespace ? `${namespace}[${propertyName}]` : propertyName;

      if (model[propertyName] instanceof Date) {
        formData.append(formKey, model[propertyName].toISOString());
      } else if (model[propertyName] instanceof Array) {
        model[propertyName].forEach((element, index) => {
          const tempFormKey = `${formKey}[${index}]`;
          this.convertModelToFormData(element, formData, tempFormKey);
        });
      } else if (model[propertyName] instanceof File) {
        formData.append(formKey, model[propertyName]);
      } else if (typeof model[propertyName] === 'object') {
        this.convertModelToFormData(model[propertyName], formData, formKey);
      } else {
        formData.append(formKey, model[propertyName].toString());
      }
    }

    return formData;
  }
}
