import { AfterContentInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, forwardRef, OnDestroy, Output } from '@angular/core';
import { AbstractControl, ControlValueAccessor, FormArray, FormBuilder, FormControl, NG_VALUE_ACCESSOR, Validators } from "@angular/forms";
import { TechnicalCommercialProposalPosition } from "../../../../common/models/technical-commercial-proposal-position";
import { shareReplay, takeUntil } from "rxjs/operators";
import { OkeiService } from "../../../../../shared/services/okei.service";
import { Okei } from "../../../../../shared/models/okei";
import { CustomValidators } from "../../../../../shared/forms/custom.validators";
import { DatePipe } from "@angular/common";
import { CurrencyLabels } from "../../../../common/dictionaries/currency-labels";
import { PositionCurrency } from "../../../../common/enum/position-currency";
import * as moment from "moment";
import { PaymentTerms } from "../../../../common/enum/payment-terms";
import { PaymentTermsLabels } from "../../../../common/dictionaries/payment-terms-labels";
import { Subject } from "rxjs";

@Component({
  selector: 'app-technical-commercial-proposal-parameters-form',
  templateUrl: './technical-commercial-proposal-parameters-form.component.html',
  styleUrls: ['./technical-commercial-proposal-parameters-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    DatePipe,
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TechnicalCommercialProposalParametersFormComponent),
      multi: true
    }
  ]
})
export class TechnicalCommercialProposalParametersFormComponent implements AfterContentInit, ControlValueAccessor, OnDestroy {
  @Output() cancel = new EventEmitter();
  onTouched: (value) => void;
  onChange: (value) => void;
  value: TechnicalCommercialProposalPosition[];
  formArray: FormArray;
  readonly okeiList$ = this.okeiService.getOkeiList().pipe(shareReplay(1));
  readonly currencies = Object.entries(CurrencyLabels);
  readonly paymentTerms = Object.entries(PaymentTermsLabels);
  readonly paymentTermsControl = this.fb.control(PaymentTerms.Days30);
  readonly destroy$ = new Subject();

  constructor(
    public okeiService: OkeiService,
    private cd: ChangeDetectorRef,
    private fb: FormBuilder,
    private datePipe: DatePipe,
  ) {
  }

  ngAfterContentInit() {
    this.formArray = this.fb.array(
      this.value.map((p, index) => {
        const form = this.fb.group({
          index: [index],
          name: [p.position.name, Validators.required],
          priceWithoutVat: [p.priceWithoutVat || p.position.startPrice, [Validators.required, Validators.min(1)]],
          quantity: [p.quantity || p.position.quantity, [Validators.required, Validators.min(0.0001)]],
          measureUnit: [p.measureUnit || p.position.measureUnit, Validators.required],
          currency: [p.currency || p.position.currency || PositionCurrency.RUB, Validators.required],
          deliveryDate: [this.parseDate(p.deliveryDate || p.position.deliveryDate), CustomValidators.futureDate()],
          paymentTerms: [p.paymentTerms || p.position.paymentTerms, Validators.required],
        });

        // @TODO Временное отключение валют
        form.get('currency').setValue(PositionCurrency.RUB);
        form.get('currency').disable();
        return form;
      })
    );

    this.paymentTermsControl.setValue(this.value[0].paymentTerms || this.value[0].position.paymentTerms);
    this.paymentTermsControl.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(paymentTerms => this.formArray.patchValue(this.formArray.value.fill({paymentTerms})));

    this.cd.detectChanges();
  }

  submit() {
    this.formArray.controls.forEach(c => c.markAsDirty());
    this.formArray.controls.forEach(c => c.markAsTouched());

    if (this.formArray.valid) {
      const value = this.value
        .map((item, i) => ({...item, ...this.formArray.getRawValue().find(_item => _item.index === i)}))
        .map(item => {
          const deliveryDate = item.deliveryDate.replace(/(\d{2}).(\d{2}).(\d{4})/, '$3-$2-$1');
          return { ...item, deliveryDate};
        });

      this.writeValue(value);

      if (this.onChange) {
        this.onChange(value);
      }
    }
  }

  isQuantityValid(form: AbstractControl) {
    return +form.get('quantity').value === +this.value[form.get('index').value].position.quantity;
  }

  isDateValid(form: AbstractControl) {
    const date = this.value[form.get('index').value].position.deliveryDate;
    return !date || moment(form.get('deliveryDate').value, 'DD.MM.YYYY').isSameOrBefore(moment(date));
  }

  registerOnChange = fn => this.onChange = fn;
  registerOnTouched = fn => this.onTouched = fn;
  writeValue = value => this.value = value;

  private parseDate(date: string) {
    if (!date) { return null; }

    try {
      return this.datePipe.transform(new Date(date), 'dd.MM.yyyy');
    } catch (e) {
      return date;
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
