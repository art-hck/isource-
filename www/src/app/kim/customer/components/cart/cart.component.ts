import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Select, Store } from "@ngxs/store";
import { ItemsDictionaryState } from "../../states/items-dictionary.state";
import { Observable } from "rxjs";
import { StateStatus } from "../../../../request/common/models/state-status";
import { KimCartItem } from "../../../common/models/kim-cart-item";
import { CartState } from "../../states/cart.state";
import { CartActions } from "../../actions/cart.actions";
import Fetch = CartActions.Fetch;
import { ToastActions } from "../../../../shared/actions/toast.actions";

@Component({
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CartComponent implements OnInit {
  @Select(CartState.cartItems) cartItems$: Observable<KimCartItem[]>;
  @Select(CartState.status) status$: Observable<StateStatus>;
  constructor(private store: Store) { }

  ngOnInit() {
    this.store.dispatch(new Fetch());
  }

  deleteItem(item: KimCartItem) {
    this.store.dispatch(new CartActions.DeleteItem(item)).subscribe(
      (result) => {
        const e = result.error as any;
        this.store.dispatch(e ?
          new ToastActions.Error(e && e?.error?.detail) : new ToastActions.Success('Позиция удалена из корзины')
        );
      }
    )
  }

  updateItemQuantity(item: KimCartItem, quantity: number) {
    quantity = Math.abs(quantity);
    this.store.dispatch(new CartActions.EditItemQuantity(item, quantity));
  }

  filterEnteredText(event: KeyboardEvent): boolean {
    const key = Number(event.key);
    return (key >= 0 && key <= 9);
  }
}
