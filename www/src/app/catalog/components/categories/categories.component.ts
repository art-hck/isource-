import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CatalogCategory } from "../../models/catalog-category";
import { CatalogService } from "../../services/catalog.service";
import { Router } from "@angular/router";

@Component({
  selector: 'app-catalog-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss']
})
export class CategoriesComponent implements OnInit {

  categories: CatalogCategory[];
  selectedMainCategory: CatalogCategory;

  @Input() opened = false;
  @Output() openedChange = new EventEmitter<boolean>();

  constructor(
    private catalogService: CatalogService,
    private router: Router
  ) { }

  ngOnInit() {
    this.getCategoriesTree();
  }

  getCategoriesTree(): void {
    this.catalogService.getCategoriesTree().subscribe(
      (categories: CatalogCategory[]) => {
        this.categories = categories;
        this.selectedMainCategory = this.categories[0];
      }
    );
  }

  onMainCategorySelect(category: CatalogCategory) {
    this.selectedMainCategory = category;
  }

  onCategoryRefClick(category: CatalogCategory) {
    this.openedChange.emit(false);
    this.router.navigateByUrl(`catalog/${category.id}`);
  }
}
