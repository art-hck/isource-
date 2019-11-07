import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CategoryViewComponent } from "./components/category-view/category-view.component";
import { SearchViewComponent } from "./components/search-view/search-view.component";
import { CatalogComponent } from "./components/catalog/catalog.component";
import { PositionViewComponent } from "./components/position-view/position-view.component";

const routes: Routes = [
  {
    path: '',
    component: CatalogComponent,
    children: [
      {
        path: '',
        redirectTo: 'search'
      },
      {
        path: 'search',
        component: SearchViewComponent,
        data: { title: "Каталог" }
      },
      {
        path: ':categoryId',
        component: CategoryViewComponent,
        data: { title: "Каталог" }
      },
      {
        path: 'position/:positionId',
        component: PositionViewComponent
      }
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CatalogRoutingModule {
}
