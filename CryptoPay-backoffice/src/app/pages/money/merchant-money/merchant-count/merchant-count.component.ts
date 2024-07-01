import { Component, OnInit } from '@angular/core';
import { PaginatorState } from 'src/app/_metronic/shared/crud-table';
import { AppService } from 'src/app/app.service';
import { MoneyApi } from 'src/app/shared/api/money.api';
import { ActivatedRoute, Router } from '@angular/router';
import { MerchantMoneyCountItem } from 'src/app/shared/interfaces/merchants-interface';
import moment from 'moment';
import { LocalStorageService } from 'src/app/shared/service/localstorage.service';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { ReduceTotalPipe } from 'src/app/shared/pipes/big-number.pipe';
import { CurrencyValuePipe } from 'src/app/shared/pipes/currency-value.pipe';
import { PaginatorComponent } from 'src/app/_metronic/shared/crud-table/components/paginator/paginator.component';
import { EmptyComponent } from 'src/app/shared/components/empty/empty.component';
import { CurrencyIconDirective } from 'src/app/shared/components/icon/icon.directive';
import { NgIf, NgFor } from '@angular/common';
import { StickyDirective } from 'src/app/shared/directive/sticky.directive';

@Component({
  selector: 'merchant-count',
  templateUrl: './merchant-count.component.html',
  styleUrls: ['./merchant-count.component.scss'],
  standalone: true,
  imports: [
    StickyDirective,
    NgIf,
    NgFor,
    CurrencyIconDirective,
    EmptyComponent,
    PaginatorComponent,
    CurrencyValuePipe,
    ReduceTotalPipe,
    LangPipe,
  ],
})
export class MerchantCountComponent implements OnInit {
  constructor(
    private appService: AppService,
    private api: MoneyApi,
    private route: ActivatedRoute,
    private router: Router,
    public ls: LocalStorageService
  ) {
    const { merchantId = 0, currency = '' } = route.snapshot.params;

    this.merchantId = merchantId;
    this.currency = currency;
  }

  merchantId = 0;
  currency: string;
  list: MerchantMoneyCountItem[] = [];
  paginator: PaginatorState = new PaginatorState(3, 1); // 分页
  pageList: number[] = [
    +moment().subtract(2, 'month').endOf('month').startOf('day').format('x'),
    +moment().subtract(1, 'month').endOf('month').startOf('day').format('x'),
    +moment().endOf('month').startOf('day').format('x'),
  ];

  ngOnInit(): void {
    this.paginator.recalculatePaginator(3);
    this.loadData();
  }

  loadData(): void {
    this.appService.isContentLoadingSubject.next(true);
    this.api
      .merchantaccount_getaccountflowstat({
        merchantId: this.merchantId,
        currency: this.currency,
        currentTime: this.pageList[this.paginator.page - 1],
      })
      .subscribe((res) => {
        this.appService.isContentLoadingSubject.next(false);
        this.list = Array.isArray(res) ? res : [];

        Array.isArray(res) && (window.document.documentElement.scrollTop = 0);
      });
  }

  onDetail(item: MerchantMoneyCountItem) {
    this.router.navigate(['/money/merchant-money/', item.merchantId, item.currency, item.currentTime]);
  }
}
