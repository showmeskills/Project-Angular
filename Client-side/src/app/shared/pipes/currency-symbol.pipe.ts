import { Pipe, PipeTransform } from '@angular/core';
const allCurrencySymbol = [
  {
    currency: 'CNY',
    symbol: '¥',
  },
  {
    currency: 'AUD',
    symbol: '$',
  },
  {
    currency: 'USD',
    symbol: '$',
  },
  {
    currency: 'THB',
    symbol: '฿',
  },
  {
    currency: 'VND',
    symbol: '₫',
  },
  {
    currency: 'JPY',
    symbol: '¥',
  },
  {
    currency: 'EUR',
    symbol: '€',
  },
  {
    currency: 'GBP',
    symbol: '£',
  },
  {
    currency: 'NZD',
    symbol: '$',
  },
  {
    currency: 'CAD',
    symbol: '$',
  },
];

@Pipe({
  name: 'symbol',
})
export class CurrencySymbolPipe implements PipeTransform {
  transform(value: string, args?: any): any {
    const symbol = allCurrencySymbol.find(e => e.currency == value)?.symbol;

    return symbol;
  }
}
