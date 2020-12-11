import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import {environment} from '../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private url = environment.serverUrl;

  constructor(private http: HttpClient) { }

  // tslint:disable-next-line:typedef
  getAllProducts(numRes: number = 10)
  {
    return this.http.get(this.url + '/products', {
      params: {
        limit: numRes.toString()
      }
    });
  }
}
