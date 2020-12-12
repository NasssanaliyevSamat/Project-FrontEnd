import { Component, OnInit } from '@angular/core';
import {ICartServerResponse} from '../interfaces/ICart';
import {CartService} from '../services/cart.service';
import {NgModule} from '@angular/core';


@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss']
})
export class CheckoutComponent implements OnInit {

  cartTotal: number;
  cartData: ICartServerResponse;


  constructor(private cartService: CartService) { }

  ngOnInit(): void {
    this.cartService.cartDataObs$.subscribe(data => this.cartData = data);
  }
  // tslint:disable-next-line:typedef
  onCheckOut(){
    this.cartService.CheckoutFromCart(1);
  }

}
