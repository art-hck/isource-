import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

@Injectable()
export class DashboardService {

  constructor(protected api: HttpClient) {
  }

  getPositionStatusStatistic(): Observable<{status: string, count: number}[]> {
    const url = `requests/customer/dashboard/statistics/position-statuses`;
    return this.api.post<{status: string, count: number}[]>(url, {});
  }
}
