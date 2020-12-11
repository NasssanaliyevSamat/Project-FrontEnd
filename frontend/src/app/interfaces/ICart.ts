import {IProduct} from './IProduct';

export interface ICart{
  total: number;
  d: [{
    product: IProduct;
    numberInCart: number;
  }];
}

export interface ICartServerResponce{
  totall: number;
  dd: [{
    id: number;
    inCount: number;
  }];
}
