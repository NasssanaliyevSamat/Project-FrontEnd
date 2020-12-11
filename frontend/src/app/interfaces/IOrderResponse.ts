export interface IOrderResponse{
  order_id: number;
  success: boolean;
  message: string;
  products: [{
    id: string,
    numberInCart: string
  }];
}
