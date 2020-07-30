import { ActivatedRoute } from "@angular/router";
import {
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import { filter, switchMap, takeUntil, tap } from "rxjs/operators";
import { Observable, Subject } from "rxjs";
import { Request } from "../../../common/models/request";
import { TechnicalProposals } from "../../actions/technical-proposal.actions";
import { TechnicalProposal } from "../../../common/models/technical-proposal";
import { Uuid } from "../../../../cart/models/uuid";
import { UxgBreadcrumbsService, UxgTabTitleComponent } from "uxg";
import { RequestPosition } from "../../../common/models/request-position";
import { FeatureService } from "../../../../core/services/feature.service";
import { RequestActions } from "../../actions/request.actions";
import { Select, Store } from "@ngxs/store";
import { RequestState } from "../../states/request.state";
import { TechnicalProposalsStatus } from "../../../common/enum/technical-proposals-status";
import { TechnicalProposalState } from "../../states/technical-proposal.state";
import { StateStatus } from "../../../common/models/state-status";
import Fetch = TechnicalProposals.Fetch;
import Update = TechnicalProposals.Update;

@Component({
  templateUrl: './technical-proposal-list.component.html',
  styleUrls: ['./technical-proposal-list.component.scss'],
})
export class TechnicalProposalListComponent implements OnInit, OnDestroy {
  @ViewChild('sentToReviewTab') sentToReviewTabElRef: UxgTabTitleComponent;
  @ViewChild('reviewedTab') reviewedTabElRef: UxgTabTitleComponent;
  @ViewChild('sentToEditTab') sentToEditTabElRef: UxgTabTitleComponent;

  @Select(TechnicalProposalState.status)
  readonly status$: Observable<StateStatus>;

  @Select(RequestState.request)
  readonly request$: Observable<Request>;

  @Select(TechnicalProposalState.proposalsByStatus([TechnicalProposalsStatus.SENT_TO_REVIEW]))
  readonly proposalsSentToReview$: Observable<TechnicalProposal[]>;

  @Select(TechnicalProposalState.proposalsByStatus([TechnicalProposalsStatus.SENT_TO_EDIT]))
  readonly proposalsSentToEdit$: Observable<TechnicalProposal[]>;

  @Select(TechnicalProposalState.proposalsByStatus([
    TechnicalProposalsStatus.ACCEPTED,
    TechnicalProposalsStatus.PARTIALLY_ACCEPTED,
    TechnicalProposalsStatus.CANCELED
  ]))
  readonly proposalsReviewed$: Observable<TechnicalProposal[]>;

  @Select(TechnicalProposalState.proposals)
  readonly technicalProposals$: Observable<TechnicalProposal[]>;

  @Select(TechnicalProposalState.proposalAvailableStatuses)
  readonly technicalProposalAvailableStatuses$: Observable<TechnicalProposalsStatus[]>;

  readonly destroy$ = new Subject();
  requestId: Uuid;
  positions$: Observable<RequestPosition[]>;
  technicalProposalsStatus = TechnicalProposalsStatus;
  activeTab = 'SENT_TO_REVIEW';

  constructor(
    private route: ActivatedRoute,
    private bc: UxgBreadcrumbsService,
    public featureService: FeatureService,
    public store: Store,
    private cd: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.route.params.pipe(
      tap(({id}) => this.requestId = id),
      tap(({id}) => this.store.dispatch(new Fetch(id))),
      switchMap(({id}) => this.store.dispatch(new RequestActions.Fetch(id))),
      switchMap(() => this.request$),
      filter(request => !!request),
      tap(({id, number}) => this.bc.breadcrumbs = [
        { label: "Заявки", link: "/requests/customer" },
        { label: `Заявка №${number}`, link: `/requests/customer/${id}` },
        { label: 'Согласование технических предложений', link: `/requests/customer/${id}/technical-proposals` }
      ]),
      takeUntil(this.destroy$)
    ).subscribe();

    this.cd.detectChanges();
    this.technicalProposals$.subscribe(data => {
      if (data) {
        this.switchToPrioritizedTab(data);
      }
    });
  }

  get activeList$(): Observable<TechnicalProposal[]> {
    switch (this.activeTab) {
      case this.technicalProposalsStatus.SENT_TO_REVIEW:
        return this.proposalsSentToReview$;
      case this.technicalProposalsStatus.SENT_TO_EDIT:
        return this.proposalsSentToEdit$;
      case this.technicalProposalsStatus.ACCEPTED:
        return this.proposalsReviewed$;
      default:
        return this.proposalsSentToReview$;
    }
  }

  filter(filters: {}) {
    this.store.dispatch(new Update(this.requestId, filters)).subscribe(
      ({ CustomerTechnicalProposals }) => {
        this.switchToPrioritizedTab(CustomerTechnicalProposals.proposals);
      });
  }

  switchToPrioritizedTab(proposals): void {
    if (this.getProposalsCountByTab(proposals, this.activeTab) > 0) {
      return;
    }

    if (this.getProposalsCountByTab(proposals, TechnicalProposalsStatus.SENT_TO_REVIEW) > 0) {
      this.clickOnTab(TechnicalProposalsStatus.SENT_TO_REVIEW);
      return;
    }
    if (this.getProposalsCountByTab(proposals, TechnicalProposalsStatus.SENT_TO_EDIT) > 0) {
      this.clickOnTab(TechnicalProposalsStatus.SENT_TO_EDIT);
      return;
    }
    if (this.getProposalsCountByTab(proposals, TechnicalProposalsStatus.ACCEPTED) > 0) {
      this.clickOnTab("REVIEWED");
      return;
    }
  }


  clickOnTab(tab): void {
    switch (tab) {
      case TechnicalProposalsStatus.SENT_TO_REVIEW:
        if (this.sentToReviewTabElRef) {
          this.sentToReviewTabElRef.el.nativeElement.click();
        } else {
          return;
        }
        break;
      case TechnicalProposalsStatus.SENT_TO_EDIT:
        if (this.sentToEditTabElRef) {
          this.sentToEditTabElRef.el.nativeElement.click();
        } else {
          return;
        }
        break;
      case "REVIEWED":
        if (this.reviewedTabElRef) {
          this.reviewedTabElRef.el.nativeElement.click();
        } else {
          return;
        }
        break;
      default:
        return;
    }
  }

  getProposalsCountByTab(proposals, tab): number {
    let statuses = [];

    switch (tab) {
      case TechnicalProposalsStatus.SENT_TO_REVIEW:
        statuses = [TechnicalProposalsStatus.SENT_TO_REVIEW];
        break;
      case TechnicalProposalsStatus.SENT_TO_EDIT:
        statuses = [TechnicalProposalsStatus.SENT_TO_EDIT];
        break;
      case TechnicalProposalsStatus.ACCEPTED:
        statuses = [
          TechnicalProposalsStatus.ACCEPTED,
          TechnicalProposalsStatus.PARTIALLY_ACCEPTED,
          TechnicalProposalsStatus.CANCELED
        ];
        break;
    }

    return proposals.filter(proposal => statuses.indexOf(proposal.status) > -1).length;
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
