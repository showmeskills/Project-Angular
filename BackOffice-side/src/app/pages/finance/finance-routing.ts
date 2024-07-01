import { Routes } from '@angular/router';
import { DepositComponent } from './deposit/deposit.component';
import { WithdrawalsComponent } from './withdrawals/withdrawals.component';
import { BankComponent } from './bank/bank.component';
import { BankManageComponent } from 'src/app/pages/finance/bank-manage/bank-manage.component';
import { AddressComponent } from './address/address.component';
import { BillComponent } from 'src/app/pages/finance/bill/bill.component';
import { ReportComponent } from 'src/app/pages/finance/report/report.component';
import { ReportSportChartComponent } from 'src/app/pages/finance/report/report/report-sport/chart/chart.component';
import { ReportSportListComponent } from 'src/app/pages/finance/report/report/report-sport/list/list.component';
import { ReportCasinoListComponent } from 'src/app/pages/finance//report/report/report-casino/list/list.component';
import { ReportCasinoChartComponent } from 'src/app/pages/finance//report/report/report-casino/chart/chart.component';
import { ReportRealListComponent } from 'src/app/pages/finance/report/report/report-real/list/list.component';
import { ReportRealChartComponent } from 'src/app/pages/finance/report/report/report-real/chart/chart.component';
import { ReportLotteryChartComponent } from 'src/app/pages/finance/report/report/report-lottery/chart/chart.component';
import { ReportLotteryListComponent } from 'src/app/pages/finance/report/report/report-lottery/list/list.component';
import { ReportChessListComponent } from 'src/app/pages/finance/report/report/report-chess/list/list.component';
import { ReportChessChartComponent } from 'src/app/pages/finance/report/report/report-chess/chart/chart.component';
import { TransferComponent } from 'src/app/pages/finance/transfer/transfer.component';
import { ValetRechargeComponent } from 'src/app/pages/finance/valet-recharge/valet-recharge.component';
import { ProductComponent } from './product/product.component';
import { WithdrawalsConfigComponent } from 'src/app/pages/finance/withdrawals/withdrawals-config/withdrawals-config.component';

// 交易记录：供应商图表统计子路由
const reportChartChildren: Routes = [
  { path: '', redirectTo: 'sport', pathMatch: 'full' },
  {
    path: 'sport',
    component: ReportSportChartComponent,
    data: { name: '体育报表', lang: 'breadCrumb.sportsReport', showMerchant: true },
  },
  {
    path: 'casino',
    component: ReportCasinoChartComponent,
    data: { name: '游戏城报表', lang: 'breadCrumb.gameCityReport', showMerchant: true },
  },
  {
    path: 'real',
    component: ReportRealChartComponent,
    data: { name: '真人娱乐城报表', lang: 'breadCrumb.liveCasinoStatement', showMerchant: true },
  },
  {
    path: 'lottery',
    component: ReportLotteryChartComponent,
    data: { name: '彩票报表', lang: 'breadCrumb.lotteryReport', showMerchant: true },
  },
  {
    path: 'chess',
    component: ReportChessChartComponent,
    data: { name: '棋牌报表', lang: 'breadCrumb.chessReport', showMerchant: true },
  },
];

// 交易记录：供应商列表统计子路由
const reportListChildren: Routes = [
  { path: '', redirectTo: 'sport', pathMatch: 'full' },
  {
    path: 'sport',
    component: ReportSportListComponent,
    data: { name: '体育报表', lang: 'breadCrumb.sportsReport', showMerchant: true },
  },
  {
    path: 'casino',
    component: ReportCasinoListComponent,
    data: { name: '游戏城报表', lang: 'breadCrumb.gameCityReport', showMerchant: true },
  },
  {
    path: 'real',
    component: ReportRealListComponent,
    data: { name: '真人娱乐城报表', lang: 'breadCrumb.liveCasinoStatement', showMerchant: true },
  },
  {
    path: 'lottery',
    component: ReportLotteryListComponent,
    data: { name: '彩票报表', lang: 'breadCrumb.lotteryReport', showMerchant: true },
  },
  {
    path: 'chess',
    component: ReportChessListComponent,
    data: { name: '棋牌报表', lang: 'breadCrumb.chessReport', showMerchant: true },
  },
];

export const routes: Routes = [
  { path: '', redirectTo: 'deposit', pathMatch: 'full' },
  {
    path: 'deposit',
    component: DepositComponent,
    data: { name: '存款记录', code: '292', showMerchant: true, showRegion: true, lang: 'breadCrumb.depositRecord' },
  },
  {
    path: 'withdrawals',
    component: WithdrawalsComponent,
    data: { name: '出款记录', code: '293', showMerchant: true, showRegion: true, lang: 'breadCrumb.paymentRecord' },
  },
  {
    path: 'withdrawals-config',
    component: WithdrawalsConfigComponent,
    data: { name: '出款审核配置', code: '321', showMerchant: true, lang: 'nav.withdrawalConfig' },
  },
  {
    path: 'bank',
    component: BankComponent,
    data: { name: '银行卡管理', showMerchant: true, lang: 'nav.bankCardManagement' },
  },
  {
    path: 'bank-manage',
    component: BankManageComponent,
    data: { name: '提款信息绑定管理', showMerchant: true, lang: 'nav.withdrawalInforManagement' },
  },
  {
    path: 'address',
    component: AddressComponent,
    data: { name: '虚拟地址管理', showMerchant: true, lang: 'breadCrumb.virtualAddressManagement' },
  },
  {
    path: 'bill',
    component: BillComponent,
    data: { name: '调账记录', showMerchant: true, lang: 'nav.accountAdjustmentRecord' },
  },
  {
    path: 'transfer-record',
    component: TransferComponent,
    data: { name: '转账记录', showMerchant: true, code: '228', lang: 'nav.transferRecord' },
  },
  // {
  //   path: 'report',
  //   component: ReportComponent,
  //   data: { name: '供应商报表', provider: true, lang: 'nav.supplierReport' },
  //   children: reportChildren,
  // },
  {
    path: 'transaction-report-list',
    component: ReportComponent,
    data: { name: '交易记录', code: '254', lang: 'nav.transactionRecord' },
    children: reportListChildren,
  },
  {
    path: 'transaction-report-chart',
    component: ReportComponent,
    data: { name: '交易统计', code: '10017', lang: 'nav.transactionDashboard' },
    children: reportChartChildren,
  },
  {
    path: 'product-report',
    component: ProductComponent,
    data: { name: '产品报表', showMerchant: true, code: '312', showTime: true, lang: 'nav.productReport' },
  },
  {
    path: 'valet-recharge',
    component: ValetRechargeComponent,
    data: { name: '代客充值', showMerchant: true, code: '232', lang: 'nav.valetRecharge' },
  },
];
