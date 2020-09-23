import { Component, EventEmitter, forwardRef, Input, OnInit, Output } from '@angular/core';
import { AbstractControl, ControlValueAccessor, FormArray, FormBuilder, FormGroup, NG_VALUE_ACCESSOR, Validators } from "@angular/forms";
import { proposalManufacturerValidator } from "./proposal-form-manufacturer.validator";

@Component({
  selector: 'app-request-proposal-form-manufacturer',
  templateUrl: './proposal-form-manufacturer.component.html',
  styleUrls: ['proposal-form-manufacturer.component.scss'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => ProposalFormManufacturerComponent),
    multi: true
  }]
})
export class ProposalFormManufacturerComponent implements OnInit, ControlValueAccessor {
  @Output() cancel = new EventEmitter();
  @Input() disabledFn: (item) => boolean;
  @Input() showManufacturer = true;
  public onTouched: (value) => void;
  public onChange: (value) => void;
  public form: FormGroup;
  public value;

  get formPositions() {
    return this.form.get("positions") as FormArray;
  }

  constructor(private fb: FormBuilder) {}

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      positions: this.fb.array([])
    });
  }

  writeValue(value): void {
    this.value = value;
    if (value) {
      this.formPositions.clear();
      value.map(valueItem => this.formPositions.push(this.createFormGroupPosition(valueItem)));
    }
  }

  createFormGroupPosition({ manufacturingName, manufacturer, position }) {
    const form = this.fb.group({
      position: position,
      manufacturingName: [manufacturingName || position.name, Validators.required],
      manufacturer: [manufacturer]
    });

    if (this.disabledFn && this.disabledFn({ position })) {
      form.disable();
    }

    form.get('manufacturer').setValidators(this.showManufacturer ? [Validators.required] : null);

    return form;
  }

  submit(controls: AbstractControl[]) {
    const value = this.value.map(item => ({
      ...item,
      ...controls.find(c => c.value.position.id === item.position.id).value
    }));
    this.writeValue(value);
    this.onChange(value);
  }

  get pristineCount() {
    if(this.showManufacturer) {
      return this.formPositions.controls.filter(c => !c.get('manufacturingName').value || !c.get('manufacturer').value).length;
    } else {
      return this.formPositions.controls.filter(c => !c.get('manufacturingName').value).length;
    }

  }
}
