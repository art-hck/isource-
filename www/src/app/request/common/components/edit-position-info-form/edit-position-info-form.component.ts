import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { RequestPosition } from "../../models/request-position";
import { EditRequestService } from "../../services/edit-request.service";
import createAutoCorrectedDatePipe from 'text-mask-addons/dist/createAutoCorrectedDatePipe';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from "@angular/forms";
import * as moment from "moment";
import { CreateRequestService } from '../../services/create-request.service';
import Swal from "sweetalert2";
import { NotificationService } from "../../../../shared/services/notification.service";
import { RequestPositionStatusService } from "../../services/request-position-status.service";
import { RequestPositionWorkflowSteps } from "../../enum/request-position-workflow-steps";
import { UserInfoService } from "../../../../user/service/user-info.service";

@Component({
  selector: 'app-edit-position-info-form',
  templateUrl: './edit-position-info-form.component.html',
  styleUrls: ['./edit-position-info-form.component.css']
})
export class EditPositionInfoFormComponent implements OnInit {

  positionInfoDataForm: FormGroup;

  @Input() requestPosition: RequestPosition;
  @Output() requestPositionChanged = new EventEmitter<RequestPosition>();

  constructor(
    private formBuilder: FormBuilder,
    private editRequestService: EditRequestService,
    private createRequestService: CreateRequestService,
    private notificationService: NotificationService,
    private positionStatusService: RequestPositionStatusService,
    private userInfoService: UserInfoService
  ) {
  }


  ngOnInit() {
    this.positionInfoDataForm = this.addItemFormGroup();
  }

  dateMinimum(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {

      if (control.value === '') {
        return null;
      }

      const controlDate = moment(control.value, 'DD.MM.YYYY');
      const validationDate = moment(new Date(), 'DD.MM.YYYY');

      return controlDate.isAfter(validationDate) ? null : {
        'date-minimum': {
          'date-minimum': validationDate.format('DD.MM.YYYY'),
          'actual': controlDate.format('DD.MM.YYYY')
        }
      };
    };
  }

  addItemFormGroup(): FormGroup {
    const deliveryDate = this.requestPosition.deliveryDate ?
      moment(new Date(this.requestPosition.deliveryDate)).format('DD.MM.YYYY') :
      this.requestPosition.deliveryDate;

    const itemForm = this.formBuilder.group({
      name: [this.requestPosition.name, [Validators.required]],
      productionDocument: [this.requestPosition.productionDocument, [Validators.required]],
      quantity: [this.requestPosition.quantity, [Validators.required, Validators.min(1)]],
      measureUnit: [this.requestPosition.measureUnit, [Validators.required]],
      deliveryDate: [deliveryDate, [Validators.required, this.dateMinimum()]],
      isDeliveryDateAsap: [this.requestPosition.isDeliveryDateAsap],
      deliveryBasis: [this.requestPosition.deliveryBasis, [Validators.required]],
      paymentTerms: [this.requestPosition.paymentTerms, [Validators.required]],
      startPrice: [this.requestPosition.startPrice, [Validators.min(1)]],
      currency: ['RUB'],
      isShmrRequired: [this.requestPosition.isShmrRequired],
      isPnrRequired: [this.requestPosition.isPnrRequired],
      isInspectionControlRequired: [this.requestPosition.isInspectionControlRequired],
      isDesignRequired: [this.requestPosition.isDesignRequired],
      comments: [this.requestPosition.comments]
    });

    if (!!itemForm.get('isDeliveryDateAsap').value) {
      itemForm.get('deliveryDate').disable();
    }

    itemForm.get('isDeliveryDateAsap').valueChanges.subscribe(checked => {
      itemForm.get('deliveryDate').reset();
      if (checked) {
        itemForm.get('deliveryDate').disable();
      } else {
        itemForm.get('deliveryDate').enable();
      }
    });

    this.setAccessForFormFields(itemForm);

    if (!this.userInfoService.isCustomer()) {
      itemForm.get('comments').disable();
    }

    return itemForm;
  }

