import { ContractStatus } from "../enum/contract-status";

export const ContractStatusLabels: Record<ContractStatus, string> = {
  [ContractStatus.NEW]: "Черновик",
  [ContractStatus.ON_APPROVAL]: "На согласовании",
  [ContractStatus.REJECTED]: "На доработке",
  [ContractStatus.APPROVED]: "Согласовано",
  [ContractStatus.SIGNED]: "Подписано",
  [ContractStatus.SIGNED_BY_CUSTOMER]: "Подписано заказчиком",
  [ContractStatus.SIGNED_BY_SUPPLIER]: "Подписано поставщиком",
  [ContractStatus.ARCHIVE]: "Архив",
};
