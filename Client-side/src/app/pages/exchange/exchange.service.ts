import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ExchangeService {
  constructor() {}
  canBuyCurrency = ['ETH', 'USDT', 'BTC', 'BNB', 'USDC'];
}
