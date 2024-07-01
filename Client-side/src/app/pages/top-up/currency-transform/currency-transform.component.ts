import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Subscription, firstValueFrom, timer } from 'rxjs';
import { AppService } from 'src/app/app.service';
import { DepositApi } from 'src/app/shared/apis/deposit.api';
import { DepositCryptoCallBackData } from 'src/app/shared/interfaces/deposit.interface';
import { LayoutService } from 'src/app/shared/service/layout.service';

@UntilDestroy()
@Component({
  selector: 'app-currency-transform',
  templateUrl: './currency-transform.component.html',
  styleUrls: ['./currency-transform.component.scss'],
})
export class CurrencyTransformComponent implements OnInit {
  constructor(
    private layout: LayoutService,
    private router: Router,
    private appService: AppService,
    private depositApi: DepositApi
  ) {
    // const test: DepositCryptoCallBackData = {
    //   statue: 1,
    //   limitMinute: 0,
    //   canUseTime: 0,
    //   orderId: 'D1728644150841797G',
    //   amount: 150,
    //   currency: 'CNY',
    //   paymentCode: 'OverTheCounterTransfer',
    //   createTime: 1687673268409,
    //   expireTime: 1687673568000,
    //   actionType: 3,
    //   bankInfo: {
    //     bankName: '',
    //     bankAccountNumber: '',
    //     bankAccountHolder: '',
    //     desc: '',
    //     transaferAddress: '',
    //   },
    //   html: '',
    //   redirectUrl:
    //     'https://cashier.doudoupays.com/cashier/otc/selectView?orderId=20230625140748166362&token=eyJhbGciOiJIUzUxMiJ9.eyJqdGkiOiIyMDIzMDYyNTE0MDc0ODE2NjM2MiIsImlhdCI6MTY4NzY3MzI2OCwiaXNzIjoibGVkZ2VyIiwidXNlcklkIjoiODc2YzM4MWVlOCIsImV4cCI6MTY4NzY3Njg2OH0.Jo8bNrTENMadyx5fDQR2f6sSXZIiQwykIspi9sTQVgkPc1B8j9SkDHXnpXYuPXVZHOFJZW3OJ60o12mmz1ov-A',
    //   remark: '',
    //   paymentCurrency: 'Unknown',
    //   paymentAmount: 0,
    //   depositAddress: '',
    //   network: 0,
    //   expectedBlock: 0,
    //   expectedUnlockBlock: 0,
    //   rate: 0,
    //   seletedDepositWay: {
    //     code: 'OverTheCounterTransfer',
    //     type: ['推荐', '银行卡支付'],
    //     category: 'Deposit',
    //     name: '人工申请',
    //     minAmount: 100,
    //     maxAmount: 200000,
    //     fee: 0,
    //     desc: null,
    //     icons: [
    //       'https://static.yedxasa.cn/PaymethodIcon/22/26/13/637933011815246704/img/637933011815246620.png',
    //       'https://static.yedxasa.cn/PaymethodIcon/22/26/13/637933011864709998/img/637933011864709935.png',
    //       'https://static.yedxasa.cn/PaymethodIcon/22/26/13/637933011900587875/img/637933011900587811.png',
    //       'https://static.yedxasa.cn/PaymethodIcon/22/26/13/637933011974044648/img/637933011974044571.png',
    //       'https://static.yedxasa.cn/PaymethodIcon/22/26/13/637933011949570026/img/637933011949569948.png',
    //       'https://static.yedxasa.cn/PaymethodIcon/22/26/13/637933011925141655/img/637933011925141591.png',
    //       'https://static.yedxasa.cn/PaymethodIcon/22/26/13/637933012057102385/img/637933012057102280.png',
    //       'https://static.yedxasa.cn/PaymethodIcon/22/26/13/637933012029885251/img/637933012029885193.png',
    //       'https://static.yedxasa.cn/PaymethodIcon/22/26/13/637933011999154203/img/637933011999154138.png',
    //     ],
    //     actionType: 3,
    //     needBankCode: false,
    //     tipsInfo: [
    //       {
    //         tipsType: 'Operate',
    //         content: '成功率最高',
    //       },
    //       {
    //         tipsType: 'Deposit',
    //         content:
    //           '<p style="line-height: 1.5em;"><span style="font-size: 14px;color: rgb(165, 165, 165);">▪ 请在弹出窗口中询问客服获取存款银行卡详细信息</span></p><p style="line-height: 1.5em;"><span style="color: rgb(165, 165, 165);font-size: 14px;">▪ 银行账户不定期更换，每次充值时请重新获取银行信息，否则无法入账，公司概不负责。</span></p><p style="line-height: 1.5em;"><span style="color: rgb(165, 165, 165);font-size: 14px;"></span></p><p style="white-space: normal;line-height: 1.5em;"><span style="font-size: 14px;color: rgb(165, 165, 165);">▪ 实际支付金额必须与显示金额**</span><span style="font-size: 14px;color: rgb(255, 0, 0);">完全一致</span><span style="font-size: 14px;color: rgb(165, 165, 165);">**，否则将出现长时间延迟到账或无法入账。</span></p>',
    //       },
    //     ],
    //   },
    // };

    // const test2: DepositCryptoCallBackData = {
    //   statue: 1,
    //   limitMinute: 0,
    //   canUseTime: 0,
    //   orderId: 'D1728694006729925G',
    //   amount: 500,
    //   currency: 'CNY',
    //   paymentCode: 'C2CBankTransfer',
    //   createTime: 1687676312439,
    //   expireTime: 1687676612000,
    //   actionType: 1,
    //   bankInfo: {
    //     bankName: '农业银行',
    //     bankAccountNumber: '6228450598021768873',
    //     bankAccountHolder: '刘冒生',
    //     desc: '',
    //     transaferAddress: '',
    //   },
    //   html: '',
    //   redirectUrl: '',
    //   remark: '',
    //   paymentCurrency: 'Unknown',
    //   paymentAmount: 0,
    //   depositAddress: '',
    //   network: 0,
    //   expectedBlock: 0,
    //   expectedUnlockBlock: 0,
    //   rate: 0,
    // };

    this.orderInfo = this.router.getCurrentNavigation()?.extras.state as any;
  }

