import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Input, OnDestroy, OnInit, QueryList, ViewChildren } from '@angular/core';
import { Uuid } from "../../../../cart/models/uuid";
import { Actions, Store } from "@ngxs/store";
import { Subject } from "rxjs";
import { getCurrencySymbol } from "@angular/common";
import { takeUntil, tap } from "rxjs/operators";
import { RequestPosition } from "../../../common/models/request-position";
import { Proposal } from "../../../../shared/components/grid/proposal";
import { RequestOfferPosition } from "../../../common/models/request-offer-position";
import { Position } from "../../../../shared/components/grid/position";
import { FormControl, Validators } from "@angular/forms";
import { ProposalHelperService } from "../../../../shared/components/grid/proposal-helper.service";

@Component({
  selector: 'app-commercial-proposal-list',
  templateUrl: './commercial-proposal-list.component.html',
  styleUrls: ['commercial-proposal-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CommercialProposalListComponent implements OnDestroy, OnInit {
  @Input() position: Position<RequestPosition>;
  @Input() proposals: Proposal<RequestOfferPosition>[];
  @Input() chooseBy$: Subject<"date" | "price">;
  @Input() requestId: Uuid;
  readonly destroy$ = new Subject();
  getCurrencySymbol = getCurrencySymbol;
  selectedProposal = new FormControl(null, Validators.required);
  folded = false;
  gridRows = [];

  get isReviewed(): boolean {
    return this.proposals.some(({ isWinner }) => isWinner);
  }

  constructor(
    public helper: ProposalHelperService,
    private store: Store,
    private actions: Actions,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    if (this.chooseBy$) {
      this.chooseBy$.pipe(
        tap(type => this.selectedProposal.setValue(this.helper.chooseBy(type, this.position, this.proposals))),
        takeUntil(this.destroy$)
      ).subscribe(() => this.cd.detectChanges());
    }

    // Workaround sync with multiple elements per one formControl
    this.selectedProposal.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(v => this.selectedProposal.setValue(v, {onlySelf: true, emitEvent: false}));
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  approve() {
    // this.dispatchAction(new Approve(this.requestId, this.selectedProposalPosition.value));
  }

  reject() {
    // this.dispatchAction(new Reject(this.requestId, this.proposalByPos.position));
  }

  trackByProposaId = (i, {id}: Proposal) => id;
}
