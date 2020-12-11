import {IProduct} from './IProduct';

export interface ICartServerResponse{
  total: number;
  d: [{
    product: IProduct;
    numberInCart: number;
  }];
}

export interface ICart{
  totall: number;
  dd: [{
    id: number;
    inCount: number;
  }];
}
