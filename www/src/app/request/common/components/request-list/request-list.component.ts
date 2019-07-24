import {Component, Input, OnInit} from '@angular/core';
import {RequestsList} from "../../models/requests-list/requests-list";
import * as moment from 'moment';
import {Router} from "@angular/router";
import {CustomerNameFilter} from "../../services/request-list-filters/customer-name-filter.service";
import {RequestTypes} from "../../enum/request-types";

@Component({
  selector: 'app-request-list',
  templateUrl: './request-list.component.html',
  styleUrls: ['./request-list.component.css']
})

export class RequestListComponent implements OnInit {

  customerNameFilter = new CustomerNameFilter();

  @Input() customerNameColumnShow = false;
  @Input() requests: RequestsList[];

  constructor(
    protected router: Router
  ) { }

  ngOnInit() {
  }

  /**
   * Функция возвращает строку с датой поставки позиций — либо ASAP, либо дата, либо диапазон дат
   *
   * @param request
   */
  getDeliveryDate(request: RequestsList): string {
    if ((!request.request.delivery) || (request.request.type === RequestTypes.FREE_FORM)) {
      return '—';
    } else if (request.request.delivery.asap === true) {
      return "ASAP";
    } else if (request.request.delivery.value) {
      return moment(request.request.delivery.value, "YYYY-MM-DD").locale('ru').format("DD.MM.YYYY");
    } else if ((request.request.delivery.from) && (request.request.delivery.to)) {
      const dateFrom = moment(request.request.delivery.from, "YYYY-MM-DD").locale('ru').format("DD.MM.YYYY");
      const dateTo = moment(request.request.delivery.to, "YYYY-MM-DD").locale('ru').format("DD.MM.YYYY");
      return dateFrom + ' — ' + dateTo;
    } else {
      return '—';
    }
  }

  /**
   * Функция возвращает надпись-ссылку с количеством неперечисленных в заявке позиций
   *
   * @param count
   */
  getMorePositionsLabel(count: number): string {
    const cases = [2, 0, 1, 1, 1, 2];
    const strings = ['позиция', 'позиции', 'позиций'];
    const num = count - 3;

    const positionsString = strings[
      ( num % 100 > 4 && num % 100 < 20 ) ?
      2 :
      cases[
        (num % 10 < 5) ?
        num % 10 :
        5
      ]
    ];

    return 'ещё ' + num + ' ' + positionsString + ' внутри';
  }

  onRowClick(request: RequestsList): void {
    const role = this.customerNameColumnShow ? 'back-office' : 'customer';
    this.router.navigateByUrl(`/requests/${role}/${request.request.id}`);
  }

  checkIfFreeFormRequest(type: string) {
    return type === RequestTypes.FREE_FORM;
  }

}
