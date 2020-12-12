import { Component, OnInit } from '@angular/core';
import {ProductService} from '../services/product.service';
import {Router} from '@angular/router';
import {IServerResponse} from '../interfaces/IServerResponse';
import {IProduct} from '../interfaces/IProduct';
import {CartService} from '../services/cart.service';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  products: IProduct[];
  constructor(private productService: ProductService, private cartService: CartService , private router: Router) { }

  ngOnInit(): void {
    this.productService.getAllProducts().subscribe((prod: IServerResponse ) => {
      this.products = prod.products;

      console.log(this.products);
    });
  }

  selectProduct(id: number): void
  {
    this.router.navigate(['/product', id]).then();
  }
  // tslint:disable-next-line:typedef
  AddToCart(id: number)
  {
    this.cartService.AddProductToCart(id);
  }

}
