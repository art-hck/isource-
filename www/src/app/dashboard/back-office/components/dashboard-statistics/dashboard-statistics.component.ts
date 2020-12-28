import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { getCurrencySymbol } from "@angular/common";
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
import { UserInfoService } from "../../../../user/service/user-info.service";
import FetchStatusesStatistics = DashboardActions.FetchStatusesStatistics;
import FetchAvailableFilters = DashboardActions.FetchAvailableFilters;
import { SelectItemsWithSearchComponent } from "../../../../shared/components/select-items-with-search/select-items-with-search.component";

@Component({
  selector: 'app-dashboard-statistics',
  templateUrl: './dashboard-statistics.component.html',
  styleUrls: ['./dashboard-statistics.component.scss']
})
export class DashboardStatisticsComponent implements OnInit, OnDestroy {
  @ViewChild('requestsSelectList') requestsSelectList: SelectItemsWithSearchComponent;
  @ViewChild('customersSelectList') customersSelectList: SelectItemsWithSearchComponent;
  @ViewChild('usersSelectList') usersSelectList: SelectItemsWithSearchComponent;

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

  destroy$ = new Subject();
  readonly getDeliveryDate = (min, max): string => min === max ? min : min + " – " + max;

  constructor(
    private route: ActivatedRoute,
    public store: Store,
    public user: UserInfoService
  ) { }

  ngOnInit() {
    this.route.params.pipe(
      tap(() => this.store.dispatch([new FetchStatusesStatistics({}), new FetchAvailableFilters({})])),
      withLatestFrom(this.statusesStatistics$),
      takeUntil(this.destroy$)
    ).subscribe();


    this.form.get('shipmentDateFrom').valueChanges.pipe(
      map(() => this.submitFilter()),
      takeUntil(this.destroy$)
    ).subscribe();

    this.form.get('shipmentDateTo').valueChanges.pipe(
      map(() => this.submitFilter()),
      takeUntil(this.destroy$)
    ).subscribe();
  }

  submitFilter() {
    this.updateSelectedItemsCount();

    const filters = {
      requestIds: this.selectedRequests,
      customers: this.selectedCustomers,
      responsibleUsersIds: this.selectedUsers,
      shipmentDateFrom: this.form.get('shipmentDateFrom').value,
      shipmentDateTo: this.form.get('shipmentDateTo').value,
    };

    for (const [key, value] of Object.entries(filters)) {
      if (!value?.length) { delete filters[key]; }
    }

    this.store.dispatch(new FetchStatusesStatistics(filters));
    this.store.dispatch(new FetchAvailableFilters(filters)).subscribe(() => {
      this.updateSelectedItemsCount();
    });
  }

  updateSelectedItemsCount(): void {
    this.requestsSelectList.submit();
    this.customersSelectList.submit();
    this.usersSelectList.submit();

    this.selectedRequests = this.form.get('requests').value?.map(request => request.id);
    this.selectedCustomers = this.form.get('customers').value?.map(customer => customer.id);
    this.selectedUsers = this.form.get('users').value?.map(user => user.id);
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

  resetFilter(): void {
    this.form.reset({
      requests: null,
      customers: null,
      users: null,
      shipmentDateFrom: null,
      shipmentDateTo: null,
    }, {emitEvent: false});

    this.requestsSelectList.form.get('checked').reset(null, {emitEvent: false});
    this.customersSelectList.form.get('checked').reset(null, {emitEvent: false});
    this.usersSelectList.form.get('checked').reset(null, {emitEvent: false});

    this.selectedCustomers = [];
    this.selectedRequests = [];
    this.selectedUsers = [];

    this.store.dispatch(new FetchAvailableFilters({}));
    this.store.dispatch(new FetchStatusesStatistics({}));
  }

  filterIsFilled(): boolean {
    return this.selectedCustomers?.length ||
           this.selectedRequests?.length ||
           this.selectedUsers?.length ||
           this.form.get('shipmentDateFrom').value ||
           this.form.get('shipmentDateTo').value;
  }

  trackByRequestId = (request: DashboardAvailableFiltersRequestItem) => request.id;
  trackByCustomerId = (customer: DashboardAvailableFiltersRequestItem) => customer.id;
  trackByResponsibleUserId = (user: DashboardAvailableFiltersRequestItem) => user.id;

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}