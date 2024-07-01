import { Component, OnInit } from '@angular/core';
import { PageSizes, PaginatorState } from 'src/app/_metronic/shared/crud-table';
import { Clipboard } from '@angular/cdk/clipboard';
import { AppService } from 'src/app/app.service';
import { Router } from '@angular/router';
import { WalletApi } from 'src/app/shared/api/wallet.api';
import BigNumber from 'bignumber.js';
import { tap } from 'rxjs/operators';
import { ExchangeApi } from 'src/app/shared/api/exchange.api';
import { zip } from 'rxjs';
import { Exchange } from 'src/app/shared/interfaces/exchange';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { CurrencyValuePipe } from 'src/app/shared/pipes/currency-value.pipe';
import { TimeFormatPipe } from 'src/app/shared/pipes/time.pipe';
import { PaginatorComponent } from 'src/app/_metronic/shared/crud-table/components/paginator/paginator.component';
import { MatOptionModule } from '@angular/material/core';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CurrencyIconDirective } from 'src/app/shared/components/icon/icon.directive';
import { NgFor, NgIf } from '@angular/common';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { CurrencyItemComponent } from '../hot/currency-item/currency-item.component';

@Component({
  selector: 'cold',
  templateUrl: './cold.component.html',
  styleUrls: ['./cold.component.scss'],
  standalone: true,
  imports: [
    CurrencyItemComponent,
    AngularSvgIconModule,
    NgFor,
    NgIf,
    CurrencyIconDirective,
    MatFormFieldModule,
    MatSelectModule,
    FormsModule,
    MatOptionModule,
    PaginatorComponent,
    TimeFormatPipe,
    CurrencyValuePipe,
    LangPipe,
  ],
})
export class ColdComponent implements OnInit {
  constructor(
    private clipboard: Clipboard,
    private appService: AppService,
    public router: Router,
    private api: WalletApi,
    private exchangeApi: ExchangeApi
  ) {}

  pageSizes: number[] = PageSizes; // 页大小
  paginator: PaginatorState = new PaginatorState(); // 分页
  list: any[] = [];
  exchangeList: Exchange[] = [];
  currencyIndex = 0;
  balanceTotal = { totalByUSDT: '', total: [] };

  /** getters */
  /** 当前统计币种余额的三个显示 */
  get balanceThree() {
    return this.balanceTotal.total.slice(this.currencyIndex * 3, this.currencyIndex * 3 + 3);
  }

  /** 获取USDT汇率 */
  get getUSDTRate() {
    return this.exchangeList.find((e) => e.currency === 'USDT')?.rate || 0;
  }

  /** lifeCycle */
  ngOnInit(): void {
    this.list = [];
    this.paginator.total = 1;

    this.appService.isContentLoadingSubject.next(true);
    zip(this.getExchange$(), this.loadData$()).subscribe(() => this.appService.isContentLoadingSubject.next(false));
  }

  /** methods */
  /** 获取数据 */
  loadData(resetPage = false) {
    this.appService.isContentLoadingSubject.next(true);
    this.loadData$(resetPage).subscribe(() => {
      this.appService.isContentLoadingSubject.next(false);
    });
  }

  loadData$(resetPage = false) {
    resetPage && (this.paginator.page = 1); // 暂时没有分页

    return this.api.getColdwallet().pipe(
      tap((res) => {
        this.list = res;
        this.currencyIndex = 0;
        this.exchangeList.length && this.getBalanceTotal();
      })
    );
  }

  getExchange$() {
    return this.exchangeApi.getExchangeRates().pipe(
      tap((res) => {
        this.exchangeList = res;

        if (!this.exchangeList.length) {
          return this.appService.showToastSubject.next({ msgLang: 'walle.notRateList' });
        }

        this.list.length && this.getBalanceTotal();
      })
    );
  }

  /** 计算聚合统计 */
  getBalanceTotal() {
    this.balanceTotal = this.list?.reduce(
      (prev, curr) => {
        const tokens = curr?.tokens || [];

        tokens.forEach((j) => {
          const res = prev?.total?.find((e) => e.currency === j.coin);

          if (res) {
            res['balance'] = new BigNumber(res['balance'] || 0).plus(j.balance || 0).toString();
          } else {
            prev.total.push({ balance: String(j.balance), currency: j.coin });
          }
        });

        const totalUSD = this.exchangeComputer(tokens).reduce((t, n) => {
          return new BigNumber(t).plus(n).toString();
        }, 0);

        curr.blanceByUSDT = new BigNumber(totalUSD).div(this.getUSDTRate).toString();

        prev.totalByUSDT = new BigNumber(curr.blanceByUSDT).plus(prev.totalByUSDT || 0).toString();

        return prev;
      },
      { totalByUSDT: '', total: [] }
    ) || { totalByUSDT: 0, total: [] };
  }

  onCopy(text: string) {
    const successed = this.clipboard.copy(text);
    this.appService.showToastSubject.next({ msg: successed ? '复制成功' : '复制失败', successed });
  }

  onOpera(isPrev = false) {
    if (isPrev) {
      this.currencyIndex--;
      this.currencyIndex < 0 && (this.currencyIndex = Math.ceil(this.balanceTotal.total.length / 3) - 1);
    } else {
      this.currencyIndex++;
      this.currencyIndex %= Math.ceil(this.balanceTotal.total.length / 3);
    }
  }

  exchangeComputer(tokens) {
    return tokens.map((j) => {
      const rate = this.exchangeList.find((e) => e.currency === j.coin)?.rate || 0;
      !rate && this.appService.showToastSubject.next({ msgLang: 'wallet.notRate', msgArgs: { coin: j.coin } });

      return new BigNumber(rate).multipliedBy(j.balance).toString();
    });
  }
}
