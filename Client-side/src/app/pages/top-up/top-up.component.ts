import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { AppService } from 'src/app/app.service';
import { SelectDepositBonusService } from 'src/app/shared/components/select-deposit-bonus/select-deposit-bonus.service';
import { LayoutService } from 'src/app/shared/service/layout.service';
import { LocaleService } from 'src/app/shared/service/locale.service';
import { PaymentIqService } from '../../shared/components/select-deposit-bonus/payment-iq/payment-iq.service';
import { CurrencyTransformComponent } from './currency-transform/currency-transform.component';
import { CurrencyComponent } from './currency/currency.component';
import { DigitalComponent } from './digital/digital.component';
import { OnlinePayWalletComponent } from './online-pay-wallet/online-pay-wallet.component';
import { OnlinePaymentComponent } from './online-payment/online-payment.component';
import { VnThTransferComponent } from './vn-th-transfer/vn-th-transfer.component';

@UntilDestroy()
@Component({
  selector: 'app-top-up',
  templateUrl: './top-up.component.html',
  styleUrls: ['./top-up.component.scss'],
})
export class TopUpComponent implements OnInit {
  constructor(
    private router: Router,
    private layout: LayoutService,
    private appService: AppService,
    private localeService: LocaleService,
    private piqService: PaymentIqService,
    private selectDepositBonusService: SelectDepositBonusService,
  ) {}

  pagetitle: string = '';
  page: string = '';

  ngOnInit() {
    this.layout.page$.pipe(untilDestroyed(this)).subscribe(page => {
      switch (page) {
        case DigitalComponent:
          this.page = 'Digital';
          this.pagetitle = this.localeService.getValue('dep_crypto');
          break;
        case CurrencyComponent:
          this.page = 'Currency';
          this.pagetitle = this.localeService.getValue('dep_fiat');
          break;
        case CurrencyTransformComponent:
          this.page = 'CurrencyTransform';
          this.pagetitle = this.localeService.getValue('dep_fiat');
          break;
        case OnlinePaymentComponent:
          this.page = 'OnlinePayment';
          this.pagetitle = this.localeService.getValue('on_payment');
          break;
        case VnThTransferComponent:
          this.page = 'VnThTransfer';
          this.pagetitle = this.localeService.getValue('on_payment');
          break;
        case OnlinePayWalletComponent:
          this.page = 'OnlineTransfer';
          this.pagetitle = this.localeService.getValue('ew');
          break;
        default:
          break;
      }
    });
  }

  //back to prev page 返回钱包总览页面
  back() {
    this.router.navigate([this.appService.languageCode, 'wallet']);
  }

  onChangeRoute() {
    if (!this.selectDepositBonusService.switchEuBonusFlow) return;
    this.piqService.seletedDividend.set(null);
    this.piqService.allowRoute.set(true);
  }
}