  isFieldValid(field: string) {
    return this.positionInfoDataForm.get(field).errors
      && (this.positionInfoDataForm.get(field).touched || this.positionInfoDataForm.get(field).dirty);
  }

  onSavePositionInfo() {
    if (typeof this.requestPosition.id !== 'string') {
      this.saveNewPosition();
      return;
    }
    Swal.fire({
      width: 400,
      html: '<p class="text-alert">' + 'Сохранить изменения?</br></br>' + '</p>' +
        '<button id="submit" class="btn btn-primary">' +
        'Да' + '</button>' + '<button id="cancel" class="btn btn-link">' +
        'Нет' + '</button>',
      showConfirmButton: false,
      onBeforeOpen: () => {
        const content = Swal.getContent();
        const $ = content.querySelector.bind(content);

        const submit = $('#submit');
        const cancel = $('#cancel');
        submit.addEventListener('click', () => {
          this.saveExistsPosition();
        });
        cancel.addEventListener('click', () => {
          Swal.close();
        });
      }
    });
  }

  /**
   * Устанавливает возможность редактирвания полей формы в соответствии со статусной политикой
   * @param itemForm
   */
  protected setAccessForFormFields(itemForm: FormGroup) {
    if (this.positionStatusService.isStatusAfter(
      this.requestPosition.status, RequestPositionWorkflowSteps.TECHNICAL_PROPOSALS_PREPARATION
    )) {
      itemForm.get('name').disable();
      itemForm.get('isDeliveryDateAsap').disable({ emitEvent: false });
      itemForm.get('deliveryDate').disable();
      itemForm.get('productionDocument').disable();
      itemForm.get('measureUnit').disable();
    }

    if (this.positionStatusService.isStatusAfter(
      this.requestPosition.status, RequestPositionWorkflowSteps.TECHNICAL_PROPOSALS_AGREEMENT
    )) {
      itemForm.get('startPrice').disable();
      itemForm.get('currency').disable();
      itemForm.get('isShmrRequired').disable();
      itemForm.get('isPnrRequired').disable();
    }

    if (this.positionStatusService.isStatusAfter(
      this.requestPosition.status, RequestPositionWorkflowSteps.RESULTS_AGREEMENT
    )) {
      itemForm.get('deliveryBasis').disable();
      itemForm.get('paymentTerms').disable();
      itemForm.get('quantity').disable();
    }

    if (this.positionStatusService.isStatusAfter(
      this.requestPosition.status, RequestPositionWorkflowSteps.CONTRACT_AGREEMENT
    )) {
      itemForm.get('isInspectionControlRequired').disable();
    }

    if (this.positionStatusService.isStatusAfter(
      this.requestPosition.status, RequestPositionWorkflowSteps.RKD_AGREEMENT
    )) {
      itemForm.get('isDesignRequired').disable();
    }
  }

  protected saveExistsPosition(): void {
    const formData = this.positionInfoDataForm.getRawValue();
    this.editRequestService.updateRequestPosition(this.requestPosition.id, formData).subscribe(
      (updatedPosition) => {
        this.requestPosition = updatedPosition;
        this.afterSavePosition();
        this.notificationService.toast('Изменения сохранены');
      }, () => {
        Swal.close();
      }
    );
  }

  protected saveNewPosition(): void {
    const dataForm = this.formBuilder.group({
      'itemForm': this.formBuilder.array([
        this.positionInfoDataForm
      ])
    });
    const formData = dataForm.value['itemForm'];

    this.createRequestService.addRequestPosition(this.requestPosition.request.id, formData).subscribe(
      (updatedPosition) => {
        this.requestPosition = updatedPosition[0];
        this.afterSavePosition();
        this.notificationService.toast('Позиция создана');
      },
      () => {
        alert('Ошибка сохранения новой позиции');
      }
    );
  }

  protected afterSavePosition(): void {
    this.requestPositionChanged.emit(this.requestPosition);
  }
}
