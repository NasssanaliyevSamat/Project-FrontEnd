import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import {environment} from '../../environments/environment';
import {Observable} from 'rxjs';
import {IProduct} from '../interfaces/IProduct';
import {IServerResponce} from '../interfaces/IServerResponce';


@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private url = environment.serverUrl;

  constructor(private http: HttpClient) { }

  // tslint:disable-next-line:typedef
  getAllProducts(numRes: number = 10): Observable<IServerResponce>
  {
    return this.http.get<IServerResponce>(this.url + '/products', {
      params: {
        limit: numRes.toString()
      }
    });
  }
  getOneProduct(id: number): Observable<IProduct>
  {
    return this.http.get<IProduct>(this.url + '/products' + id);
  }
  getOneProductInOneCategory(category: string): Observable<IProduct[]>
  {
    return this.http.get<IProduct[]>(this.url + '/category/' + category);
  }
}