  /** 存款订单信息 */
  orderInfo?: DepositCryptoCallBackData;
  /** 计时显示 */
  countDown: string | null = '00:00';

  countDownTimer!: Subscription;
  checkTimer!: Subscription;

  isH5!: boolean;
  ngOnInit() {
    this.layout.isH5$.pipe(untilDestroyed(this)).subscribe(e => (this.isH5 = e));
    if (!this.orderInfo) {
      this.router.navigate([this.appService.languageCode, 'wallet', 'overview']);
    }
    //倒计时
    this.countDownTimer = timer(0, 1000)
      .pipe(untilDestroyed(this))
      .subscribe(_ => {
        const expireTime = this.orderInfo?.expireTime || 0;
        const tsDiff = expireTime - Date.now();
        if (tsDiff <= 0) {
          this.countDown = null;
          this.countDownTimer?.unsubscribe();
        } else {
          const secDiff = Math.floor(tsDiff / 1000);
          const min = Math.floor(secDiff / 60);
          const sec = secDiff % 60;
          this.countDown = `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
        }
      });
    //检查订单状态
    this.checkTimer = timer(0, 5000)
      .pipe(untilDestroyed(this))
      .subscribe(async _ => {
        const depositeOrderStatus = await firstValueFrom(
          this.depositApi.getDepositOrderStateInfo(this.orderInfo?.orderId || '')
        );
        if (depositeOrderStatus?.success && depositeOrderStatus?.data?.state == 'Success') {
          this.checkTimer?.unsubscribe();
          timer(5000)
            .pipe(untilDestroyed(this))
            .subscribe(_ => {
              this.submit();
            });
        }
      });
  }

  openNewWindow() {
    if (this.orderInfo?.redirectUrl) {
      window.open(this.orderInfo?.redirectUrl);
    }
  }

  /**
   * 确认支付，跳转总览页面
   * 全局监听enter事件
   */
  @HostListener('body:keydown.enter', ['$event'])
  submit() {
    this.router.navigate([this.appService.languageCode]);
  }
}
