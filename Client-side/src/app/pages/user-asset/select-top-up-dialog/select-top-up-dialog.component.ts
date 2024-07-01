import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AppService } from 'src/app/app.service';
import { LocaleService } from 'src/app/shared/service/locale.service';
import { PaymentIqService } from '../../../shared/components/select-deposit-bonus/payment-iq/payment-iq.service';
import { DepositTypeInterface } from '../../../shared/interfaces/deposit.interface';
import { ExchangeService } from '../../exchange/exchange.service';

@Component({
  selector: 'app-select-top-up-dialog',
  templateUrl: './select-top-up-dialog.component.html',
  styleUrls: ['./select-top-up-dialog.component.scss'],
})
export class SelectTopUpDialogComponent implements OnInit {
  depositGroups: DepositTypeInterface[] = [];
  isLoading: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<SelectTopUpDialogComponent>,
    private router: Router,
    private appService: AppService,
    private localeService: LocaleService,
    private exchangeService: ExchangeService,
    public piqService: PaymentIqService,
  ) {}

  ngOnInit() {
    this.getDepositGroups();
  }

  getDepositGroups(): void {
    this.depositGroups = [
      {
        id: 1,
        icon: 'digital-wallet',
        name: this.localeService.getValue('dep_crypto'),
        remark: this.localeService.getValue('have_dig', '{Brand}'),
        router: 'crypto',
      },
      {
        id: 2,
        icon: 'currency-wallet',
        name: this.localeService.getValue('dep_fiat'),
        remark: this.localeService.getValue('from_to', '{Brand}'),
        router: 'fiat',
      },
      {
        id: 3,
        icon: 'credit-wallet',
        name: this.localeService.getValue('card_buy'),
        remark: this.localeService.getValue('others_buy'),
        router: 'purchase',
      },
    ];
  }

  /**
   * 关闭弹窗
   *
   * @param state
   */
  close(state?: string): void {
    this.dialogRef.close(state);
  }

  handleSelect(item: DepositTypeInterface) {
    const currentCurrency = this.appService.currentCurrency$.value;
    const currency = currentCurrency?.currency;
    const isDigital = currentCurrency?.isDigital;

    if (item.router == 'purchase') {
      this.router.navigate([this.appService.languageCode, 'exChange', item.router], {
        queryParams: {
          currency: this.exchangeService.canBuyCurrency.includes(currency) ? currency : undefined,
        },
      });
    } else {
      if (item.router === 'fiat') {
        this.piqService.allowRoute.set(false);
        this.piqService.selectDepositMethod.set('fiat');
      } else if (item.router === 'crypto') {
        this.piqService.allowRoute.set(false);
        this.piqService.selectDepositMethod.set('crypto');
      }
      this.router.navigate([this.appService.languageCode, 'deposit', item.router], {
        queryParams: {
          currency: currentCurrency ? (isDigital && item.router === 'crypto' ? currency : undefined) : undefined,
        },
      });
    }

    this.close('done');
  }
}
