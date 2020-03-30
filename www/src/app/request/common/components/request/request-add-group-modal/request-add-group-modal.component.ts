import { ClrModal } from "@clr/angular";
import { Component, EventEmitter, Input, OnDestroy, Output, ViewChild } from '@angular/core';
import { finalize, flatMap } from "rxjs/operators";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { RequestPositionService } from "../../../services/request-position.service";
import { GroupWithPositions } from "../../../models/groupWithPositions";
import { Request } from "../../../models/request";
import { RequestPosition } from "../../../models/request-position";
import { Subscription } from "rxjs";

@Component({
  selector: 'app-request-add-group-modal',
  templateUrl: 'request-add-group-modal.component.html'
})
export class RequestAddGroupModalComponent implements OnDestroy {
  @ViewChild(ClrModal, { static: false }) modal: ClrModal;
  @Input() positions: RequestPosition[] = [];
  @Input() request: Request;
  @Output() success = new EventEmitter<GroupWithPositions>();
  subscription = new Subscription();
  isLoading: boolean;

  form = new FormGroup({
    name: new FormControl("", Validators.required)
  });

  constructor(private positionService: RequestPositionService) {}

  open() {
    this.modal.open();
  }

  close() {
    this.modal.close();
  }

  submit() {
    this.isLoading = true;
    this.subscription.add(
      this.positionService.saveGroup(this.request.id, this.form.get('name').value).pipe(
        flatMap(requestGroup => this.positionService.addPositionsInGroup(
          this.request.id,
          requestGroup.id,
          this.positions.map(position => position.id)
        )),
        finalize(() => {
          this.isLoading = false;
          this.form.reset();
          this.close();
        })
      ).subscribe(groupWithPositions => this.success.emit(groupWithPositions))
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
