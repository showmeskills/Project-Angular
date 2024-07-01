import { Component, OnDestroy, OnInit } from '@angular/core';
import { PageSizes, PaginatorState } from 'src/app/_metronic/shared/crud-table';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE, MatOptionModule } from '@angular/material/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDatepicker, MatDatepickerModule } from '@angular/material/datepicker';

import _moment from 'moment';
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { Moment } from 'moment/moment';
import { Router, NavigationEnd } from '@angular/router';
import { AgentApi } from 'src/app/shared/api/agent.api';
import { AppService } from 'src/app/app.service';
import { ProxyService } from 'src/app/pages/proxy/proxy.service';
import { takeUntil, filter } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { CurrencyValuePipe } from 'src/app/shared/pipes/currency-value.pipe';
import { FormatMoneyPipe } from 'src/app/shared/pipes/big-number.pipe';
import { PaginatorComponent } from 'src/app/_metronic/shared/crud-table/components/paginator/paginator.component';
import { EmptyComponent } from 'src/app/shared/components/empty/empty.component';
import {
  SelectChildrenDirective,
  SelectTplDirective,
  SelectGroupDirective,
  SelectDirective,
} from 'src/app/shared/directive/select.directive';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { MatInputModule } from '@angular/material/input';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { NavHeaderComponent } from '../nav-header/nav-header.component';

// See the Moment.js docs for the meaning of these formats:
// https://momentjs.com/docs/#/displaying/format/
export const MY_FORMATS = {
  parse: {
    dateInput: 'MM/YYYY',
  },
  display: {
    dateInput: 'YYYY-MM',
    monthYearLabel: 'YYYY MMM',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'YYYY MMMM',
  },
};

@Component({
  selector: 'proxy-list',
  templateUrl: './commission-list.component.html',
  styleUrls: ['./commission-list.component.scss'],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
    },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
    { provide: MAT_DATE_LOCALE, useValue: 'zh-CN' },
  ],
  standalone: true,
  imports: [
    NavHeaderComponent,
    MatFormFieldModule,
    MatSelectModule,
    FormsModule,
    NgFor,
    MatOptionModule,
    FormRowComponent,
    MatInputModule,
    MatDatepickerModule,
    ReactiveFormsModule,
    AngularSvgIconModule,
    SelectChildrenDirective,
    SelectTplDirective,
    NgIf,
    SelectGroupDirective,
    SelectDirective,
    EmptyComponent,
    PaginatorComponent,
    FormatMoneyPipe,
    CurrencyValuePipe,
    LangPipe,
    AsyncPipe,
  ],
})
export class CommissionListComponent implements OnInit, OnDestroy {
  constructor(
    public router: Router,
    private api: AgentApi,
    public appService: AppService,
    public proxyService: ProxyService,
    public lang: LangService
  ) {}

  pageSizes: number[] = PageSizes; // 页大小
  paginator: PaginatorState = new PaginatorState(); // 分页
  list: any[] = [];
  detail: any = {};
  data: any = {};
  curReview = 0;
  defaultData = {
    team: '',
    manager: '',
    proxyId: '',
  };

  isLoading = false;
  private _destroy$ = new Subject<void>();
  typeList = [
    { label: 'marketing.pendingList.expiredCoup', value: 0 },
    { label: 'marketing.commissionList.apprChanneManager', value: 1 },
    { label: 'marketing.commissionList.apprByGeneraManager', value: 2 },
    { label: 'marketing.commissionList.auditNotPassed', value: -1 },
  ];

  /** getters */
  // 获取选中类目
  get checkItems(): any[] {
    return this.list.filter((e) => e.checked);
  }

  /** lifeCycle */
  ngOnInit(): void {
    /**
     * 页面被释放缓存后，ngOnInit不会被执行
     * 1. 在路由器事件中完成列表数据的更新。
     * 2. 必须是匹配‘编辑’路由返回才进行列表的初始化，避免在未缓存时切换路由造成二次请求。
     */
    this.router.events
      .pipe(
        filter((e) => e instanceof NavigationEnd),
        takeUntil(this._destroy$)
      )
      .subscribe(() => {
        if (['commission/:id', 'commission/bill/:id'].includes(this.router.routeReuseStrategy['curr'])) {
          this.loadData();
        }
      });

    this.proxyService.value$.pipe(takeUntil(this._destroy$)).subscribe(() => this.onReset());
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  /** methods */
  onReset(): void {
    this.data = { ...this.defaultData };
    this.date.patchValue(undefined);
    this.loadData(true);
  }

  // 获取数据
  loadData(resetPage = false) {
    resetPage && (this.paginator.page = 1);

    if (!this.proxyService.curTeamId) {
      this.list = [];
      this.paginator.total = 0;

      return;
    }

    this.appService.isContentLoadingSubject.next(true);
    this.api
      .auditList({
        ...this.data,
        current: this.paginator.page,
        size: this.paginator.pageSize,
        state: this.curReview,
        tenantId: this.proxyService.curTenantId,
        team: this.proxyService.curTeamId,
        monthDate: this.date.value ? this.date.value.valueOf() : undefined,
      })
      .subscribe((res) => {
        this.appService.isContentLoadingSubject.next(false);
        this.detail = res?.data;
        this.list = this.detail?.records || [];
        this.paginator.total = this.detail?.total || 0;
      });
  }

  date = new FormControl();
  selYear = false;

  // 日期关闭
  onDPClose(): void {
    this.selYear && this.date.setValue(undefined);
    this.selYear = false;
  }

  // 年份选择回调
  chosenYearHandler(normalizedYear: Moment) {
    this.selYear = true;
    const ctrlValue = this.date.value;

    this.date.setValue(ctrlValue instanceof _moment ? ctrlValue?.['year'](normalizedYear.year()) : normalizedYear);
  }

  // 月份选择回调
  chosenMonthHandler(normalizedMonth: Moment, datepicker: any | MatDatepicker<Moment>) {
    this.selYear = false;
    datepicker.close();

    const ctrlValue = this.date.value;
    let month = ctrlValue instanceof _moment ? ctrlValue?.['month'](normalizedMonth.month()) : normalizedMonth;

    month = month.date(1).set({ hour: 0, minute: 0, second: 0, millisecond: 0 });

    this.date.setValue(month);
    this.loadData(true);
  }

  // 审核 批准
  onReviewPass(isPass: boolean): void {
    // 请勾选要操作的代理
    if (!this.checkItems.length)
      return this.appService.showToastSubject.next({
        msg: 'marketing.commissionList.tickOperate',
      });

    // 佣金审核  ：
    //   待审核               可选择  拒绝（-1），通过（1）
    //   渠道经理审核通过     可选择  拒绝（-1），通过（2）
    const passValue = this.curReview === 0 ? 1 : 2;

    this.appService.isContentLoadingSubject.next(true);
    this.api
      .auditcommission_audit(
        this.checkItems.map((e) => ({
          monthId: e.id,
          auditStatus: isPass ? passValue : -1, // 拒绝（-1）
        }))
      )
      .subscribe((res) => {
        this.appService.isContentLoadingSubject.next(false);

        if (res.data === true) {
          this.loadData();
          this.appService.showToastSubject.next({
            msgLang: 'marketing.pendingList.sucOperation',
            successed: true,
          });
        } else {
          this.appService.showToastSubject.next({
            msgLang: 'marketing.pendingList.operationFailed',
            successed: false,
          });
        }
      });
  }

  /** 跳转佣金审核详情 */
  onDetail(id) {
    // this.router.navigate(['/proxy/commission', id]);
    this.router.navigate(['/proxy/commission', id]);
  }
}
