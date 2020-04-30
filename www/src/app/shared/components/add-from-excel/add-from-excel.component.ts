import {Component, OnInit, Output, EventEmitter, Input} from '@angular/core';

@Component({
  selector: 'app-add-from-excel',
  templateUrl: './add-from-excel.component.html',
  styleUrls: ['./add-from-excel.component.css']
})
export class AddFromExcelComponent implements OnInit {

  @Input() templateUrl: string;
  @Input() newRequest = false;
  @Input() buttonLabel = 'Добавить';

  @Output() cancel = new EventEmitter();

  @Output() submit = new EventEmitter<{ files: File[], requestName: string }>();
  @Output() publish = new EventEmitter<{ files: File[], requestName: string }>();

  requestName = "";
  files: File[] = [];

  constructor() {
  }

  ngOnInit() {
  }

  onRequestNameChange(value) {
    this.requestName = value.trim();
  }

  onSaveClick(): void {
    const requestData = {
      files: this.files,
      requestName: this.requestName
    };

    this.submit.emit(requestData);
  }

  onPublishClick(): void {
    const requestData = {
      files: this.files,
      requestName: this.requestName
    };

    this.publish.emit(requestData);
  }



  onCancelClick(): void {
    this.requestName = '';
    this.cancel.emit();
  }

  onChangeFilesList(files: File[]): void {
    this.files = files;
  }

}