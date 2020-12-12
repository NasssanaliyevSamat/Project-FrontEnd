import {Component, OnInit} from '@angular/core';

import {CartService} from '../services/cart.service';
import {ICart, ICartServerResponse} from '../interfaces/ICart';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'mg-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit {
  cartData: ICartServerResponse;
  cartTotal: number;
  subTotal: number;

  constructor(public cartService: CartService) {
  }

  ngOnInit() {
    this.cartService.cartDataObs$.subscribe(data => this.cartData = data);
    this.cartService.cartTotal$.subscribe(total => this.cartTotal = total);
  }

  // tslint:disable-next-line:typedef
  ChangeQuantity(id: number, increaseQuantity: boolean) {
    this.cartService.UpdateCartData(id, increaseQuantity);
  }

}
