import { Uuid } from "../../../cart/models/uuid";
import { TechnicalCommercialProposal } from "../../common/models/technical-commercial-proposal";
import { TechnicalCommercialProposalByPosition } from "../../common/models/technical-commercial-proposal-by-position";
import { ContragentShortInfo } from "../../../contragent/models/contragent-short-info";
import { TechnicalCommercialProposalPosition } from "../../common/models/technical-commercial-proposal-position";

export namespace TechnicalCommercialProposals {
  // Получить список ТКП
  export class Fetch {
    static readonly type = '[Technical Commercial Proposals Backoffice] Fetch';

    constructor(public requestId: Uuid) {}
  }

  // Получить список доступных к добавлению позиций ТКП
  export class FetchAvailablePositions {
    static readonly type = '[Technical Commercial Proposals Backoffice] FetchAvailablePositions';

    constructor(public requestId: Uuid) {}
  }

  // Создать ТКП
  export class Create {
    static readonly type = '[Technical Commercial Proposals Backoffice] Create';

    constructor(
      public requestId: Uuid,
      public payload: Partial<TechnicalCommercialProposal>,
      public publish: boolean
    ) {}
  }

  // Редактировать ТКП
  export class Update {
    static readonly type = '[Technical Commercial Proposals Backoffice] Update';

    constructor(
      public payload: Partial<TechnicalCommercialProposal> & { id: Uuid },
      public publish: boolean
    ) {}
  }

  // Отправить на согласование ТКП
  export class Publish {
    static readonly type = '[Technical Commercial Proposals Backoffice] Publish';

    constructor(public proposal: TechnicalCommercialProposal) {}
  }

  // Отправить на согласование ТКП по определенной позиции
  export class PublishByPosition {
    static readonly type = '[Technical Commercial Proposals Backoffice] PublishPositions';

    constructor(public proposalsByPositions: TechnicalCommercialProposalByPosition[]) {}
  }

  // Создать ТКП из шаблона
  export class UploadTemplate {
    static readonly type = '[Technical Commercial Proposals Backoffice] UploadTemplate';

    constructor(public requestId: Uuid, public files: File[]) {}
  }

  // Скачать шаблон
  export class DownloadTemplate {
    static readonly type = '[Technical Commercial Proposals Backoffice] DownloadTemplate';

    constructor(public requestId: Uuid) {}
  }

  // Скачать аналитическую справку
  export class DownloadAnalyticalReport {
    static readonly type = '[Technical Commercial Proposals Backoffice] DownloadAnalyticalReport';

    constructor(public requestId: Uuid) {}
  }

  // Создать пустое ТКП (только контрагент)
  export class CreateContragent implements Create {
    static readonly type = '[Technical Commercial Proposals Backoffice] CreateContragent';
    public publish = false;

    constructor(
      public requestId: Uuid,
      public payload: Partial<TechnicalCommercialProposal> & {supplier: ContragentShortInfo}
    ) {}
  }

  // Добавить позиции в ТКП
  export class CreatePosition implements Update {
    static readonly type = '[Technical Commercial Proposals Backoffice] CreatePosition';
    publish = false;

    constructor(public payload: Partial<TechnicalCommercialProposal> & { id: Uuid; positions: TechnicalCommercialProposalPosition[] }) {
    }
  }
}