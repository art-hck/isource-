import { Component, Input } from '@angular/core';
import {RequestsList} from "../../../models/requests-list/requests-list";
import {Subject} from "rxjs";
import {ClrDatagridFilter, ClrDatagridFilterInterface} from "@clr/angular";

@Component({
  selector: 'app-request-list-number-filter',
  templateUrl: './request-list-number-filter.component.html',
  styleUrls: ['./request-list-number-filter.component.css']
})
export class RequestListNumberFilterComponent implements ClrDatagridFilterInterface<RequestsList> {

  requestNumberSearchQuery = '';
  changes = new Subject<any>();

  @Input() requests: RequestsList[];

  constructor(private filterContainer: ClrDatagridFilter) {
    filterContainer.setFilter(this);
  }

  accepts(request: RequestsList) {
    if (this.requestNumberSearchQuery.length === 0) {
      return true;
    }
    if (!request) {
      return false;
    }
    if (request) {
      const requestNumberSearchQuery = this.requestNumberSearchQuery.toLowerCase();
      const requestNumber = request.request.number.toString();

      return (
        requestNumberSearchQuery === '' ||
        requestNumber === requestNumberSearchQuery ||
        requestNumber.includes(requestNumberSearchQuery)
      );
    }
  }

  isActive(): boolean {
    return this.requestNumberSearchQuery.length > 0;
  }

  inputChange(text: any) {
    this.requestNumberSearchQuery = text;
    this.changes.next();
  }

  clearFilter() {
    this.requestNumberSearchQuery = '';
    this.changes.next();
  }
}
