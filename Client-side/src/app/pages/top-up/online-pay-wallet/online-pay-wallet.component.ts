import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import moment from 'moment';
import { firstValueFrom } from 'rxjs';
import { AppService } from 'src/app/app.service';
import { DepositApi } from 'src/app/shared/apis/deposit.api';
import { TopUpService } from '../top-up.service';

@Component({
  selector: 'app-online-pay-wallet',
  templateUrl: './online-pay-wallet.component.html',
  styleUrls: ['./online-pay-wallet.component.scss'],
})
export class OnlinePayWalletComponent implements OnInit {
  constructor(
    private router: Router,
    private topUpService: TopUpService,
    private depositApi: DepositApi,
    private appService: AppService,
  ) {}

  status: string = 'Waiting'; //Waiting:审核中 ； Success：成功 ； Fail：失败
  orderInfor: any = {}; //DepositOrderStatusCallBackData
  amount: string = '';
  symbol: string = '';
  expiredTime: string = '';
  tipTimer: any;

  ngOnInit() {
    const { orderId } = this.topUpService.orderInfor;
    if (this.tipTimer) clearTimeout(this.tipTimer);
    this.tipTimer = setTimeout(() => this.getOrderStatus(orderId), 5000);
  }

  async getOrderStatus(orderId: string) {
    const depositeOrderStatus = await firstValueFrom(this.depositApi.getDepositOrderStateInfo(orderId));
    if (depositeOrderStatus?.success) {
      this.orderInfor = depositeOrderStatus?.data;
      this.expiredTime = moment(depositeOrderStatus?.data?.expiredTime).format('YYYY-MM-DD HH:mm');
    }
  }

  submit() {
    this.router.navigate([this.appService.languageCode, 'wallet', 'overview']);
  }
}
