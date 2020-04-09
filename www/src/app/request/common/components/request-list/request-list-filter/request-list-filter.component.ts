import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from "@angular/forms";
import { RequestsListFilter, RequestsListFilterItem } from "../../../models/requests-list/requests-list-filter";
import { debounceTime, filter, switchMap, takeUntil } from "rxjs/operators";
import { Subject } from "rxjs";
import { ActivatedRoute } from "@angular/router";
import { FilterCustomersComponent } from "./filter-customers/filter-customers.component";
import { AvailableFilters } from "../../../../back-office/models/available-filters";

@Component({
  selector: 'app-request-list-filter',
  templateUrl: './request-list-filter.component.html',
  styleUrls: ['./request-list-filter.component.scss']
})
export class RequestListFilterComponent implements OnInit, OnDestroy {

  @ViewChild(FilterCustomersComponent, {static: false}) filterCustomersComponent: FilterCustomersComponent;
  @Output() filter = new EventEmitter<RequestsListFilter>();
  @Output() showResults = new EventEmitter();
  @Input() backofficeView: boolean;
  @Input() resultsCount: number;
  @Input() availableFilters: AvailableFilters;

  readonly destroy$ = new Subject();

  form: FormGroup;
  formInitialValue: RequestsListFilter = {};

  constructor(private route: ActivatedRoute, private fb: FormBuilder) { }

  ngOnInit() {
    this.form = this.fb.group({
      requestNameOrNumber: '',
      onlyOpenTasks: false,
      customers: [[]],
      positionStatuses: [[]],
      shipmentDateFrom: '',
      shipmentDateTo: '',
      shipmentDateAsap: false,
    });

    this.formInitialValue = this.form.value;

    this.route.params.pipe(
      switchMap(() => this.form.valueChanges),
      debounceTime(300),
      filter(() => this.form.valid),
      takeUntil(this.destroy$)
    ).subscribe(() => this.submit());
  }


  submit(): void {
    this.filter.emit(Object.entries(this.form.value).reduce(
      (result: RequestsListFilter, [k, v]: [keyof RequestsListFilter, RequestsListFilterItem]) => {
        if (v instanceof Array && v.length > 0 || !(v instanceof Array) && v) {
          (result[k] as RequestsListFilterItem) = v;
        }

        return result;
      }, {}));
  }

  resetFilter(emitEvent = true) {
    this.form.reset({
        requestNameOrNumber: '',
        onlyOpenTasks: false,
        customers: [],
        positionStatuses: [],
        shipmentDateFrom: '',
        shipmentDateTo: '',
        shipmentDateAsap: false
    }, { emitEvent });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

