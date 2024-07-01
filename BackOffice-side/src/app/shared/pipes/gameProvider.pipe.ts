import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'walletType',
  standalone: true,
})
export class WalletTypePipe implements PipeTransform {
  transform(value: string): string {
    switch (value) {
      case 'Main':
        return '主钱包';
      case 'Ag':
        return 'AG 钱包';
      case 'Ky':
        return 'KY 钱包';
      case 'Rg':
        return 'RG 钱包';
      case 'ShaBa':
        return '沙巴钱包';
      case 'LeiESport':
        return '雷电竞钱包';
      case 'Thunderfire':
        return '雷火钱包';
      case 'Bonus':
        return '红利钱包';
      case 'WithdrawLimit':
        return '提款流水要求（非钱包）';
      case 'BoyaChess':
        return '博雅棋牌';
      case 'Golden':
        return '高登钱包';
      case 'SGWinChess':
        return '双赢钱包';
      case 'YYChess':
        return '云游钱包';
      case 'GPIChess':
        return 'GPI钱包';
      case 'AGSlot':
        return '新AG电子';
      default:
        return '';
    }
  }
}

@Pipe({
  name: 'orderType',
  standalone: true,
})
export class OrderTypePipe implements PipeTransform {
  transform(value: string): string {
    switch (value) {
      case 'Deposit':
        return '存款';
      case 'Withdraw':
        return '提款';
      case 'Transfer':
        return '划转';
      case 'Exchange':
        return '交易';
      case 'Gaming':
        return '游戏';
      case 'Adjust':
        return '调账';
      case 'Bonus':
        return '红利';
      case 'Commission':
        return '佣金';
      default:
        return '';
    }
  }
}
