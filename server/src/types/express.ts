import { Request } from 'express';
import { CheckoutRequest } from './order';

export interface TypedRequest<T = {}> extends Request {
  body: T;
}

export interface CheckoutRequestBody extends CheckoutRequest {}
