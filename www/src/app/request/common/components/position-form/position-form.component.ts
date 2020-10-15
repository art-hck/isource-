import { ChangeDetectionStrategy, Component, EventEmitter, forwardRef, Input, OnInit, Output, ViewChild } from '@angular/core';
import { DatePipe } from "@angular/common";
import { ControlValueAccessor, FormBuilder, FormGroup, NG_VALIDATORS, NG_VALUE_ACCESSOR, Validator, Validators } from "@angular/forms";
import { debounceTime, filter, flatMap, map, shareReplay, startWith, tap } from "rxjs/operators";
import { merge, Observable, of, Subject, Subscription } from "rxjs";
import { RequestPositionService } from "../../services/request-position.service";
import { CustomValidators } from "../../../../shared/forms/custom.validators";
import { PositionCurrency } from "../../enum/position-currency";
import { RequestPosition } from "../../models/request-position";
import { RequestPositionStatusService } from "../../services/request-position-status.service";
import { PositionStatus as PositionStatuses } from "../../enum/position-status";
import { Uuid } from "../../../../cart/models/uuid";
import { UserInfoService } from "../../../../user/service/user-info.service";
import { NormPositionService } from "../../../../shared/services/norm-position.service";
import * as moment from 'moment';
import { UxgDropdownInputComponent } from "uxg";
import { OkeiService } from "../../../../shared/services/okei.service";
import { Okei } from "../../../../shared/models/okei";
import { CurrencyLabels } from "../../dictionaries/currency-labels";
import { Store } from "@ngxs/store";

