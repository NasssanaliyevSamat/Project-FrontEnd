import { Component, OnInit } from '@angular/core';
import {ProductService} from '../services/product.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  products: any[];
  constructor(private productService: ProductService, private router: Router) { }

  ngOnInit(): void {
    this.productService.getAllProducts().subscribe((prod: { count: Number, products: any[]}) => {
      this.products = prod.products;

      console.log(this.products);
    });
  }

  selectProduct(id: number): void
  {
    this.router.navigate(['/product', id]).then();
  }

}
