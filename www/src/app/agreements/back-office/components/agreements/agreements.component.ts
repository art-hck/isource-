import { Component, Inject, OnInit } from '@angular/core';
import { Select, Store } from "@ngxs/store";
import { AgreementListState } from "../../states/agreement-list.state";
import { Observable } from "rxjs";
import { StateStatus } from "../../../../request/common/models/state-status";
import Fetch = AgreementListActions.Fetch;
import { ActivatedRoute, Router } from "@angular/router";
import { map } from "rxjs/operators";
import { AgreementListActions } from "../../actions/agreement-list.actions";
import { Agreement } from "../../../common/models/Agreement";
import { FormControl, FormGroup } from "@angular/forms";
import { AgreementActionFilters } from "../../dictionaries/agreement-action-label";
import { AgreementAction } from "../../enum/agreement-action";

@Component({
  templateUrl: './agreements.component.html',
  styleUrls: ['./agreements.component.scss']
})
export class AgreementsComponent implements OnInit {
  @Select(AgreementListState.agreements) agreements$: Observable<Agreement[]>;
  @Select(AgreementListState.status) status$: Observable<StateStatus>;
  @Select(AgreementListState.totalCount) totalCount$: Observable<number>;

  readonly pageSize = 10;
  readonly actions: {agreementAction: AgreementAction | AgreementAction[], label: string}[] = AgreementActionFilters;
  pages$: Observable<number>;

  form = new FormGroup({
    actions: new FormControl(null)
  });

  constructor(
    public store: Store,
    public route: ActivatedRoute,
    public router: Router
  ) {}

  ngOnInit() {
    this.pages$ = this.route.queryParams.pipe(map(params => +params["page"]));
    this.form.valueChanges.subscribe(
      () => {
        this.router.navigate(["."], {relativeTo: this.route, queryParams: null});
        const action = this.form.value;
        this.store.dispatch(new Fetch(action, 0, this.pageSize));
      }
    );
  }

  loadPage(page: number) {
    this.store.dispatch(new Fetch(this.form.value, (page - 1) * this.pageSize, this.pageSize));
  }
}
