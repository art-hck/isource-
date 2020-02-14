import { Directive, EventEmitter, HostListener, Input, OnInit, Output, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appUploadFile][select]'
})
export class UploadFileDirective implements OnInit {
  @Output() select = new EventEmitter<File[]>();
  @Input() multiple: boolean;
  inputEl: HTMLInputElement;

  constructor(private renderer: Renderer2) {}

  ngOnInit() {
    this.inputEl = this.renderer.createElement("input");
    this.inputEl.setAttribute("type", "file");
    this.inputEl.multiple = this.multiple;
    this.renderer.listen(this.inputEl, "change", this.onFileSelected);
  }

  @HostListener('click') click() {
    this.inputEl.click();
  }

  private onFileSelected = (e: Event) => {
    this.select.emit(Array.from((e.target as HTMLInputElement).files));
    this.inputEl.value = "";
  }
}