import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AppService } from 'src/app/app.service';
import { MemberApi } from 'src/app/shared/api/member.api';
import { takeUntil } from 'rxjs/operators';
import { Subject, zip } from 'rxjs';
import { PageSizes, PaginatorState } from 'src/app/_metronic/shared/crud-table';
import { SubHeaderService } from 'src/app/_metronic/partials/layout/subheader/subheader1/sub-header.service';
import { MemberService } from 'src/app/pages/member/member.service';
import moment from 'moment';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { CurrencyValuePipe } from 'src/app/shared/pipes/currency-value.pipe';
import { IntegerPipe } from 'src/app/shared/pipes/number.pipe';
import { PaginatorComponent } from 'src/app/_metronic/shared/crud-table/components/paginator/paginator.component';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { WinDirective, WinColorDirective } from 'src/app/shared/directive/common.directive';
import { ProgressTextDirective } from 'src/app/shared/components/progress/progress.directive';
import { ProgressComponent } from 'src/app/shared/components/progress/progress.component';
import { IconSrcDirective, CurrencyIconDirective } from 'src/app/shared/components/icon/icon.directive';
import { NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'overview-trade',
  templateUrl: './trade.component.html',
  styleUrls: ['./trade.component.scss'],
  standalone: true,
  imports: [
    NgFor,
    IconSrcDirective,
    CurrencyIconDirective,
    NgIf,
    ProgressComponent,
    ProgressTextDirective,
    WinDirective,
    WinColorDirective,
    AngularSvgIconModule,
    PaginatorComponent,
    IntegerPipe,
    CurrencyValuePipe,
    LangPipe,
  ],
})
export class TradeComponent implements OnInit, OnDestroy {
  constructor(
    public router: Router,
    private route: ActivatedRoute,
    private api: MemberApi,
    private appService: AppService,
    private subHeader: SubHeaderService,
    private memberService: MemberService
  ) {
    const { uid } = this.route.snapshot.queryParams;
    this.uid = uid;
  }

  private _destroy$: any = new Subject<void>();
  pageSizes: number[] = PageSizes; // 页大小
  paginator: PaginatorState = new PaginatorState(); // 分页

  grid: any[] = [
    { id: 1, title: 'To/Dep', color: '#31a0f7', suffix: 'x' },
    { id: 2, title: 'To/Bonus', color: '#7E4AEB', suffix: '%' },
    { id: 3, title: 'Active', color: '#DF506E', suffix: 'D' },
    { id: 4, titleMap: 'member.detail.houseEdge', color: '#F76C31', suffix: '%' },
    { id: 5, title: 'Avg Bet', color: '#77BE43', suffix: '' },
    { id: 6, title: 'Avg Dep', color: '#A031F7', suffix: '' },
    // { id: 7, title: 'Roi', color: '#EB4AE5', suffix: 'x' },
  ];

  isLoading = false;
  uid!: string;
  shTime: any = [];

  providerTop: any = {};
  allWalletList: any[] = [];
  ProviderStatList: any[] = [];

  ngOnInit(): void {
    this.subHeader.timeCurrent$
      .pipe(takeUntil(this._destroy$)) // 销毁时取消订阅
      .subscribe(() => {
        this.loadData();
      });

    this.memberService.userDetailsInfo.pipe(takeUntil(this._destroy$)).subscribe((stat) => {
      this.grid[0].value = stat?.toDep;
      // this.grid[1].value = stat?.toBon;
      this.grid[1].value = stat?.toRoi;
      this.grid[2].value = stat?.activeDay;
      this.grid[3].value = stat?.bankerAdvantage;
      this.grid[4].value = stat?.avgBet;
      this.grid[5].value = stat?.avgDep;
      // this.grid[6].value = stat?.toRoi;
    });
  }

  loadData() {
    // this.api.getUserTransactionoverview({ userId: this.id }).subscribe((res) => {
    //   this.loading(false);
    //   if (res) this.data = res;
    // });
    this.shTime = this.subHeader.curTime.length
      ? [moment(this.subHeader.curTime[0]).format('YYYY-MM-DD'), moment(this.subHeader.curTime[1]).format('YYYY-MM-DD')]
      : [];

    this.loading(true);
    zip(
      this.api.getMemberProviderTop({ uid: this.uid }), // 取消/胜率 警报； Arthur: 取消接口时间参数 beginTime: this.shTime[0], endTime: this.shTime[1]
      this.api.getMemberallWallet({ uid: this.uid }) // 会员所有钱包
    ).subscribe(([providerTop, allWallet]) => {
      this.loading(false);

      this.providerTop = providerTop || {};
      if (Array.isArray(allWallet)) {
        const res = new Map();
        this.allWalletList = allWallet.filter((item) => !res.has(item['currency']) && res.set(item['currency'], 1));
      }
    });

    this.paginator.pageSize = 7;
    this.getProviderStatList(true);
  }

  getProviderStatList(resetPage = false) {
    this.shTime = this.subHeader.curTime.length
      ? [moment(this.subHeader.curTime[0]).format('YYYY-MM-DD'), moment(this.subHeader.curTime[1]).format('YYYY-MM-DD')]
      : [];

    resetPage && (this.paginator.page = 1);
    this.loading(true);
    const params = {
      Uid: this.uid,
      BeginTime: this.shTime[0],
      EndTime: this.shTime[1],
      Page: this.paginator.page,
      PageSize: this.paginator.pageSize,
    };
    this.api.getMemberProviderStatList(params).subscribe((res) => {
      this.loading(false);
      if (res) {
        this.ProviderStatList = Array.isArray(res?.list) ? res?.list : [];
        this.paginator.total = res?.total || 0;
      }
    });
  }

  // 加载状态
  loading(v: boolean): void {
    this.isLoading = v;
    this.appService.isContentLoadingSubject.next(v);
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
