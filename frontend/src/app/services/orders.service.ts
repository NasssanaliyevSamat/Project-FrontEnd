import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';

import {IOrderServerResponse} from '../interfaces/IOrderServerResponse';
import {environment} from '../../environments/environment';
import {Observable} from 'rxjs';
import {IProduct} from '../interfaces/IProduct';

@Injectable({
  providedIn: 'root'
})
export class OrdersService {

  products: IOrderServerResponse[] = [];
  private url = environment.serverUrl;

  constructor(private http: HttpClient) { }

  // tslint:disable-next-line:typedef
  getOneOrder(orderId: number)
  {
    return this.http.get<IProduct[]>(`${this.url}orders/${orderId}`).toPromise();
  }
}
