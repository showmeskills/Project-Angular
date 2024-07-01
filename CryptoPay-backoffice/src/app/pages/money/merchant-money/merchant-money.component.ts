import { Component, ElementRef, OnInit } from '@angular/core';
import { PageSizes, PaginatorState } from 'src/app/_metronic/shared/crud-table';
import { AppService } from 'src/app/app.service';
import { MoneyApi } from 'src/app/shared/api/money.api';
import { SelectApi } from 'src/app/shared/api/select.api';
import { forkJoin, zip } from 'rxjs';
import { GoMoneyCurrency } from 'src/app/shared/interfaces/common.interface';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { LayoutService } from 'src/app/_metronic/core';
import { LocalStorageService } from 'src/app/shared/service/localstorage.service';
import { ExchangeService } from 'src/app/shared/service/exchange.service';
import { GoMoneyMerchant } from 'src/app/shared/interfaces/select.interface';
import { ReduceExchangeTotalPipe } from 'src/app/shared/service/exchange.service';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { CurrencyValuePipe } from 'src/app/shared/pipes/currency-value.pipe';
import { PaginatorComponent } from 'src/app/_metronic/shared/crud-table/components/paginator/paginator.component';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { CurrencyIconDirective } from 'src/app/shared/components/icon/icon.directive';
import { StickyDirective } from 'src/app/shared/directive/sticky.directive';
import { MatOptionModule } from '@angular/material/core';
import { NgFor, NgIf, AsyncPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';

@Component({
  selector: 'merchant-money',
  templateUrl: './merchant-money.component.html',
  styleUrls: ['./merchant-money.component.scss'],
  standalone: true,
  imports: [
    FormRowComponent,
    MatFormFieldModule,
    MatSelectModule,
    FormsModule,
    NgFor,
    MatOptionModule,
    StickyDirective,
    NgIf,
    CurrencyIconDirective,
    AngularSvgIconModule,
    PaginatorComponent,
    AsyncPipe,
    CurrencyValuePipe,
    LangPipe,
    ReduceExchangeTotalPipe,
  ],
})
export class MerchantMoneyComponent implements OnInit {
  constructor(
    public appService: AppService,
    private api: MoneyApi,
    private selectApi: SelectApi,
    private router: Router,
    public host: ElementRef,
    public layout: LayoutService,
    public ls: LocalStorageService,
    private exchangeService: ExchangeService
  ) {}

  pageSizes: number[] = PageSizes; // 页大小
  paginator: PaginatorState = new PaginatorState(); // 分页
  list: any[] = [];
  data = {
    merchant: 0,
    currency: '',
  };

  EMPTY_DATA = { ...this.data };

  merchantList: GoMoneyMerchant[] = [];
  currencyList: GoMoneyCurrency[] = [];

  /** getters */
  get listFlat() {
    return this.list.reduce((acc, cur) => {
      return [...acc, ...cur.currencies];
    }, []);
  }

  /** lifeCycle */
  ngOnInit(): void {
    this.appService.isContentLoadingSubject.next(true);
    zip(this.selectApi.goMoneyGetMerchant(true), this.selectApi.goMoneyGetCurrencies(true), this.loadData$()).subscribe(
      ([merchant, currency]) => {
        this.appService.isContentLoadingSubject.next(false);
        this.merchantList = merchant;
        this.currencyList = currency;
      }
    );
  }

  /** methods */
  onView(item: any, child: any) {
    this.router.navigate(['/money/merchant-money/count', item.merchantId, child.currency]);
  }

  reset() {
    this.data = { ...this.EMPTY_DATA };
    this.loadData(true);
  }

  loadData(resetPage = false) {
    resetPage && (this.paginator.page = 1);

    this.appService.isContentLoadingSubject.next(true);
    this.loadData$().subscribe(() => this.appService.isContentLoadingSubject.next(false));
  }

  loadData$() {
    return forkJoin([
      this.api.getMerchantStat({
        MerchantId: this.data.merchant,
        Currency: this.data.currency,
        ...this.paginator,
      }),
      this.exchangeService.flushExchange$(), // 保持汇率最新
    ]).pipe(
      tap(([res]) => {
        this.list = res?.list || [];
        this.paginator.total = res?.total || 0;
      })
    );
  }
}
