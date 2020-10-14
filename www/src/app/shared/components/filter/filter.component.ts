import { Component, EventEmitter, HostBinding, Inject, Input, OnDestroy, OnInit, Output, Renderer2 } from '@angular/core';
import { DOCUMENT } from "@angular/common";
import { FormGroup } from "@angular/forms";
import { Subject } from "rxjs";
import { debounceTime, takeUntil } from "rxjs/operators";

@Component({
  selector: 'app-filter',
  templateUrl: './filter.component.html'
})
export class FilterComponent implements OnInit, OnDestroy {
  @HostBinding('class.app-filter') class = true;
  @HostBinding('class.app-col-aside') colAside = true;
  @HostBinding('class.app-row') row = true;
  @HostBinding('class.app-flex-column') flexColumn = true;
  @HostBinding('class.detachable') detachable = true;
  @HostBinding('class.open') isOpen: boolean;
  @Input() count: number;
  @Input() dirty: boolean;
  @Input() formGroup: FormGroup;
  @Input() liveFilter = true;
  @Input() debounceTime = 300;
  @Output() filter = new EventEmitter();
  @Output() reset = new EventEmitter();
  readonly destroy$ = new Subject();

  ngOnInit() {
    if (this.liveFilter) {
      this.formGroup.valueChanges.pipe(
        debounceTime(this.debounceTime),
        takeUntil(this.destroy$)
      ).subscribe(value => this.filter.emit(value));
    }
  }

  public open() {
    this.renderer.addClass(this.document.body, "filter-open");
    this.isOpen = true;
  }

  public close() {
    this.renderer.removeClass(this.document.body, "filter-open");
    this.isOpen = false;
  }

  constructor(@Inject(DOCUMENT) private document: Document, private renderer: Renderer2) {}

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
