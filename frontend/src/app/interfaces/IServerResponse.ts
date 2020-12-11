import {IProduct} from './IProduct';

export interface IServerResponse{
  count: number;
  products: IProduct[];
}
