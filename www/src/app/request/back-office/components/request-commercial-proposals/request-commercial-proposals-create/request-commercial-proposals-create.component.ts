import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { fromEvent, merge, Subscription } from "rxjs";
import { auditTime } from "rxjs/operators";
import { OffersService } from "../../../services/offers.service";
import { RequestPosition } from "../../../../common/models/request-position";
import { Uuid } from "../../../../../cart/models/uuid";
import * as moment from "moment";
import { CustomValidators } from "../../../../../shared/forms/custom.validators";

@Component({
  selector: 'app-request-commercial-proposals-create',
  templateUrl: './request-commercial-proposals-create.component.html',
  styleUrls: ['./request-commercial-proposals-create.component.scss']
})
export class RequestCommercialProposalsCreateComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() position: RequestPosition;

  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() addOffer = new EventEmitter();
  @Output() cancel = new EventEmitter();

  @Input() addOfferModalOpen = false;

  @ViewChild('contragentName', { static: false }) contragentName: ElementRef;

  isLoading: boolean;

  newCommercialProposalForm: FormGroup;
  newCommercialProposalFormHelper: FormGroup;

  quantityNotEnough = false;
  dateIsLaterThanNeeded = false;

  selectedContragentId: Uuid;

  subscription = new Subscription();

  get formDocuments() {
    return this.newCommercialProposalForm.get('documents') as FormArray;
  }

  constructor(
    private formBuilder: FormBuilder,
    protected offersService: OffersService,
  ) { }

  ngOnInit() {
    this.newCommercialProposalForm = this.formBuilder.group({
      supplierContragentId: [null, Validators.required],
      priceWithVat: [null, [Validators.required, Validators.min(1)]],
      currency: ['RUB', Validators.required],
      quantity: [null, [Validators.required, Validators.min(1)]],
      measureUnit: [null, Validators.required],
      deliveryDate: [null, [Validators.required, CustomValidators.futureDate()]],
      paymentTerms: ['30 дней по факту поставки', Validators.required],
      documents: this.formBuilder.array([]),
    });

    this.newCommercialProposalFormHelper = this.formBuilder.group({
      contragentName: [null, Validators.required],
      contragent: [null, [Validators.required, (control) => this.supplierOfferExists(control)]],
    });
  }

  ngAfterViewInit() {
    // // @TODO: uxg-autocomplete!
    merge(
      this.newCommercialProposalFormHelper.get("contragent").valueChanges,
      fromEvent(this.contragentName.nativeElement, "blur"),
    )
      .pipe(auditTime(100))
      .subscribe(() => {
        const value = this.newCommercialProposalFormHelper.get("contragent").value;

        this.newCommercialProposalFormHelper.get("contragentName").setValue(value ? value[0].shortName : null, { emitEvent: false });
        this.newCommercialProposalFormHelper.get("contragentName").updateValueAndValidity();

        this.selectedContragentId = value ? value[0].id : null;
        this.newCommercialProposalForm.get("supplierContragentId").setValue(value ? value[0].id : null, { emitEvent: false });
        this.newCommercialProposalForm.get("supplierContragentId").updateValueAndValidity();

        if (this.newCommercialProposalFormHelper.get("contragent").errors) {
          this.newCommercialProposalFormHelper.get("contragentName").setErrors({ supplierOfferExist: true });
        } else {
          this.newCommercialProposalForm.updateValueAndValidity();
        }
      });
  }

  filesDropped(files: FileList): void {
    Array.from(files).forEach(
      file => this.formDocuments.push(this.formBuilder.control(file))
    );
  }

  filesSelected(e) {
    this.filesDropped(e.target.files);
    e.target.value = '';
  }

  submit() {
    this.isLoading = true;
    this.newCommercialProposalForm.disable();

    const body = this.newCommercialProposalForm.value;

    // Отправляем КП
    this.offersService.addOffer(this.position.request.id, this.position.id, body).subscribe(tp => {
      this.addOffer.emit(tp);
    });
  }

  filterEnteredText(event: KeyboardEvent): boolean {
    const key = Number(event.key);
    return (key >= 0 && key <= 9);
  }

  /**
   * Функция проверяет, добавлено ли уже КП от выбранного поставщика
   *
   * @param control
   */
  supplierOfferExists(control: FormControl): any {
    if (!control.value || !this.position) {
      return null;
    }

    const ids = [];

    for (const linkedOffer of this.position.linkedOffers) {
      ids.push(linkedOffer.supplierContragentId);
    }

    if (ids.indexOf(control.value[0].id) !== -1) {
      return { supplierOfferExist: true };
    }
  }

  /**
   * Функция проверяет, введено ли количество меньше требуемого количества
   *
   * @param position
   * @param value
   */
  checkQuantity(position, value): void {
    if (!value || value === '') {
      this.quantityNotEnough = false;
    } else {
      this.quantityNotEnough = value < position.quantity;
    }
  }

  /**
   * Функция проверяет, введена ли дата доставки раньше требуемой по позиции даты
   *
   * @param position
   * @param enteredDate
   */
  checkDeliveryDate(position, enteredDate): void {
    if (!moment(enteredDate, 'DD.MM.YYYY', true).isValid()) {
      this.dateIsLaterThanNeeded = false;
    } else {
      const controlDate = moment(moment(position.deliveryDate).format('DD.MM.YYYY'), 'DD.MM.YYYY');
      const validationDate = moment(enteredDate, 'DD.MM.YYYY');

      this.dateIsLaterThanNeeded = controlDate.isBefore(validationDate);
    }
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
