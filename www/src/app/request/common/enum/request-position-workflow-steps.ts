export enum RequestPositionWorkflowSteps {
  DRAFT = 'DRAFT',                                 // Черновик
  ON_CUSTOMER_APPROVAL = 'ON_CUSTOMER_APPROVAL',   // На согласовании заказчика
  NEW = 'NEW',                                     // Новая
  TECHNICAL_PROPOSALS_PREPARATION = 'TECHNICAL_PROPOSALS_PREPARATION', // Подготовка ТП
  TECHNICAL_PROPOSALS_AGREEMENT = 'TECHNICAL_PROPOSALS_AGREEMENT',     // Согласование ТП
  PROPOSALS_PREPARATION = 'PROPOSALS_PREPARATION', // Подготовка КП
  RESULTS_AGREEMENT = 'RESULTS_AGREEMENT',         // Согласование результатов
  WINNER_SELECTED = 'WINNER_SELECTED',             // Выбран победитель
  CONTRACT_AGREEMENT = 'CONTRACT_AGREEMENT',       // Согласование договора
  CONTRACT_SIGNING = 'CONTRACT_SIGNING',           // Подписание договора
  CONTRACTED = 'CONTRACTED',                       // Законтрактовано
  RKD_AGREEMENT = 'RKD_AGREEMENT',                 // Согласование РКД
  MANUFACTURING = 'MANUFACTURING',                 // Изготовление
  DELIVERY = 'DELIVERY',                           // Доставка
  DELIVERED = 'DELIVERED',                         // Поставлено
  PAID = 'PAID',                                   // Оплачено
  COMPLETED = 'COMPLETED',                         // Завершено
}

export const RequestPositionWorkflowStepsGroups = {
  TECHNICAL_PROPOSALS: [
    RequestPositionWorkflowSteps.TECHNICAL_PROPOSALS_PREPARATION,
    RequestPositionWorkflowSteps.TECHNICAL_PROPOSALS_AGREEMENT
  ],
  PROPOSALS: [
    RequestPositionWorkflowSteps.PROPOSALS_PREPARATION,
    RequestPositionWorkflowSteps.WINNER_SELECTED,
    RequestPositionWorkflowSteps.RESULTS_AGREEMENT,
  ],
  CONTRACT: [
    RequestPositionWorkflowSteps.CONTRACTED,
    RequestPositionWorkflowSteps.CONTRACT_SIGNING,
    RequestPositionWorkflowSteps.CONTRACT_AGREEMENT
  ],
  RKD: [
    RequestPositionWorkflowSteps.RKD_AGREEMENT,
    RequestPositionWorkflowSteps.MANUFACTURING
  ],
  DELIVERY: [
    RequestPositionWorkflowSteps.DELIVERY,
    RequestPositionWorkflowSteps.DELIVERED
  ],
  COMPLETED: [
    RequestPositionWorkflowSteps.PAID,
    RequestPositionWorkflowSteps.COMPLETED
  ],
};

export const RequestPositionWorkflowStepsGroupsInfo = [
  {
    url: "technical-proposals",
    label: "Согласование ТП",
    statuses: RequestPositionWorkflowStepsGroups.TECHNICAL_PROPOSALS,
    positions: []
  },
  {
    url: "commercial-proposals",
    label: "Согласование КП",
    statuses: RequestPositionWorkflowStepsGroups.PROPOSALS,
    positions: []
  },
  {
    url: "design-documentation",
    label: "Согласование РКД",
    statuses: RequestPositionWorkflowStepsGroups.RKD,
    positions: []
  },
  {
    url: "contract",
    label: "Рассмотрение договора",
    statuses: RequestPositionWorkflowStepsGroups.CONTRACT,
    positions: []
  },
];
