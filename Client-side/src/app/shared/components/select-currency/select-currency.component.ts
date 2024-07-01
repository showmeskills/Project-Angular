import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { first, map } from 'rxjs/operators';
import { AppService } from 'src/app/app.service';
import { UserAssetsService } from 'src/app/pages/user-asset/user-assets.service';
import { CurrenciesInterface } from '../../interfaces/deposit.interface';

interface CurrenciesData {
  balance: number;
  exchangedAmount: number;
  currency: string;
  name: string;
}

/**
 * 选择法币弹窗
 */
@UntilDestroy()
@Component({
  selector: 'app-select-currency',
  templateUrl: './select-currency.component.html',
  styleUrls: ['./select-currency.component.scss'],
})
export class SelectCurrencyComponent implements OnInit {
  constructor(
    private dialogRef: MatDialogRef<SelectCurrencyComponent>,
    private appService: AppService,
    private userAssetsService: UserAssetsService,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      showBalance?: boolean;
      isDigital?: boolean;
      useData?: CurrenciesData[];
      isShowAllCurrencies?: boolean;
    }
  ) {}

  /** 所有币种 */
  currencies: CurrenciesInterface[] = [];
  /** 搜索关键字 */
  keyword: string = '';
  /** 是否加载中 */
  isLoading: boolean = true;
  /** 余额加载中 */
  isBalanceLoading: boolean = true;

  ngOnInit() {
    if (this.data.useData) {
      // 使用传入的数据渲染
      this.isLoading = false;
      this.isBalanceLoading = false;
    } else {
      // 自动获取数据
      this.appService.currencies$
        .pipe(
          first(x => x.length > 0),
          map(v =>
            v.filter(x => {
              if (this.data.isShowAllCurrencies) {
                return x.isVisible;
              } else {
                return x.isDigital == this.data.isDigital && x.isVisible;
              }
            })
          ),
          untilDestroyed(this)
        )
        .subscribe(async currencies => {
          this.currencies = currencies;
          this.isLoading = false;

          if (this.data.showBalance && this.data.isDigital) {
            this.currencies.forEach(x => (x.balance = x.rate = x.exchangedAmount = 0));
            const allUesrBalance = await this.userAssetsService.getUserbalance();
            this.userAssetsService.allRate.pipe(untilDestroyed(this)).subscribe(e => {
              const allRates: any = e;
              if (!allRates.rates) return;
              this.currencies.forEach(x => {
                const userCurrency = allUesrBalance.find((y: any) => y.currency == x.currency);
                if (userCurrency) {
                  x.balance = userCurrency.balance;
                  x.rate = allRates.rates.find((i: any) => i.currency == x.currency)?.rate ?? 0;
                  x.exchangedAmount = Number(userCurrency.balance).subtract(x.rate);
                }
              });
              this.isBalanceLoading = false;
            });
          }
        });
    }
  }

  /**
   * 选择币种
   *
   * @param item 币种
   */
  handleSelect(item: CurrenciesInterface) {
    this.dialogRef.close(item);
  }

  /**
   * 关闭弹窗
   */
  close(): void {
    this.dialogRef.close();
  }
}
