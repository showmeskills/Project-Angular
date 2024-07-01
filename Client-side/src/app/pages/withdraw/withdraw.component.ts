import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { AppService } from 'src/app/app.service';
import { LayoutService } from 'src/app/shared/service/layout.service';
import { LocaleService } from 'src/app/shared/service/locale.service';
import { CryptoWithdrawComponent } from './crypto-withdraw/crypto-withdraw.component';
import { CurrencyWithdrawComponent } from './currency-withdraw/currency-withdraw.component';

@UntilDestroy()
@Component({
  selector: 'app-withdraw',
  templateUrl: './withdraw.component.html',
  styleUrls: ['./withdraw.component.scss'],
})
export class WithdrawComponent implements OnInit {
  constructor(
    private router: Router,
    private layout: LayoutService,
    private appService: AppService,
    private localeService: LocaleService
  ) {}

  page: string = '';

  titleMap: any = {
    fiat: this.localeService.getValue('wd_fiat'),
    crypto: this.localeService.getValue('wd_crypto'),
  };

  toPagetitleMap: any = {
    fiat: this.localeService.getValue('wd_crypto'),
    crypto: this.localeService.getValue('wd_fiat'),
  };

  toPageLinkMap: any = {
    fiat: 'crypto',
    crypto: 'fiat',
  };

  ngOnInit() {
    this.layout.page$.pipe(untilDestroyed(this)).subscribe(page => {
      switch (page) {
        case CurrencyWithdrawComponent:
          this.page = 'fiat';
          break;
        case CryptoWithdrawComponent:
          this.page = 'crypto';
          break;
      }
    });
  }

  //back to prev page
  back() {
    this.router.navigate([this.appService.languageCode, 'wallet']);
  }
}