@Component({
  selector: 'app-request-position-form',
  templateUrl: './position-form.component.html',
  styleUrls: ['./position-form.component.scss'],
  providers: [
    DatePipe,
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PositionFormComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => PositionFormComponent),
      multi: true,
    }
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class PositionFormComponent implements OnInit, ControlValueAccessor, Validator  {
  @Input() requestId: Uuid;
  @Input() position: RequestPosition = new RequestPosition();
  @Input() onDrafted: (position: RequestPosition) => Observable<RequestPosition>;
  @Input() isNewRequest = false;
  @Output() cancel = new EventEmitter();
  @Output() positionChange = new EventEmitter<RequestPosition>();
  @ViewChild('nameRef') nameDropdownInputRef: UxgDropdownInputComponent;
  form: FormGroup;
  subscription = new Subscription();
  okeiList$: Observable<Okei[]>;
  onTouched: (value) => void;
  onChange: (value) => void;
  value;

  readonly currencies = Object.entries(CurrencyLabels);

  readonly approveRequiredFields = [
    'name',
    'currency',
    'deliveryBasis',
    'deliveryDate',
    'isDeliveryDateAsap',
    'measureUnit',
    'productionDocument',
    'quantity',
    'startPrice'
  ];

  get isDraft(): boolean {
    return !this.position;
  }

  /**
   * Проверяем, изменилось ли одно из полей, по которым позиция должна отправиться на согласование
   */
  get fieldsForApprovalChanged(): boolean {
    return this.approveRequiredFields.some(
      controlName => {
        const formValue = this.form.get(controlName).value;
        const updatedInfo = formValue === null ? formValue : formValue.toString();

        let positionInfo = this.position[controlName] === null ? this.position[controlName] : this.position[controlName]?.toString();

        if (controlName === 'deliveryDate') {
          positionInfo = moment(new Date(this.position[controlName])).format('DD.MM.YYYY');
        }

        return positionInfo !== updatedInfo;
      }
    );
  }

  /**
   * Узнаём, должна ли позиция быть отправлена на согласование или должна быть просто сохранена
   */
  get needToSendToApprove(): boolean {
    return (this.isDraft || this.fieldsForApprovalChanged || !this.position.id) && !!this.onDrafted;
  }

  constructor(
    private formBuilder: FormBuilder,
    private datePipe: DatePipe,
    private statusService: RequestPositionStatusService,
    private positionService: RequestPositionService,
    public okeiService: OkeiService,
    private store: Store
  ) {}

  ngOnInit() {
    const p = this.position;
    const form = this.formBuilder.group({
      name: [p.name, Validators.required],
      comments: [p.comments],
      currency: [p.currency, Validators.required],
      deliveryBasis: [p.deliveryBasis, Validators.required],
      deliveryDate: [this.datePipe.transform(p.deliveryDate, 'dd.MM.yyyy'), CustomValidators.futureDate()],
      isDeliveryDateAsap: [p.isDeliveryDateAsap],
      isDesignRequired: [p.isDesignRequired],
      isInspectionControlRequired: [p.isInspectionControlRequired || false],
      isPnrRequired: [p.isPnrRequired || false],
      isShmrRequired: [p.isShmrRequired || false],
      measureUnit: [p.measureUnit, Validators.required],
      paymentTerms: [p.paymentTerms || '30 дней по факту поставки', Validators.required],
      productionDocument: [p.productionDocument, Validators.required],
      quantity: [p.quantity, [Validators.required, Validators.pattern("^[.0-9]+$"), Validators.min(0.0001)]],
      startPrice: [p.startPrice, [Validators.pattern("^[0-9]+$"), Validators.min(1)]],
      documents: [[]]
    });

    if (this.position.id) {
      Object.keys(form.controls).filter(key => !this.position.availableEditFields.includes(key)).forEach(key => form.get(key).disable());
    }

    form.get('isDeliveryDateAsap').valueChanges
      .pipe(
        startWith(<{}>form.get('isDeliveryDateAsap').value),
        filter(() => form.get('isDeliveryDateAsap').enabled)
      )
      .subscribe(checked => {
        if (checked) {
          form.get('deliveryDate').reset();
          form.get('deliveryDate').disable();
        } else {
          form.get('deliveryDate').enable();
        }
      });

    // @TODO Временное отключение валют
    form.get('currency').setValue(PositionCurrency.RUB);
    form.get('currency').disable();

    this.form = form;
    this.form.valueChanges.pipe(startWith(<{}>this.form.value)).subscribe(value => {
      this.writeValue(value);
      if (this.onChange) {
        this.onChange(value);
      }
    });
    this.okeiList$ = this.okeiService.getOkeiList().pipe(shareReplay(1));
  }

  submit() {
    if (this.form.invalid) {
      return;
    } else {
      let submit$: Observable<RequestPosition>;

      if (this.position.id) {
        // Проверяем, есть ли правки для сохранения или данные в форме остались без изменений
        // Если изменений нет, эмитим событие для закрытия окна и прерываем сабмит
        if (!this.positionInfoChanged()) {
          this.cancel.emit();
          return;
        }

        submit$ = this.positionService.updatePosition(this.position.id, this.form.value);
      } else {
        submit$ = this.positionService.addPosition(this.requestId, [this.form.value])
          .pipe(map(positions => positions[0]));
      }

      submit$ = submit$.pipe(
        flatMap(position =>
          position.status === PositionStatuses.DRAFT && this.onDrafted ? this.onDrafted(position) : of(position)
        ));

      this.form.disable();
      this.subscription.add(submit$.subscribe(position => {
        this.positionChange.emit(position);
        this.position = position;
        this.form.enable();
      }));
    }
  }

  /**
   * Проверяем, менялись ли значения в форме информации о позиции или они все соответствуют сохранённым значениям
   */
  positionInfoChanged(): boolean {
    return Object.entries(this.form.value).some(([key, value]) => {
      let positionInfo = this.position[key] === null ? this.position[key] : this.position[key].toString();
      const updatedInfo = value === null ? value : value.toString();

      if (key === 'deliveryDate') {
        positionInfo = moment(new Date(this.position[key])).format('DD.MM.YYYY');
      }
      return positionInfo !== updatedInfo;
    });
  }

  filterEnteredText(event: KeyboardEvent): boolean {
    return event.key !== "-" && event.key !== "+";
  }

  registerOnChange = (fn: any) => this.onChange = fn;
  registerOnTouched = (fn: any) => this.onTouched = fn;
  writeValue = (value) => this.value = value;
  validate = () => this.form.invalid ? {invalid: true} : null;
}
