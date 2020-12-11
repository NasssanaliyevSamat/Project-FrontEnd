import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {HomeComponent} from './home/home.component';
import {ProductComponent} from './product/product.component';
import {CheckoutComponent} from './checkout/checkout.component';
import {SuccessComponent} from './success/success.component';
import {NotFoundComponent} from './not-found/not-found.component';
import {CartComponent} from './cart/cart.component';

const routes: Routes = [
  {
    path: '', component: HomeComponent
  },
  {
    path: 'product/:id', component: ProductComponent
  },
  {
    path: 'checkout', component: CheckoutComponent
  },
  {
    path: 'success', component: SuccessComponent
  },
  {
    path: 'cart', component: CartComponent
  },
  {
    path: '**', component: NotFoundComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
