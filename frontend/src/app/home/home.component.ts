import { Component, OnInit } from '@angular/core';
import {ProductService} from '../services/product.service';
import {Router} from '@angular/router';
import {IServerResponce} from '../interfaces/IServerResponse';
import {IProduct} from '../interfaces/IProduct';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  products: IProduct[];
  constructor(private productService: ProductService, private router: Router) { }

  ngOnInit(): void {
    this.productService.getAllProducts().subscribe((prod: IServerResponce ) => {
      this.products = prod.products;

      console.log(this.products);
    });
  }

  selectProduct(id: number): void
  {
    this.router.navigate(['/product', id]).then();
  }

}
