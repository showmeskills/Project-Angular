import { Component, OnDestroy, OnInit } from '@angular/core';
import { lastValueFrom, Subject } from 'rxjs';
import { AppService } from 'src/app/app.service';
import { ActivityAPI } from 'src/app/shared/api/activity.api';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { PageSizes, PaginatorState } from 'src/app/_metronic/shared/crud-table';
import { Clipboard } from '@angular/cdk/clipboard';
import { ActivatedRoute } from '@angular/router';
import { ExcelFormat, JSONToExcelDownload, timeFormat, toDateStamp } from 'src/app/shared/models/tools.model';
import { GetPrizeSendRecordListParams, PrizeSendRecord, PrizeTypeItem } from 'src/app/shared/interfaces/activity';
import { PrizeService } from 'src/app/pages/Bonus/prize.service';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { CurrencyValuePipe } from 'src/app/shared/pipes/currency-value.pipe';
import { TimeFormatPipe } from 'src/app/shared/pipes/time.pipe';
import { PaginatorComponent } from 'src/app/_metronic/shared/crud-table/components/paginator/paginator.component';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { LabelComponent } from 'src/app/shared/components/label/label.component';
import { CurrencyIconDirective } from 'src/app/shared/components/icon/icon.directive';
import { NgFor, NgIf, NgSwitch, NgSwitchCase, NgSwitchDefault } from '@angular/common';
import { OwlDateTimeComponent } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker.component';
import { OwlDateTimeTriggerDirective } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker-trigger.directive';
import { OwlDateTimeInputDirective } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker-input.directive';
import { FormsModule } from '@angular/forms';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { cloneDeep } from 'lodash';
import moment from 'moment';
import { PrizeConfigPipe } from 'src/app/pages/Bonus/bonus.service';
import { CurrencyService } from 'src/app/shared/service/currency.service';

@Component({
  selector: 'prize-manage-query',
  templateUrl: './query.component.html',
  styleUrls: ['./query.component.scss'],
  standalone: true,
  imports: [
    FormRowComponent,
    FormsModule,
    OwlDateTimeInputDirective,
    OwlDateTimeTriggerDirective,
    OwlDateTimeComponent,
    NgFor,
    NgIf,
    CurrencyIconDirective,
    NgSwitch,
    NgSwitchCase,
    LabelComponent,
    NgSwitchDefault,
    AngularSvgIconModule,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    PaginatorComponent,
    TimeFormatPipe,
    CurrencyValuePipe,
    LangPipe,
    PrizeConfigPipe,
  ],
  providers: [CurrencyValuePipe],
})
export class PrizeManageQueryComponent implements OnInit, OnDestroy {
  constructor(
    private appService: AppService,
    public lang: LangService,
    private clipboard: Clipboard,
    // public subHeaderService: SubHeaderService,
    // public router: Router,
    public prizeService: PrizeService,
    private activatedRoute: ActivatedRoute,
    private api: ActivityAPI,
    private currencyValuePipe: CurrencyValuePipe,
    private currencyService: CurrencyService
  ) {}

  _destroyed$: any = new Subject<void>(); // 订阅流

  pageSizes: number[] = PageSizes; // 页大小
  paginator: PaginatorState = new PaginatorState(); // 分页
  isLoading = false;

  prizeId: any;
  tenantId: any;

  dataEmpty = {
    title: '', // 名称
    uid: '',
    time: [] as Date[],
    order: '', // 排序字段
    isAsc: true, // 是否为升序排序
  };

  data = cloneDeep(this.dataEmpty);

  list: PrizeSendRecord[] = [];
  prizeTypeList: PrizeTypeItem[] = [];

  ngOnInit() {
    this.paginator.total = 100;
    this.activatedRoute.queryParams.pipe().subscribe((v: any) => {
      this.prizeId = v?.prizeId;
      this.tenantId = v?.tenantId;
      this.onReset();
      this.api.prize_getprizetypes(this.tenantId).subscribe((res) => {
        this.prizeTypeList = Array.isArray(res?.data) ? res.data : [];
      });
    });
  }

  loadData(resetPage = false) {
    if (this.isLoading) return;

    resetPage && (this.paginator.page = 1);
    this.loading(true);
    this.loadData$().subscribe((res) => {
      this.loading(false);
      if (res?.success) {
        this.list = res?.data?.sendDetail || [];
        this.paginator.total = res?.data?.totalCount || 0;
      }
    });
  }

  loadData$(sendData?: Partial<GetPrizeSendRecordListParams>) {
    return this.api.prize_getPrizeSendDetail({
      TenantId: this.tenantId,
      prizeId: this.prizeId,
      Name: this.data.title,
      UId: this.data.uid,
      PageIndex: this.paginator.page,
      PageSize: this.paginator.pageSize,
      StartTime: toDateStamp(this.data.time[0], false),
      EndTime: toDateStamp(this.data.time[1], true),
      ...(this.data.order
        ? {
            Sort: this.data.order,
            IsAsc: this.data.isAsc,
          }
        : {}),
      ...sendData,
    });
  }

