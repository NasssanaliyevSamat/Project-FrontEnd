import {Injectable} from '@angular/core';
import {ProductService} from './product.service';
import {BehaviorSubject} from 'rxjs';

import {IProduct} from '../interfaces/IProduct';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment';
import {NavigationExtras, Router} from '@angular/router';
import {OrdersService} from './orders.service';
import {NgxSpinnerService} from 'ngx-spinner';
import {ToastrService} from 'ngx-toastr';
import {ICart, ICartServerResponse} from '../interfaces/ICart';

@Injectable({
  providedIn: 'root'
})


export class CartService {

  url = environment.serverUrl;

  private cartDataClient: ICart = {prodData: [{incart: 0, id: 0}], total: 0};  // This will be sent to the backend Server as post data
  // Cart Data variable to store the cart information on the server
  private cartDataServer: ICartServerResponse = {
    data: [{
      product: undefined,
      numInCart: 0
    }],
    total: 0
  };
  // observable for components to subscribe  Пожалуйста не спрашивайте что это :) . Для локального сервера
  cartTotal$ = new BehaviorSubject<number>(0); // return observable and takes what i call
  cartDataObs$ = new BehaviorSubject<ICartServerResponse>(this.cartDataServer);

  constructor(private productService: ProductService,
              private orderService: OrdersService,
              private httpClient: HttpClient,
              private router: Router,
              private spinner: NgxSpinnerService,
              private toast: ToastrService) {
    // предпологаем константное состояние корзины
    this.cartTotal$.next(this.cartDataServer.total);
    this.cartDataObs$.next(this.cartDataServer);
    // get info from local storage
    const info: ICart = JSON.parse(localStorage.getItem('cart'));
    // check if info variable is null or some data in it
    if (info !== null && info !== undefined && info.prodData[0].incart !== 0) {
      // local storage not empty and has any information
      this.cartDataClient = info;
      // loop through each and put it in the cartDataServer object
      this.cartDataClient.prodData.forEach(p => {
        this.productService.getOneProduct(p.id).subscribe((actualProdInfo: IProduct) => {
          if (this.cartDataServer.data[0].numInCart === 0) {
            this.cartDataServer.data[0].numInCart = p.incart;
            this.cartDataServer.data[0].product = actualProdInfo;
            this.CalculateTotal();
            this.cartDataClient.total = this.cartDataServer.total;
            localStorage.setItem('cart', JSON.stringify(this.cartDataClient));
          } else {
            // Cart Data local already has some entry
            this.cartDataServer.data.push({
              numInCart: p.incart,
              product: actualProdInfo
            });
            this.CalculateTotal();
            this.cartDataClient.total = this.cartDataServer.total;
            localStorage.setItem('cart', JSON.stringify(this.cartDataClient));
          }
          this.cartDataObs$.next({...this.cartDataServer});
        });
      });
    }
  }

  CalculateSubTotal(index): number {
    let subTotal = 0;

    const p = this.cartDataServer.data[index];
    // @ts-ignore
    subTotal = p.product.price * p.numInCart;

    return subTotal;
  }

  // tslint:disable-next-line:typedef
  AddProductToCart(id: number, quantity?: number) {

    this.productService.getOneProduct(id).subscribe(prod => {
      // If the cart is empty
      if (this.cartDataServer.data[0].product === undefined) {
        this.cartDataServer.data[0].product = prod;
        this.cartDataServer.data[0].numInCart = quantity !== undefined ? quantity : 1;
        this.CalculateTotal();
        this.cartDataClient.prodData[0].incart = this.cartDataServer.data[0].numInCart;
        this.cartDataClient.prodData[0].id = prod.id;
        this.cartDataClient.total = this.cartDataServer.total;
        localStorage.setItem('cart', JSON.stringify(this.cartDataClient));
        this.cartDataObs$.next({...this.cartDataServer});
        this.toast.success(`${prod.name} added to the cart.`, 'Product Added', {
          timeOut: 1500,
          progressBar: true,
          progressAnimation: 'increasing',
          positionClass: 'toast-top-right'
        });
      }
      // Cart is not empty
      else {
        // Secondly if the cart has some items
        const index = this.cartDataServer.data.findIndex(p => p.product.id === prod.id); // find index of item . - 1 or positive value
        if (index !== -1) {

          if (quantity !== undefined && quantity <= prod.quantity) {
            // part one if that item is already in the cart then increase => index is positive value
            // @ts-ignore
            this.cartDataServer.data[index].numInCart =
              // current cart value                     if                do           else       | always equal maximum number
              this.cartDataServer.data[index].numInCart < prod.quantity ? quantity : prod.quantity;
          } else {
            // part two if that item is not in the cart then add to cart
            // @ts-ignore
            this.cartDataServer.data[index].numInCart < prod.quantity ? this.cartDataServer.data[index].numInCart++ : prod.quantity;
          }


          this.cartDataClient.prodData[index].incart = this.cartDataServer.data[index].numInCart;
          this.toast.info(`${prod.name} quantity updated in the cart.`, 'Product Updated', {
            timeOut: 1500,
            progressBar: true,
            progressAnimation: 'increasing',
            positionClass: 'toast-top-right'
          });
        }
        else {
          // part two if that item is not in the cart then add to cart
          // insert new element to end of array
          this.cartDataServer.data.push({
            product: prod,
            numInCart: 1
          });
          this.cartDataClient.prodData.push({
            incart: 1,
            id: prod.id
          });
          this.toast.success(`${prod.name} added to the cart.`, 'Product Added', {
            timeOut: 1500,
            progressBar: true,
            progressAnimation: 'increasing',
            positionClass: 'toast-top-right'
          });
        }
        this.CalculateTotal();
        this.cartDataClient.total = this.cartDataServer.total;
        localStorage.setItem('cart', JSON.stringify(this.cartDataClient));
        this.cartDataObs$.next({...this.cartDataServer});
      }


    });
  }

