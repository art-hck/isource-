import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ContragentListViewComponent } from "./components/contragent-list-view/contragent-list-view.component";
import { ContragentInfoViewComponent } from "./components/contragent-info-view/contragent-info-view.component";


const routes: Routes = [
  {
    path: '',
    redirectTo: 'list',
  },
  {
    path: 'list',
    component: ContragentListViewComponent
  },
  {
    path: ':id',
    children: [
      {
        path: 'info',
        component: ContragentInfoViewComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ContragentRoutingModule {
}
