import {AfterViewInit, Component, ElementRef, EventEmitter, Inject, Input, OnInit, Output, ViewChild} from '@angular/core';
import {TechnicalProposal} from "../../models/technical-proposal";
import {RequestPosition} from "../../models/request-position";
import {RequestOfferPosition} from "../../models/request-offer-position";
import {ContragentList} from "../../../../contragent/models/contragent-list";
import {RequestPositionWorkflowSteps} from "../../enum/request-position-workflow-steps";
import * as moment from "moment";
import {Uuid} from "../../../../cart/models/uuid";
import {AbstractControl, FormArray, FormBuilder, FormGroup} from "@angular/forms";
import {CustomValidators} from "../../../../shared/forms/custom.validators";
import {RequestPositionList} from "../../models/request-position-list";
import {ActivatedRoute, Route} from "@angular/router";
import {ClrLoadingState} from "@clr/angular";
import {GpnmarketConfigInterface} from "../../../../core/config/gpnmarket-config.interface";
import { APP_CONFIG } from '@stdlib-ng/core';

@Component({
  selector: 'app-request-commercial-proposals',
  templateUrl: './request-commercial-proposals.component.html',
  styleUrls: ['./request-commercial-proposals.component.scss']
})
export class RequestCommercialProposalsComponent implements OnInit {

  form: FormGroup;
  requestId: Uuid;
  appConfig: GpnmarketConfigInterface;

  isFolded = [];

  @Input() requestPositions: RequestPosition[] = [];
  @Input() suppliers: ContragentList[];
  @Output() sentForAgreement = new EventEmitter<{ requestId: Uuid, selectedPositions: RequestPosition[] }>();
  @Output() addOffer = new EventEmitter<RequestPosition>();
  @Output() cancelOffer = new EventEmitter<RequestPosition>();

  supplier: ContragentList;

  get formPositions() {
    return this.form.get('positions') as FormArray;
  }

  /**
   * Время в течение которого бэкофис может отозвать КП (в секундах)
   */
  protected durationCancelPublish = 10 * 60;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
  @Inject(APP_CONFIG) appConfig: GpnmarketConfigInterface) {
    this.appConfig = appConfig;
  }

  ngOnInit() {
    this.requestId = this.route.snapshot.paramMap.get('id');

    this.form = this.fb.group({
      checked: false,
      positions: this.fb.array([], CustomValidators.oneOrMoreSelected)
    });

    this.requestPositions.map(position => this.formPositions.push(
      this.createFormGroupPosition(position)));
  }

  createFormGroupPosition(position: RequestPositionList) {
    return this.fb.group({
      checked: false,
      position: position
    });
  }

  positionCanBeSelected(requestPosition: RequestPosition): boolean {
    return (
      requestPosition.linkedOffers.length !== 0 &&
      requestPosition.status === RequestPositionWorkflowSteps.PROPOSALS_PREPARATION
    );
  }

  canAddOffer(requestPosition: RequestPosition): boolean {
    return requestPosition.status === RequestPositionWorkflowSteps.PROPOSALS_PREPARATION;
  }

  positionIsSentForAgreement(requestPosition: RequestPosition): boolean {
    return requestPosition.status === RequestPositionWorkflowSteps.RESULTS_AGREEMENT;
  }

  positionWithWinner(requestPosition: RequestPosition): boolean {
    return requestPosition.status === RequestPositionWorkflowSteps.WINNER_SELECTED;
  }

  correctDeliveryDate(linkedOfferDeliveryDate: string, requestPositionDeliveryDate: string): boolean {
    if (!requestPositionDeliveryDate) {
      return true;
    }

    const controlDate = moment(linkedOfferDeliveryDate);
    const validationDate = moment(requestPositionDeliveryDate);

    return controlDate.isSameOrBefore(validationDate);
  }

  findSupplier(supplierId: Uuid): ContragentList {
    this.supplier = this.suppliers.find(supplier => supplier.id === supplierId);
    return this.supplier;
  }

  submit(controls: AbstractControl[]) {
    const selectedPositions = controls.filter(control => control.get('checked').value).map(control => control.get('position').value);
    this.sentForAgreement.emit({requestId: this.requestId, selectedPositions: selectedPositions});
  }

  newCommercialProposal(position) {
    this.addOffer.emit(position);
  }

  availableCancelPublishOffers(requestPosition: RequestPosition) {
    return requestPosition.status === RequestPositionWorkflowSteps.RESULTS_AGREEMENT
      && this.getDurationChangeStatus(requestPosition) < this.durationCancelPublish;
  }

  positionHasProcedure(requestPosition: RequestPosition): boolean {
    return requestPosition.hasProcedure;
  }

  positionHasFinishedProcedure(requestPosition: RequestPosition): boolean {
    return requestPosition.procedureEndDate && !requestPosition.hasProcedure;
  }

  getProcedureLink(requestPosition: RequestPosition): string {
    const procedureUrl = this.appConfig.procedure.url;
    const id = requestPosition.procedureId;

    return procedureUrl + id;
  }

  /**
   * Возвращает время в секундах, которое прошло с момента смены статуса ТП
   * @param requestPosition
   */
  protected getDurationChangeStatus(requestPosition: RequestPosition): number {
    return moment().diff(moment(requestPosition.statusChangedDate), 'seconds');
  }

  onCancelPublishOffers(requestPosition: RequestPosition) {
    this.cancelOffer.emit(requestPosition);
  }

  isOverflow(positionCard: HTMLElement) {
    return positionCard.scrollHeight > positionCard.clientHeight + 30;
  }
}
