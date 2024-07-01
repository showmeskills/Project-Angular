import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ReviewService {
  getTypeLang(type) {
    switch (type) {
      case 'Edit':
        return 'risk.manualEdited'; // 人工编辑
      case 'ManualDeposit': // 手动上分
        return 'payment.transactionList.manualDeposit';
      case 'CancelWager':
        return 'game.detail.cancelBet'; // 取消注单
      case 'Reversal':
        // if ('ReceiveAmount' in data.extraInfo) {
        //   if (data.extraInfo.ReceiveAmount ) {
        //     return 'risk.reversePartOrder'; // 冲正撤单 - 部分
        //   }
        // }

        return 'risk.reverseOrder'; // 冲正撤单
      default:
        break;
    }

    return '';
  }
}
