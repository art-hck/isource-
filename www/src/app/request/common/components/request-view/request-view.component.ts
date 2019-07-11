import {Component, Input, OnInit} from '@angular/core';
import {Uuid} from "../../../../cart/models/uuid";
import {Request} from "../../models/request";
import {RequestPosition} from "../../models/request-position";
import {RequestPositionWorkflowStepLabels} from "../../dictionaries/request-position-workflow-step-labels";
import {RequestTypes} from "../../enum/request-types";

@Component({
  selector: 'app-request-view',
  templateUrl: './request-view.component.html',
  styleUrls: ['./request-view.component.css']
})
export class RequestViewComponent implements OnInit {
  @Input() isCustomerView: boolean;
  @Input() requestId: Uuid;
  @Input() request: Request;
  @Input() requestPositions: RequestPosition[];

  selectedRequestPosition: RequestPosition;
  showInfo = false;
  showRequestInfo: boolean;
  showPositionList = true;
  selectedIndex: number;

  requestPositionWorkflowStepLabels = Object.entries(RequestPositionWorkflowStepLabels);

  constructor() {
  }

  ngOnInit() {
    this.showRequestInfo = this.request && this.request.type === RequestTypes.FREE_FORM;
  }

  onSelectPosition(requestPosition: RequestPosition, i: number) {
    this.selectedRequestPosition = requestPosition;
    this.showInfo = true;
    this.showRequestInfo = false;
    this.selectedIndex = i;
  }

  onSelectRequest() {
    this.showRequestInfo = true;
    this.showInfo = false;
  }
}