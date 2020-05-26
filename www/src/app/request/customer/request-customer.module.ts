import { NgModule } from '@angular/core';
import { CommercialProposalListOldComponent } from './components/commercial-proposal-list-old/commercial-proposal-list-old.component';
import { RequestCommonModule } from "../common/request-common.module";
import { RequestComponent } from './components/request/request.component';
import { RequestCustomerRoutingModule } from "./request-customer-routing.module";
import { RequestService } from "./services/request.service";
import { TechnicalProposalListDeprecatedComponent } from './components/technical-proposal-list-deprecated/technical-proposal-list-deprecated.component';
import { TechnicalProposalsService } from "./services/technical-proposals.service";
import { PositionComponent } from "./components/position/position.component";
import { RequestTechnicalProposalComponent } from './components/technical-proposal/technical-proposal.component';
import { TechnicalProposalListComponent } from './components/technical-proposal-list/technical-proposal-list.component';
import { CommercialProposalListComponent } from './components/commercial-proposal-list/commercial-proposal-list.component';
import { AgreementsModule } from "../../agreements/agreements.module";
import { RequestCreateModalComponent } from './components/request-create-modal/request-create-modal.component';
import { TechnicalCommercialProposalListComponent } from './components/technical-commercial-proposal-list/technical-commercial-proposal-list.component';
import { TechnicalCommercialProposalService } from "./services/technical-commercial-proposal.service";
import { NgxsModule } from "@ngxs/store";
import { TechnicalCommercialProposalState } from "./states/technical-commercial-proposal.state";
import { TechnicalCommercialProposalComponent } from "./components/technical-commercial-proposal/technical-commercial-proposal.component";
import { RequestFormComponent } from "./components/request-form/request-form.component";
import { RequestFormFreeComponent } from "./components/request-form-free/request-form-free.component";
import { RequestState } from "./states/request.state";
import { RequestList2Component } from "./components/request-list2/request-list2.component";
import { RequestListState } from "./states/request-list.state";
import { TechnicalProposalState } from "./states/technical-proposal.state";


@NgModule({
  declarations: [
    CommercialProposalListOldComponent,
    RequestComponent,
    RequestFormComponent,
    RequestFormFreeComponent,
    PositionComponent,
    RequestTechnicalProposalComponent,
    TechnicalProposalListDeprecatedComponent,
    TechnicalProposalListComponent,
    CommercialProposalListComponent,
    RequestCreateModalComponent,
    TechnicalCommercialProposalListComponent,
    TechnicalCommercialProposalComponent,
    RequestList2Component
  ],
  imports: [
    AgreementsModule,
    RequestCustomerRoutingModule,
    RequestCommonModule,
    NgxsModule.forFeature([
      RequestState,
      RequestListState,
      TechnicalCommercialProposalState,
      TechnicalProposalState
    ]),
  ],
  providers: [
    RequestService,
    TechnicalProposalsService,
    TechnicalCommercialProposalService
  ]
})
export class RequestCustomerModule {
}
