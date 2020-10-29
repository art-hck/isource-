import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { RequestPosition } from "../../../common/models/request-position";
import { UxgModalComponent } from "uxg";
import { iif, Observable, Subject, throwError } from "rxjs";
import { ProposalGroup } from "../../../common/models/proposal-group";
import { catchError, finalize, map, takeUntil } from "rxjs/operators";
import { FormBuilder, Validators } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { RequestService } from "../../services/request.service";
import { Uuid } from "../../../../cart/models/uuid";
import { Store } from "@ngxs/store";
import { ToastActions } from "../../../../shared/actions/toast.actions";
import { searchPosition } from "../../../../shared/helpers/search";
import { TechnicalCommercialProposalService } from "../../services/technical-commercial-proposal.service";

@Component({
  selector: 'app-technical-commercial-proposal-group-form',
  templateUrl: './technical-commercial-proposal-group-form.component.html',
  styleUrls: ['./technical-commercial-proposal-group-form.component.scss']
})
export class TechnicalCommercialProposalGroupFormComponent implements OnInit, OnDestroy {
  @ViewChild('createGroup') createGroup: UxgModalComponent;
  @Output() cancel = new EventEmitter();
  @Output() create = new EventEmitter<ProposalGroup>();
  @Input() availablePositions$: Observable<RequestPosition[]>;
  @Input() requestId: Uuid;
  @Input() group: ProposalGroup;
  isLoading = false;
  readonly searchPosition = searchPosition;
  readonly destroy$ = new Subject();
  mergeWithExistPositions$: Observable<(RequestPosition | ProposalGroup['requestPositions'][number])[]>;

  readonly form = this.fb.group({
    name: [null, Validators.required],
    requestPositions: [null, [Validators.minLength(1), Validators.required]]
  });

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private requestService: RequestService,
    private service: TechnicalCommercialProposalService,
    private store: Store
  ) {}

  ngOnInit() {
    this.form.patchValue(this.group ?? {});

    this.mergeWithExistPositions$ = this.availablePositions$?.pipe(map(
      positions => (this.group?.requestPositions ?? [])
        .filter(groupPosition => positions?.every(({ id }) => groupPosition.id !== id))
        .reduce((arr, curr) => [curr, ...arr], positions)
    ));
  }

  mergeWithExistPositions(positions: RequestPosition[]) {
    return (this.group?.requestPositions ?? [])
      .filter(groupPosition => positions.every(({ id }) => groupPosition.id !== id))
      .reduce((arr, curr) => [curr, ...arr], positions);
  }

  submit() {
    if (this.form.invalid) { return; }

    this.isLoading = true;

    const body = {
      ...this.form.value,
      requestPositions: this.form.value.requestPositions.map(({ id }) => id)
    };

    iif(() => !this.group?.id,
      this.service.groupCreate(this.requestId, body),
      this.service.groupUpdate(this.requestId, this.group?.id, body)
    ).pipe(
      finalize(() => this.isLoading = false),
      takeUntil(this.destroy$),
      catchError(err => {
        this.store.dispatch(new ToastActions.Error(err?.error?.detail || "Ошибка при создании ТКП"));
        return throwError(err);
      }),
    ).subscribe(group => this.create.emit(group));
  }

  trackById = (item: RequestPosition) => item.id;

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
