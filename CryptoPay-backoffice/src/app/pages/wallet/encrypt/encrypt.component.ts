import { Component, OnInit } from '@angular/core';
import { PageSizes, PaginatorState } from 'src/app/_metronic/shared/crud-table';
import { Clipboard } from '@angular/cdk/clipboard';
import { AppService } from 'src/app/app.service';
import { Router } from '@angular/router';
import { WalletApi } from 'src/app/shared/api/wallet.api';
import { tap } from 'rxjs/operators';
import { zip } from 'rxjs';
import BigNumber from 'bignumber.js';
import { ExchangeApi } from 'src/app/shared/api/exchange.api';
import { Exchange } from 'src/app/shared/interfaces/exchange';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { CurrencyValuePipe } from 'src/app/shared/pipes/currency-value.pipe';
import { TimeFormatPipe } from 'src/app/shared/pipes/time.pipe';
import { PaginatorComponent } from 'src/app/_metronic/shared/crud-table/components/paginator/paginator.component';
import { EmptyComponent } from 'src/app/shared/components/empty/empty.component';
import { CurrencyIconDirective } from 'src/app/shared/components/icon/icon.directive';
import { MatOptionModule } from '@angular/material/core';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { NgFor, NgIf, NgSwitch, NgSwitchCase } from '@angular/common';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { CurrencyItemComponent } from '../hot/currency-item/currency-item.component';

@Component({
  selector: 'encrypt',
  templateUrl: './encrypt.component.html',
  styleUrls: ['./encrypt.component.scss'],
  standalone: true,
  imports: [
    CurrencyItemComponent,
    AngularSvgIconModule,
    NgFor,
    FormRowComponent,
    MatFormFieldModule,
    MatSelectModule,
    FormsModule,
    MatOptionModule,
    NgIf,
    NgSwitch,
    NgSwitchCase,
    CurrencyIconDirective,
    EmptyComponent,
    PaginatorComponent,
    TimeFormatPipe,
    CurrencyValuePipe,
    LangPipe,
  ],
})
export class EncryptComponent implements OnInit {
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
  networkList: any[] = [];
  exchangeList: Exchange[] = [];
  currencyIndex = 0;
  balanceTotalOrigin: any = {};
  balanceTotal = { totalByUSDT: '', total: [] as Array<{ currency: string; balance: string }> };
  EMPTY_DATA = {
    network: '',
    coin: '',
    address: '',
    keyWord: '', // 用户ID
    isHiddenSmallBalance: false, // 是否隐藏小额
  };

  filterData = { ...this.EMPTY_DATA };

  /** getters */
  /** 当前统计币种余额的三个显示 */
  get balanceThree() {
    return this.balanceTotal.total.slice(this.currencyIndex * 3, this.currencyIndex * 3 + 3);
  }

  /** 获取USDT汇率 */
  get getUSDTRate() {
    return this.exchangeList.find((e) => e.currency === 'USDT')?.rate || 0;
  }

  /** 当前币种 */
  get currencyList() {
    return this.networkList.find((e) => e.network === this.filterData.network)?.children || [];
  }

  /** lifeCycle */
  ngOnInit(): void {
    this.list = [];
    this.paginator.total = 1;

    this.appService.isContentLoadingSubject.next(true);
    zip(this.api.getWalletPrimary(), this.loadData$(), this.getExchange$()).subscribe(([list]) => {
      this.appService.isContentLoadingSubject.next(false);

      this.paginator.total = this.list.length;
      this.networkList = list;
    });
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

    return this.api
      .getUserWallet({
        pageIndex: this.paginator.page,
        pageSize: this.paginator.pageSize,
        ...this.filterData,
      })
      .pipe(
        tap((res) => {
          this.currencyIndex = 0;
          this.list = res?.list || [];
          this.paginator.total = res?.count || 0;
          this.balanceTotalOrigin = res?.userWalletBalanceList || {};
          this.exchangeList.length && this.getBalanceTotal();
        })
      );
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
    this.balanceTotal = Object.keys(this.balanceTotalOrigin).reduce(
      (prev, currency) => {
        const balance = this.balanceTotalOrigin[currency];
        const totalUSD = this.exchangeComputer([{ coin: currency, balance }]).reduce((t, n) => {
          return new BigNumber(t).plus(n).toString();
        }, '0');

        const balanceByUSDT = new BigNumber(totalUSD).div(this.getUSDTRate).toString();
        prev.total.push({ balance, currency });
        prev.totalByUSDT = new BigNumber(balanceByUSDT).plus(prev.totalByUSDT || 0).toString();

        return prev;
      },
      { totalByUSDT: '', total: [] as Array<{ balance: string; currency: string }> }
    ) || { totalByUSDT: '', total: [] as Array<{ balance: string; currency: string }> };
  }

  exchangeComputer(tokens: Array<{ coin: string; balance: string }>) {
    return tokens.map((j) => {
      const rate = this.exchangeList.find((e) => e.currency === j.coin)?.rate || 0;

      !rate && this.appService.showToastSubject.next({ msgLang: 'walle.notRate', msgArgs: { coin: j.coin } });

      return new BigNumber(rate || 0).multipliedBy(j.balance || 0).toString();
    });
  }

  reset() {
    this.filterData = { ...this.EMPTY_DATA };

    this.loadData();
  }

  onFilter(type: string) {
    if (type === 'network') {
      this.filterData.coin = '';
      this.filterData.address = '';
    } else if (type === 'coin') {
      this.filterData.address = '';
    }

    this.loadData(true);
  }
}
