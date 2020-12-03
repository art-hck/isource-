import { Component, OnDestroy, OnInit } from '@angular/core';
import { StatusesStatisticsInfo } from "../../models/statuses-statistics";
import { FormControl, FormGroup } from "@angular/forms";
import { Select, Store } from "@ngxs/store";
import { DashboardState } from "../../states/dashboard.state";
import { Observable, Subject } from "rxjs";
import {
  DashboardAvailableFiltersCustomerItem,
  DashboardAvailableFiltersRequestItem,
  DashboardAvailableFiltersResponsibleUserItem
} from "../../models/dashboard-available-filters";
import { map, takeUntil, tap, withLatestFrom } from "rxjs/operators";
import { ActivatedRoute } from "@angular/router";
import { DashboardActions } from "../../actions/dashboard.actions";
import FetchStatusesStatistics = DashboardActions.FetchStatusesStatistics;
import { getCurrencySymbol } from "@angular/common";

@Component({
  selector: 'app-dashboard-statistics',
  templateUrl: './dashboard-statistics.component.html',
  styleUrls: ['./dashboard-statistics.component.scss']
})
export class DashboardStatisticsComponent implements OnInit, OnDestroy {
  @Select(DashboardState.statusesStatistics) statusesStatistics$: Observable<StatusesStatisticsInfo>;
  @Select(DashboardState.filterRequestList) filterRequestList$: Observable<DashboardAvailableFiltersRequestItem[]>;
  @Select(DashboardState.filterCustomerList) filterCustomerList$: Observable<DashboardAvailableFiltersCustomerItem[]>;
  @Select(DashboardState.filterResponsibleUsersList) filterResponsibleUsersList$: Observable<DashboardAvailableFiltersResponsibleUserItem[]>;

  form = new FormGroup({
    requests: new FormControl(null),
    customers: new FormControl(null),
    users: new FormControl(null),
    shipmentDateFrom: new FormControl(null),
    shipmentDateTo: new FormControl(null),
  });

  selectedRequests = [];
  selectedCustomers = [];
  selectedUsers = [];

  getCurrencySymbol = getCurrencySymbol;

  readonly filters$: Observable<any> = this.form.valueChanges.pipe(
    map(data => {
      console.log(data);
    }),
  );
  destroy$ = new Subject();
  readonly getDeliveryDate = (min, max): string => min === max ? min : min + " – " + max;

  constructor(
    private route: ActivatedRoute,
    public store: Store
  ) { }

  ngOnInit() {
    this.route.params.pipe(
      tap(() => this.store.dispatch(new FetchStatusesStatistics({}))),
      withLatestFrom(this.statusesStatistics$),
      takeUntil(this.destroy$)
    ).subscribe();
  }

  submitFilter() {
    console.log(this.form);

    this.selectedRequests = this.form.get('requests').value?.map(request => request.id);
    this.selectedCustomers = this.form.get('customers').value?.map(customer => customer.id);
    this.selectedUsers = this.form.get('users').value?.map(user => user.id);

    const filters = {
      requestIds: this.selectedRequests,
      customers: this.selectedCustomers,
      userIds: this.selectedUsers,
      shipmentDateFrom: this.form.get('shipmentDateFrom').value,
      shipmentDateTo: this.form.get('shipmentDateTo').value,
    };

    console.log(filters);

    this.store.dispatch(new FetchStatusesStatistics(filters));
  }

  toRequestItem(request: any): DashboardAvailableFiltersRequestItem {
    return request as DashboardAvailableFiltersRequestItem;
  }

  toCustomerItem(customer: any): DashboardAvailableFiltersCustomerItem {
    return customer as DashboardAvailableFiltersCustomerItem;
  }

  toResponsibleUserItem(responsibleUser: any): DashboardAvailableFiltersResponsibleUserItem {
    return responsibleUser as DashboardAvailableFiltersResponsibleUserItem;
  }

  filterRequests(q: string, request: DashboardAvailableFiltersRequestItem): boolean {
    return request?.name.toLowerCase().indexOf(q.toLowerCase()) >= 0;
  }

  filterCustomers(q: string, customer: DashboardAvailableFiltersCustomerItem): boolean {
    return customer?.contragentName.toLowerCase().indexOf(q.toLowerCase()) >= 0;
  }

  filterResponsibleUsers(q: string, user: DashboardAvailableFiltersResponsibleUserItem): boolean {
    return user?.fullName?.toLowerCase()?.indexOf(q.toLowerCase()) >= 0;
  }

  trackByRequestId = (request: DashboardAvailableFiltersRequestItem) => request.id;
  trackByCustomerId = (customer: DashboardAvailableFiltersRequestItem) => customer.id;
  trackByResponsibleUserId = (user: DashboardAvailableFiltersRequestItem) => user.id;

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
