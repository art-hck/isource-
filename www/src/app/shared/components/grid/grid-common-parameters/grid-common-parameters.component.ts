import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { TechnicalCommercialProposal } from "../../../../request/common/models/technical-commercial-proposal";
import { ProposalHelperService } from "../proposal-helper.service";
import { TechnicalCommercialProposalByPosition } from "../../../../request/common/models/technical-commercial-proposal-by-position";
import { getCurrencySymbol } from "@angular/common";

@Component({
  selector: 'app-grid-common-parameters',
  templateUrl: './grid-common-parameters.component.html',
  styleUrls: ['./grid-common-parameters.component.scss']
})
export class GridCommonParametersComponent implements OnInit {
  @Input() proposal: TechnicalCommercialProposal;
  @Input() proposalsByPos: TechnicalCommercialProposalByPosition[];
  @Output() close = new EventEmitter();
  @Output() openEditModal = new EventEmitter<TechnicalCommercialProposal>();
  @Input() showDocs = false;
  getCurrencySymbol = getCurrencySymbol;

  constructor(
    public helper: ProposalHelperService
  ) { }

  ngOnInit(): void {
  }

  edit(proposal: TechnicalCommercialProposal) {
    this.close.emit();
    this.openEditModal.emit(proposal);
  }

}
