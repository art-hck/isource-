import { Component, EventEmitter, Output, ViewChild } from '@angular/core';
import { UxgModalComponent } from "uxg";

@Component({
  selector: 'app-request-create-modal',
  templateUrl: './request-create-modal.component.html'
})
export class RequestCreateModalComponent {

  @ViewChild(UxgModalComponent) modal: UxgModalComponent;

  @Output() uploadFromTemplate = new EventEmitter<{ files: File[], requestName: string }>();
  @Output() publishFromTemplate = new EventEmitter<{ files: File[], requestName: string }>();
  @Output() cancel = new EventEmitter();

  open() {
    this.modal.open();
  }

  close() {
    this.modal.close();
  }
}