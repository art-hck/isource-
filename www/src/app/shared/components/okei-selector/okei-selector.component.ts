import { Component, OnInit, Input, Output, EventEmitter, forwardRef, ViewChild, ElementRef } from '@angular/core';
import { Okei } from '../../models/okei';
import { OkeiService } from '../../services/okei.service';
import { Observable, Subject } from 'rxjs';
import { publishReplay, refCount, filter, debounceTime, tap, flatMap, map } from 'rxjs/operators';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';

@Component({
  selector: 'app-okei-selector',
  templateUrl: './okei-selector.component.html',
  providers: [
    {provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => OkeiSelectorComponent), multi: true}
  ]
})
export class OkeiSelectorComponent implements OnInit, ControlValueAccessor {

  @Input() value: string|null = null;
  @Input() minLength = 0;
  @Input() debounceTime = 100;
  @Input() resultsCount = 10;
  @Input() disabled = false;

  @Output() change = new EventEmitter<string|null>();

  @ViewChild('okeiName', {static: false}) inputValue: ElementRef;

  public isOpen = false;
  public onInputSubject = new Subject<string>();
  public onChange: (value: string|null) => void;
  public onTouched: (value: string|null) => void;

  public okeiFullData$: Observable<Okei[]>;
  public okeiFiltredData$: Observable<Okei[]>;

  constructor(private okeiService: OkeiService) {
    this.okeiFullData$ = this.okeiService.getOkeiList().pipe(publishReplay(1), refCount());
    this.okeiFiltredData$ = this.onInputSubject.pipe(
      filter((value) => value.length >= this.minLength),
      debounceTime(this.debounceTime),
      tap(() => this.isOpen = true),
      flatMap((value) => {
        return this.okeiFullData$.pipe(map(
          data => this.search(data, value, this.resultsCount)
        ));
      })
    );
  }

  ngOnInit() {}

  search(items: Okei[], value: string, resultsCount: number): Okei[] {
    // TODO: 2020-01-28 Учитывать полное совпадение, поднимать такие результаты наверх
    const valueLowerCase = value.toLowerCase();
    const res = items.filter((item) => {
      return (
        item.name.toLowerCase().indexOf(valueLowerCase) >= 0 ||
        (
          item.symbol &&
          item.symbol.toLowerCase().indexOf(valueLowerCase) >= 0
        )
      );
    });
    return res.slice(0, resultsCount);
  }

  select(okei: Okei|null): void {
    this.isOpen = false;
    const value = okei ? okei.symbol : null;
    this.writeValue(value);
    this.change.emit(value);
    if (this.onChange) {
      this.onChange(value);
    }
  }

  onInput(event: Event): void {
    const value = event.target['value'];
    this.onInputSubject.next(value);
  }

  writeValue(value: string|null): void {
    this.value = value;
  }

  registerOnChange(fn: (value: string|null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: (value: string|null) => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = true;
  }

  focus(): void {
    this.inputValue.nativeElement.focus();
  }

  onBlur(): void {
    if (this.inputValue.nativeElement.value !== this.value) {
      this.inputValue.nativeElement.value = this.value;
    }
  }
}