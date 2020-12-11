import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';

import {ProductService} from './product.service';
import {OrdersService} from './orders.service';
import {environment} from '../../environments/environment';
import {ICart, ICartServerResponse} from '../interfaces/ICart';
// reactive JS library which contain useful methods and operators
import {BehaviorSubject} from 'rxjs';

import {NavigationExtras, Router} from '@angular/router';
import {IProduct} from '../interfaces/IProduct';
import {IOrderResponse} from '../interfaces/IOrderResponse';


@Injectable({
  providedIn: 'root'
})
export class CartService {
  private url = environment.serverUrl;


  // Store cart information
  cartDataClient: ICart = {
    totall: 0,
    dd: [{
      id: 0,
      inCount: 0
    }]
  };

  // Store cart information locally
  cartDataServer: ICartServerResponse = {
    total: 0,
    d: [{
      product: undefined,
      numberInCart: 0
    }]
  };
  // observable for components to subscribe  Пожалуйста не спрашивайте что это :)
  cartTotal$ = new BehaviorSubject<number>(0);     // return observable and takes what i call
  carDataObservable$ = new BehaviorSubject<ICartServerResponse>(this.cartDataServer);


  constructor(private http: HttpClient,
              private productService: ProductService,
              private orderService: OrdersService,
              private orderResponse: IOrderResponse,
              private router: Router) {
    // предпологаем константное состояние корзины
    this.cartTotal$.next(this.cartDataServer.total);
    this.carDataObservable$.next(this.cartDataServer);

    // get info from local storage
    // @ts-ignore
    const info: cartDataClient = JSON.parse(localStorage.getItem('cart'));

    // check if info variable is null or some data in it
    if (info !== null && info !== undefined && info.dd[0].inCount !== 0)
    {
      // local storage not empty and has any information
      this.cartDataClient = info;
      // loop through each and put it in the cartDataServer object
      this.cartDataClient.dd.forEach( p => {
        this.productService.getOneProduct(p.id).subscribe((actualProductInfo: IProduct) => {
          if (this.cartDataServer.d[0].numberInCart === 0)
          {
            this.cartDataServer.d[0].numberInCart = p.inCount;
            this.cartDataServer.d[0].product = actualProductInfo;
            // To Do create CalculateTotal function and replace it here
            this.cartDataClient.totall = this.cartDataServer.total;
            localStorage.setItem('cart', JSON.stringify(this.cartDataClient));
          }
          else
          {
            // Cart Data local already has some entry
            this.cartDataServer.d.push({
              numberInCart: p.inCount,
              product: actualProductInfo
            });
            // To Do create CalculateTotal function and replace it here
            this.cartDataClient.totall = this.cartDataServer.total;
            localStorage.setItem('cart', JSON.stringify(this.cartDataClient));
          }
          this.carDataObservable$.next({... this.cartDataServer});
        });
      });
    }
  }

  // tslint:disable-next-line:typedef
  AddProductToCart(id: number, quantity?: number)
  {
    // Firstly if the cart empty
    this.productService.getOneProduct(id).subscribe(prod => {
      if (this.cartDataServer.d[0].product === undefined)
      {
        this.cartDataServer.d[0].product = prod;
        this.cartDataServer.d[0].numberInCart = quantity !== undefined ? quantity : 1; // ternary operator (if / else)
        // to do calculate total amount
        this.cartDataClient.dd[0].inCount = this.cartDataServer.d[0].numberInCart;
        this.cartDataClient.dd[0].id = prod.id;
        this.cartDataClient.totall = this.cartDataServer.total;
        localStorage.setItem('cart', JSON.stringify(this.cartDataClient));
        this.carDataObservable$.next({... this.cartDataServer}); // use spread operator
        // to do display a toast notification
      }
      else
      {
        // Secondly if the cart has some items
        const index = this.cartDataServer.d.findIndex(p => p.product.id === prod.id); // find index of item . - 1 or positive value

        // part one if that item is already in the cart then increase => index is positive value
        if (index !== -1 )
        {
          if (quantity !== undefined && quantity <= prod.quantity)
          {
            this.cartDataServer.d[index].numberInCart =
              // current cart value                     if                do           else       | always equal maximum number
              this.cartDataServer.d[index].numberInCart < prod.quantity ? quantity : prod.quantity;
          }
          else
          {
            this.cartDataServer.d[index].numberInCart =
              this.cartDataServer.d[index].numberInCart < prod.quantity ? this.cartDataServer.d[index].numberInCart++ : prod.quantity;
          }
          // update
          this.cartDataClient.dd[index].inCount = this.cartDataServer.d[index].numberInCart;
          // to do display a toast notification
        }
        else
        {
          // part two if that item is not in the cart then add to cart
          // insert new element to end of array
          this.cartDataServer.d.push({
            numberInCart: 1,
            product: prod
          });

          this.cartDataClient.dd.push({
            inCount: 1,
            id: prod.id
          });
          // to do display a toast notification

          // to do calculate total amount
          this.cartDataClient.totall = this.cartDataServer.total;
          localStorage.setItem('cart', JSON.stringify(this.cartDataClient));
          this.carDataObservable$.next({... this.cartDataServer});
        }



      }


    });
  }
  // tslint:disable-next-line:typedef
  updateCartItems(index: number, increase: boolean){
    const data = this.cartDataServer.d[index]; // store product that index

    if (increase)
    {
      data.numberInCart < data.product.quantity ? data.numberInCart++ : data.product.quantity; // trinary operator if/else
      this.cartDataClient.dd[index].inCount = data.numberInCart; // update to new value

      // to do calculate total amount
      this.cartDataClient.totall = this.cartDataServer.total;
      localStorage.setItem('cart', JSON.stringify(this.cartDataClient));
      this.carDataObservable$.next({... this.cartDataServer});
    }
    else
    {
      data.numberInCart--; // decrease

      if (data.numberInCart < 1)
      {
        // to do delete product from cart
        this.carDataObservable$.next({... this.cartDataServer});
      }
      else
      {
        this.carDataObservable$.next({... this.cartDataServer});
        this.cartDataClient.dd[index].inCount = data.numberInCart;
        // to do calculate total amount
        this.cartDataClient.totall = this.cartDataServer.total;
        localStorage.setItem('cart', JSON.stringify(this.cartDataClient));
        this.carDataObservable$.next({... this.cartDataServer});
      }
    }
  }

