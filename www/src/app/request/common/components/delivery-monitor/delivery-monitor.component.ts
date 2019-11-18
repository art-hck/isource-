import { Component, Input, OnInit } from '@angular/core';
import { RequestPosition } from "../../models/request-position";
import { DeliveryMonitorService } from "../../services/delivery-monitor.service";
import { DeliveryMonitorInfo } from "../../models/delivery-monitor-info";
import * as moment from "moment";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { DeliveryMonitorConsignment } from "../../models/delivery-monitor-consignment";
import { DeliveryMonitorStatus } from "../../enum/delivery-monitor-status";
import { DeliveryMonitorStatusLabels } from "../../dictionaries/delivery-monitor-status-labels";
import { Uuid } from "../../../../cart/models/uuid";

@Component({
  selector: 'app-delivery-monitor',
  templateUrl: './delivery-monitor.component.html',
  styleUrls: ['./delivery-monitor.component.scss']
})
export class DeliveryMonitorComponent implements OnInit {

  @Input() requestId: Uuid;
  @Input() requestPosition: RequestPosition;

  deliveryMonitorInfo$: Observable<DeliveryMonitorInfo>;
  consignments$: Observable<DeliveryMonitorConsignment[]>;

  goodId: string;
  demoGoodId = '61';

  constructor(
    private deliveryMonitorService: DeliveryMonitorService
  ) { }

  ngOnInit() {
    // используется захардкоженный id, в дальнейшем получать свой id для разных позиций
    this.goodId = this.demoGoodId;
    this.getDeliveryMonitorInfo();
  }

  getDeliveryMonitorInfo(): void {
    this.deliveryMonitorInfo$ = this.deliveryMonitorService.getDeliveryMonitorInfo(this.goodId);
    this.consignments$ = this.deliveryMonitorInfo$
      .pipe(map(deliveryMonitorInfo => deliveryMonitorInfo.contractAnnex.consignments ));
  }

  getShipmentItemShippingDate(consignment: DeliveryMonitorConsignment): string {
    const shipmentItemCreatedDate = consignment.factualShipmentDate ? consignment.factualShipmentDate : null;
    return shipmentItemCreatedDate ? moment(shipmentItemCreatedDate).locale("ru").format('dd, DD.MM') : '—';
  }

  getShipmentItemArrivalDate(consignment: DeliveryMonitorConsignment): string {
    const shipmentItemShippingDate = consignment.planeShipmentDate ? consignment.planeShipmentDate : null;
    return shipmentItemShippingDate ? moment(shipmentItemShippingDate).locale("ru").format('dd, DD.MM') : '—';
  }

  consignmentCanBeShown(consignment: DeliveryMonitorConsignment): boolean {
    return !!consignment.cargos;
  }

  canGetWaybillInfo(consignment: DeliveryMonitorConsignment): boolean {
    return ((!!consignment.waybills) && (!!consignment.waybills[0]));
  }

  getWeightByTd(consignment: DeliveryMonitorConsignment): number|string {
    return this.canGetWaybillInfo(consignment) ? consignment.waybills[0].weightByTd : '—';
  }

  getWaybillNumber(consignment: DeliveryMonitorConsignment): string {
    return this.canGetWaybillInfo(consignment) ? consignment.waybills[0].waybillNumber : '—';
  }

  getVehicleNumber(consignment: DeliveryMonitorConsignment): string {
    return this.canGetWaybillInfo(consignment) ? consignment.waybills[0].vehicles[0].vehicleNumber : '—';
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case DeliveryMonitorStatus.PENDING:
        return DeliveryMonitorStatusLabels[DeliveryMonitorStatus.PENDING];
      case DeliveryMonitorStatus.LOADED:
        return DeliveryMonitorStatusLabels[DeliveryMonitorStatus.LOADED];
      case DeliveryMonitorStatus.MOVING:
        return DeliveryMonitorStatusLabels[DeliveryMonitorStatus.MOVING];
      case DeliveryMonitorStatus.ARRIVED:
        return DeliveryMonitorStatusLabels[DeliveryMonitorStatus.ARRIVED];
    }
  }
}