  // tslint:disable-next-line:typedef
  UpdateCartData(index, increase: boolean) {
    const data = this.cartDataServer.data[index];  // store product that index
    if (increase) {
      // @ts-ignore
      data.numInCart < data.product.quantity ? data.numInCart++ : data.product.quantity; // trinary operator if/else
      this.cartDataClient.prodData[index].incart = data.numInCart; // update to new value
      this.CalculateTotal();
      this.cartDataClient.total = this.cartDataServer.total;
      this.cartDataObs$.next({...this.cartDataServer});
      localStorage.setItem('cart', JSON.stringify(this.cartDataClient));
    } else {
      // @ts-ignore
      data.numInCart--; // decrease
      // @ts-ignore
      if (data.numInCart < 1) {
        this.DeleteProductFromCart(index);
        this.cartDataObs$.next({...this.cartDataServer});
      } else {
        // @ts-ignore
        this.cartDataObs$.next({...this.cartDataServer});
        this.cartDataClient.prodData[index].incart = data.numInCart;
        this.CalculateTotal();
        this.cartDataClient.total = this.cartDataServer.total;
        localStorage.setItem('cart', JSON.stringify(this.cartDataClient));
      }

    }

  }

  // tslint:disable-next-line:typedef
  DeleteProductFromCart(index) {
    if (window.confirm('Are you sure you want to delete the item?')) {
      this.cartDataServer.data.splice(index, 1);
      this.cartDataClient.prodData.splice(index, 1);
      this.CalculateTotal();
      this.cartDataClient.total = this.cartDataServer.total;

      if (this.cartDataClient.total === 0) {
        this.cartDataClient = {prodData: [{incart: 0, id: 0}], total: 0};
        localStorage.setItem('cart', JSON.stringify(this.cartDataClient)); // update local storage
      } else {
        localStorage.setItem('cart', JSON.stringify(this.cartDataClient));  // update local storage
      }

      if (this.cartDataServer.total === 0) { // we are reset
        this.cartDataServer = {
          data: [{
            product: undefined,
            numInCart: 0
          }],
          total: 0
        };
        this.cartDataObs$.next({...this.cartDataServer});
      } else {
        this.cartDataObs$.next({...this.cartDataServer});
      }
    }
    // because confirm < Cancel > we don't delete a product from cart
    else {
      return;
    }


  }

  // tslint:disable-next-line:typedef
  CheckoutFromCart(userId: number) {

    this.httpClient.post(`${this.url}/orders/payment`, null).subscribe((res: { success: boolean }) => {

      if (res.success) {
        this.resetServerData();
        this.httpClient.post(`${this.url}/orders/new`, {
          userId: userId,
          products: this.cartDataClient.prodData
        }).subscribe((data: OrderConfirmationResponse) => {

          this.orderService.getOneOrder(data.order_id).then(prods => {
            if (data.success) {
              const navigationExtras: NavigationExtras = {
                state: {
                  message: data.message,
                  products: prods,
                  orderId: data.order_id,
                  total: this.cartDataClient.total
                }
              };
              this.router.navigate(['/success'], navigationExtras).then(p => {
                this.cartDataClient = {prodData: [{incart: 0, id: 0}], total: 0};
                this.cartTotal$.next(0);
                localStorage.setItem('cart', JSON.stringify(this.cartDataClient));
              });
            }
          });

        });
      } else {
        this.router.navigateByUrl('/checkout').then();
        this.toast.error(`Sorry, failed to book the order`, 'Order Status', {
          timeOut: 1500,
          progressBar: true,
          progressAnimation: 'increasing',
          positionClass: 'toast-top-right'
        });
      }
    });
  }


  // tslint:disable-next-line:typedef
  private CalculateTotal() { // calculate total price of product from cart
    let Total = 0;

    this.cartDataServer.data.forEach(p => {
      const {numInCart} = p; // esx destruct method
      const {price} = p.product;
      // @ts-ignore
      Total += numInCart * price;
    });
    this.cartDataServer.total = Total;
    this.cartTotal$.next(this.cartDataServer.total);
  }

  // tslint:disable-next-line:typedef
  private resetServerData() {
    this.cartDataServer = {
      data: [{
        product: undefined,
        numInCart: 0
      }],
      total: 0
    };
    this.cartDataObs$.next({...this.cartDataServer});
  }

}

interface OrderConfirmationResponse {
  order_id: number;
  success: boolean;
  message: string;
  products: [{
    id: string,
    numInCart: string
  }];
}
