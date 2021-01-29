import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Uuid } from "../../../../cart/models/uuid";
import { RequestComponent as CommonRequestComponent } from "../../../common/components/request/request.component";
import { Actions, Select, Store } from "@ngxs/store";
import { Observable, Subject } from "rxjs";
import { Request } from "../../../common/models/request";
import { RequestPositionList } from "../../../common/models/request-position-list";
import { StateStatus } from "../../../common/models/state-status";
import { ActivatedRoute } from "@angular/router";
import { RequestService } from "../../../customer/services/request.service";
import { UxgBreadcrumbsService } from "uxg";
import { Title } from "@angular/platform-browser";
import { filter, switchMap, takeUntil, tap } from "rxjs/operators";
import { RequestActions } from "../../actions/request.actions";
import { RequestState } from "../../states/request.state";
import { PositionService } from "../../../back-office/services/position.service";
import { PositionStatus } from "../../../common/enum/position-status";
import { PositionFilter } from "../../../common/models/position-filter";
import Refresh = RequestActions.Refresh;
import RefreshPositions = RequestActions.RefreshPositions;
import FetchPositions = RequestActions.FetchPositions;
import Fetch = RequestActions.Fetch;
import { Toast } from "../../../../shared/models/toast";
import { ToastActions } from "../../../../shared/actions/toast.actions";

@Component({
  templateUrl: './request.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RequestComponent implements OnInit, OnDestroy {
  requestId: Uuid;
  positionFilter: PositionFilter;
  @ViewChild('commonRequestComponent') commonRequestComponent: CommonRequestComponent;
  @Select(RequestState.request) request$: Observable<Request>;
  @Select(RequestState.positions) positions$: Observable<RequestPositionList[]>;
  @Select(RequestState.status) status$: Observable<StateStatus>;
  @Select(RequestState.positionsStatus) positionsStatus$: Observable<StateStatus>;
  readonly destroy$ = new Subject();
  readonly refresh = id => new Refresh(id);
  readonly refreshPositions = id => new RefreshPositions(id);

  constructor(
    private route: ActivatedRoute,
    private requestService: RequestService,
    private bc: UxgBreadcrumbsService,
    private actions: Actions,
    public store: Store,
    private title: Title,
    private positionService: PositionService,
  ) {
  }

  ngOnInit() {
    this.route.params.pipe(
      tap(({id}) => this.requestId = id),
      switchMap(({id}) => {
        this.positionFilter = this.route.snapshot.queryParams.showOnlyApproved === '1' ?
          { "notStatuses": [PositionStatus.PROOF_OF_NEED]} : { "statuses": [PositionStatus.PROOF_OF_NEED]};
        return this.store.dispatch([new Fetch(id), new FetchPositions(id, this.positionFilter)]);
      }),
      switchMap(() => this.request$),
      filter(request => !!request),
      tap(({id, name}) => this.title.setTitle(name || "Заявка №" + id)),
      tap(({id, number}) => this.bc.breadcrumbs = [
        {label: "Заявки", link: "/requests/approver"},
        {label: `Заявка №${number}`, link: "/requests/approver/" + id,
          queryParams: {showOnlyApproved: this.route.snapshot.queryParams.showOnlyApproved}}
      ]),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  rejectPositions(positionIds: Uuid[]) {
    this.positionService.changePositionsStatus(positionIds, 'CANCELED', 'customer').subscribe(
      () => this.store.dispatch(
        [new ToastActions.Success(positionIds.length > 1 ? positionIds.length + 'позиции отклонены' : 'Позиция отклонена'),
        new RefreshPositions(this.requestId, this.positionFilter)]));
  }

  approvePositions(positionIds: Uuid[]) {
    this.requestService.changePositionsStatus(positionIds, PositionStatus.NEW).subscribe(
      () => this.store.dispatch(
        [new ToastActions.Success(positionIds.length > 1 ? positionIds.length + 'позиции успешно согласованы' :
          'Позиция успешно согласована'),
        new RefreshPositions(this.requestId, this.positionFilter)]));
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}