  onReset() {
    this.data = cloneDeep(this.dataEmpty);
    this.loadData(true);
  }

  // 排序
  onSort(sortKey: any) {
    if (!this.list.length) return;

    if (!this.data.isAsc && this.data.order === sortKey) {
      this.data.order = '';
      this.data.isAsc = true;
      this.loadData(true);
      return;
    }

    if (!this.data.order || this.data.order !== sortKey) {
      this.data.order = sortKey;
      this.data.isAsc = false;
    }

    this.data.isAsc = !this.data.isAsc;
    this.loadData(true);
  }

  async onCopy(content: string) {
    if (!content) return;
    const successed = this.clipboard.copy(content);
    const copySuccess = await this.lang.getOne('common.copySuccess');
    const copyaFiled = await this.lang.getOne('common.copyaFiled');
    const msg = successed ? copySuccess : copyaFiled;
    this.appService.showToastSubject.next({ msg, successed });
  }

  // 加载状态
  loading(v: boolean): void {
    this.isLoading = v;
    this.appService.isContentLoadingSubject.next(v);
  }

  ngOnDestroy(): void {
    this._destroyed$.next();
    this._destroyed$.complete();
  }

  /**
   * 导出
   */
  async onExport(isAll: boolean) {
    let list: PrizeSendRecord[] = [];
    if (isAll) {
      const maxDay = 90;
      const thrErr = () =>
        this.appService.showToastSubject.next({ msgLang: 'form.chooseDayTime', msgArgs: { n: maxDay } });

      // 比较时间是否超过90
      if (!(this.data.time?.[0] && this.data.time?.[1])) return thrErr();

      const start = toDateStamp(this.data.time[0], false);
      const end = toDateStamp(this.data.time[1], true);
      if (Math.abs(moment(start).diff(end, 'days')) > maxDay) return thrErr();

      try {
        this.appService.isContentLoadingSubject.next(true);
        const res = await lastValueFrom(this.loadData$({ PageSize: 9e5 }));
        this.appService.isContentLoadingSubject.next(false);
        list = Array.isArray(res?.data?.sendDetail) ? res.data.sendDetail : []; // success === false会自动抛出
      } finally {
        this.appService.isContentLoadingSubject.next(false);
      }
    } else {
      list = this.list;
    }

    this.exportExcel(cloneDeep(list));
  }

  /**
   * 导出Excel
   * @param list
   */
  async exportExcel(list: PrizeSendRecord[]) {
    if (!list?.length) return;

    const getPrizeConfigFn = await this.prizeService.getPrizeConfigLang();

    const prizeName = await this.lang.getOne('luckRoulette.prize'); // 奖品
    const uid = 'UID'; // UID
    const prizeType = await this.lang.getOne('luckRoulette.drawRecord.prizeType'); // 奖品类型
    const config = await this.lang.getOne('system.merchants.config'); // 配置
    const amount = await this.lang.getOne('common.amount'); // 金额
    const sendType = await this.lang.getOne('member.activity.prizeCommon.distribution'); // 发放方式
    const activityTitle = await this.lang.getOne('member.giveOut.eventTitle'); // 活动标题
    const status = await this.lang.getOne('common.status'); // 状态
    const sendTime = await this.lang.getOne('member.giveOut.IssuanceTime'); // 发放时间
    const currency = await this.lang.getOne('common.currency'); // 币种

    // 发放方式
    const needClick = await this.lang.getOne('member.activity.prizeCommon.needToCollect'); // 需要领取
    const immediate = await this.lang.getOne('member.activity.prizeCommon.directIssue'); // 直接发放

    // 奖品状态
    const prizeStatus = {
      Unclaimed: await this.lang.getOne('member.giveOut.pendingCollection'), // 待领取
      Received: await this.lang.getOne('member.giveOut.received'), // 已领取
      Invalid: await this.lang.getOne('member.giveOut.expired'), // 已失效
      InUse: await this.lang.getOne('member.giveOut.Using'), // 使用中
      Used: await this.lang.getOne('member.giveOut.Used'), // 已使用
    };

    const exportList = list.map((e) => ({
      [prizeName]: e.prizeName || '-',
      [uid]: ExcelFormat.str(e.uid),
      [prizeType]: this.prizeService.getPrizeName(this.prizeTypeList, e.prizeType),
      [config]: getPrizeConfigFn(e),
      [amount]: e.amount,
      [currency]: e.currency,
      [amount + '（USDT）']: this.currencyService.getUsdtRateAmount(e?.currency, e?.amount),
      [sendType]: e.sendType === 1 ? needClick : immediate,
      [activityTitle]: e.activityName || '-',
      [status]: prizeStatus[e.cardStatus] || '-',
      [sendTime]: timeFormat(e.sendTime),
    }));

    JSONToExcelDownload(exportList, 'prize-record ' + Date.now());
  }
}
