import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import moment from 'moment';
import { firstValueFrom } from 'rxjs';
import { AppService } from 'src/app/app.service';
import { DepositApi } from 'src/app/shared/apis/deposit.api';
import { TopUpService } from '../top-up.service';

@Component({
  selector: 'app-online-payment',
  templateUrl: './online-payment.component.html',
  styleUrls: ['./online-payment.component.scss'],
})
export class OnlinePaymentComponent implements OnInit {
  constructor(
    private router: Router,
    private depositApi: DepositApi,
    private topUpService: TopUpService,
    private appService: AppService,
  ) {}
  status: string = 'pending'; //pending:审核中 ； success：成功 ； fail：失败
  orderInfor: any = {}; //DepositOrderStatusCallBackData
  amount: string = '';
  symbol: string = '';
  expiredTime: string = '';
  async ngOnInit() {
    const { symbol, amount, orderId } = this.topUpService.orderInfor;
    this.symbol = symbol;
    this.amount = amount;
    const depositeOrderStatus = await firstValueFrom(this.depositApi.getDepositOrderStateInfo(orderId));

    if (depositeOrderStatus?.success) {
      this.orderInfor = depositeOrderStatus?.data;
      const iniDa = new Date(depositeOrderStatus?.data?.expiredTime);
      this.expiredTime = moment(new Date(iniDa)).format('YYYY-MM-DD HH:mm');
    }
  }

  submit() {
    this.router.navigate([this.appService.languageCode, 'wallet', 'overview']);
  }
}
