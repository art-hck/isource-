import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Uuid} from "../../../../cart/models/uuid";
import {OffersService} from "../../../back-office/services/offers.service";
import {ActivatedRoute} from "@angular/router";
import {RequestOfferPosition} from "../../models/request-offer-position";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {RequestPositionWorkflowSteps} from "../../enum/request-position-workflow-steps";
import {RequestPosition} from "../../models/request-position";
import {RequestDocument} from "../../models/request-document";
import {CustomValidators} from "../../../../shared/forms/custom.validators";
import Swal from "sweetalert2";

@Component({
  selector: 'app-offers',
  templateUrl: './offers.component.html',
  styleUrls: ['./offers.component.css']
})
export class OffersComponent implements OnInit {
  @Input() requestPosition: RequestPosition;
  @Input() isCustomerView: boolean;
  @Input() requestId: Uuid;

  @Output() offerWinner = new EventEmitter<Uuid>();

  offer: RequestOfferPosition;
  offerWinnerId: Uuid;


  offerForm: FormGroup;
  showAddOfferForm = false;

  constructor(
    protected offersService: OffersService,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder
  ) {
  }

  ngOnInit() {
    this.offerForm = this.formBuilder.group({
      supplierContragentName: ['', Validators.required],
      priceWithVat: ['', [Validators.required, Validators.min(1)]],
      currency: ['', Validators.required],
      quantity: ['', [Validators.required, Validators.min(1)]],
      measureUnit: ['', Validators.required],
      deliveryDate: ['', [Validators.required, CustomValidators.futureDate()]],
      paymentTerms: ['', Validators.required]
    });

    const winnerOffer = this.findDefaultOffer();
    if (winnerOffer) {
      this.offerWinnerId = winnerOffer.id;
      this.offerWinner.emit(this.offerWinnerId);
    }
  }

  findDefaultOffer() {
    const winner = this.findWinnerOffer();
    if (winner) {
      return winner;
    }
    return this.findMinPriceOffer();
  }

  findMinPriceOffer() {
    for (let i = 0; i < this.requestPosition.linkedOffers.length; i++) {
      if (this.requestPosition.linkedOffers[i].isMinPrice === true) {
        return this.requestPosition.linkedOffers[i];
      }
    }
    return null;
  }

  findWinnerOffer() {
    for (let i = 0; i < this.requestPosition.linkedOffers.length; i++) {
      if (this.requestPosition.linkedOffers[i].isWinner === true) {
        return this.requestPosition.linkedOffers[i];
      }
    }
    return null;
  }

  isFieldValid(field: string) {
    return this.offerForm.get(field).errors
      && (this.offerForm.get(field).touched || this.offerForm.get(field).dirty);
  }

  onAddOffer() {
    this.offer = this.offerForm.value;
    this.offersService.addOffer(this.requestId, this.requestPosition.id, this.offer).subscribe(
      (data: RequestOfferPosition) => {
        this.requestPosition.linkedOffers.push(data);
      }
    );
    this.showAddOfferForm = false;
    this.offerForm.reset();
  }

  onShowAddOfferForm() {
    this.showAddOfferForm = !this.showAddOfferForm;
  }

  canAddOffer() {
    return (this.requestPosition.status === RequestPositionWorkflowSteps.PROPOSALS_PREPARATION
      || this.requestPosition.status === RequestPositionWorkflowSteps.NEW) && !this.isCustomerView;
  }

  winnerChoice(linkedOffer: RequestOfferPosition) {
    this.offerWinnerId = linkedOffer.id;
    this.offerWinner.emit(this.offerWinnerId);
  }

  canChoiceWinner() {
    return this.requestPosition.status === RequestPositionWorkflowSteps.RESULTS_AGREEMENT;
  }

  onUploadDocuments(files: File[], offer: RequestOfferPosition) {
    this.offersService.uploadDocuments(offer, files)
      .subscribe((documents: RequestDocument[]) => {
        documents.forEach(document => offer.documents.push(document));
        this.showAlert('Документ загружен');
      });
  }

  onUploadTechnicalProposals(files: File[], offer: RequestOfferPosition) {
    this.offersService.uploadTechnicalProposals(offer, files)
      .subscribe((documents: RequestDocument[]) => {
        documents.forEach(document => offer.technicalProposals.push(document));
        this.showAlert('Документ загружен');
      });
  }

  showAlert(message) {
    Swal.fire({
      toast: true,
      position: 'top',
      type: 'success',
      html: '<p class="text-alert">' + message + '</p>',
      showConfirmButton: false,
      timer: 3000
    });
  }
}
