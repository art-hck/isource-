import { ChangeDetectionStrategy, Component, Input, OnChanges } from '@angular/core';
import { RequestPosition } from "../../../models/request-position";
import { Request } from "../../../models/request";
import { PositionStatusesGroupInfo, PositionStatusesGroupsInfo } from "../../../dictionaries/position-statuses-groups-info";

@Component({
  selector: 'app-request-aside-info',
  templateUrl: 'request-aside-info.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class RequestAsideInfoComponent implements OnChanges {
  @Input() positions: RequestPosition[];
  @Input() request: Request;
  isInfoTabVisible: boolean;
  isStatTabVisible: boolean;
  statusCounters: PositionStatusesGroupInfo[];

  ngOnChanges() {
    this.statusCounters = PositionStatusesGroupsInfo.filter(statusCounter => (
      statusCounter.hasActions
    )).map(statusCounter => ({
        ...statusCounter,
        positions: this.positions.filter(position => statusCounter.statuses.indexOf(position.status) >= 0)
      })
    );
  }
}
