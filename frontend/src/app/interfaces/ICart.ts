import {IProduct} from './IProduct';

export interface ICartServerResponse{
  total: number;
  data: [{
    product: IProduct;
    numInCart: number;
  }];
}

export interface ICart{
  total: number;
  prodData: [{
    id: number;
    incart: number;
  }];
}