  // tslint:disable-next-line:typedef
  deleteProductFromCart(index: number)
  {
    if ( window.confirm('Are you really want to remove this amazing item ?'))
    {
      this.cartDataServer.d.splice(index, 1);
      this.cartDataClient.dd.splice(index, 1);
      // to do calculate total amount
      this.cartDataClient.totall = this.cartDataServer.total;
      localStorage.setItem('cart', JSON.stringify(this.cartDataClient));

      if (this.cartDataClient.totall === 0 ) // we are reset
      {
        this.cartDataClient = {
          totall: 0,
          dd: [{
            id: 0,
            inCount: 0
          }]
        };
        localStorage.setItem('cart', JSON.stringify(this.cartDataClient)); // update local storage
      }
      else
      {
        localStorage.setItem('cart', JSON.stringify(this.cartDataClient)); // update local storage
      }

      if (this.cartDataServer.total === 0)// we are reset
      {
        this.cartDataServer = {
          total: 0,
          d: [{
            product: undefined,
            numberInCart: 0
          }]
        };
        this.carDataObservable$.next({... this.cartDataServer});
      }
      else
      {
        this.carDataObservable$.next({... this.cartDataServer});
      }


    }
    else // because confirm < Cancel > we don't delete a product from cart
    {
      return;
    }
  }

  // tslint:disable-next-line:typedef
  calculateProduct() // calculate total price of product from cart
  {
    let Total = 0;

    this.cartDataServer.d.forEach(p => {
      const {numberInCart} = p; // esx destruct method
      const {price} = p.product;
      // @ts-ignore
      Total += numberInCart * price;
    });
    this.cartDataServer.total = Total;
    this.cartTotal$.next(this.cartDataServer.total);
  }

  // tslint:disable-next-line:typedef
  checOut(userId: number)
  {
    this.http.post(`${this.url}/orders/payment`, null).subscribe((res: {success: boolean}) => {
      if (res.success) {
      this.resetCart();
      this.http.post(`${this.url}/orders/new`, {
        userId: userId,
        products: this.cartDataClient.dd
      }).subscribe((data: IOrderResponse) => {
        this.orderService.getOneOrder(data.order_id).then(prods => { // 1 order contains some products
          if (data.success)
          {
            const navigateSuccess: NavigationExtras = {
              state: { // define parameters
                massage: data.message,
                products: prods,
                order_id: data.order_id,
                total: this.cartDataClient.totall
              }
            };
            this.router.navigate(['/succes'], navigateSuccess).then(p => {
              this.cartDataClient = {dd: [{inCount: 0, id: 0}], totall: 0};
              this.cartTotal$.next(0);
              localStorage.setItem('cart', JSON.stringify(this.cartDataClient));
            });
          }
        });

      });
      }
    });
  }

  // tslint:disable-next-line:typedef
  resetCart()
  {
    this.cartDataServer = {
      total: 0,
      d: [{
        product: undefined,
        numberInCart: 0
      }]
    };
    this.carDataObservable$.next({... this.cartDataServer});
  }
}

