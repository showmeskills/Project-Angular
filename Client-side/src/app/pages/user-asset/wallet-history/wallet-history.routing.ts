import { RouterModule, Routes } from '@angular/router';
import { AdjustmentHistoryComponent } from './adjustment-history/adjustment-history.component';
import { CommissionHistoryComponent } from './commission-history/commission-history.component';
import { DepositHistoryComponent } from './deposit-history/deposit-history.component';
import { PrizeHistoryComponent } from './prize-history/prize-history.component';
import { PromotionHistoryComponent } from './promotion-history/promotion-history.component';
import { TransferHistoryComponent } from './transfer-history/transfer-history.component';
import { WalletHistoryComponent } from './wallet-history.component';
import { WithdrawHistoryComponent } from './withdraw-history/withdraw-history.component';
const routes: Routes = [
  {
    path: '',
    component: WalletHistoryComponent,
    children: [
      { path: '', redirectTo: 'deposit', pathMatch: 'full' },
      //充值
      { path: 'deposit', component: DepositHistoryComponent },
      //提现
      { path: 'withdrawal', component: WithdrawHistoryComponent },
      //划转
      { path: 'transfer', component: TransferHistoryComponent },
      //红利
      { path: 'promotion', component: PromotionHistoryComponent },
      //调账
      { path: 'adjustment', component: AdjustmentHistoryComponent },
      //佣金
      { path: 'commission', component: CommissionHistoryComponent },
      //抽奖
      { path: 'prize', component: PrizeHistoryComponent },

      // TODO: -------- 下面组件，如需重新启用，需要用新的下拉框等组件替换此组件内的旧组件
      // { path: 'exchange', component: ExchangeHistoryComponent }, //兑换
      // { path: 'transaction', component: TranscationHistoryComponent }, //交易
      //-------------------------------
    ],
  },
];

export const WalletHistoryRoutes = RouterModule.forChild(routes);
