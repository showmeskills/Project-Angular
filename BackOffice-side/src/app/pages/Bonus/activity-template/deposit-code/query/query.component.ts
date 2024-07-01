import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { cloneDeep } from 'lodash';
import { AppService } from 'src/app/app.service';
import { ActivityAPI } from 'src/app/shared/api/activity.api';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { ExcelFormat, JSONToExcelDownload, timeUTCFormat, toDateStamp } from 'src/app/shared/models/tools.model';
import { PageSizes, PaginatorState } from 'src/app/_metronic/shared/crud-table';
import { lastValueFrom, zip } from 'rxjs';
import moment from 'moment';
import { PrizeSendRecord, PrizeType, PrizeTypeItem } from 'src/app/shared/interfaces/activity';
import { PrizeService } from 'src/app/pages/Bonus/prize.service';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { TimeFormatPipe, TimeUTCFormatPipe } from 'src/app/shared/pipes/time.pipe';
import { CurrencyValuePipe } from 'src/app/shared/pipes/currency-value.pipe';
import { FormatMoneyPipe } from 'src/app/shared/pipes/big-number.pipe';
import { PaginatorComponent } from 'src/app/_metronic/shared/crud-table/components/paginator/paginator.component';
import { EmptyComponent } from 'src/app/shared/components/empty/empty.component';
import { CurrencyIconDirective } from 'src/app/shared/components/icon/icon.directive';
import { MatOptionModule } from '@angular/material/core';
import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { OwlDateTimeComponent } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker.component';
import { OwlDateTimeTriggerDirective } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker-trigger.directive';
import { FormsModule } from '@angular/forms';
import { OwlDateTimeInputDirective } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker-input.directive';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { PrizeConfigPipe } from 'src/app/pages/Bonus/bonus.service';
import { CurrencyService } from 'src/app/shared/service/currency.service';

@Component({
  selector: 'app-deposit-query',
  templateUrl: './query.component.html',
  styleUrls: ['./query.component.scss'],
  standalone: true,
  imports: [
    FormRowComponent,
    OwlDateTimeInputDirective,
    FormsModule,
    OwlDateTimeTriggerDirective,
    OwlDateTimeComponent,
    MatFormFieldModule,
    MatSelectModule,
    NgFor,
    MatOptionModule,
    NgIf,
    CurrencyIconDirective,
    EmptyComponent,
    PaginatorComponent,
    FormatMoneyPipe,
    CurrencyValuePipe,
    TimeUTCFormatPipe,
    LangPipe,
    AngularSvgIconModule,
    TimeFormatPipe,
    PrizeConfigPipe,
    AsyncPipe,
  ],
})
export class DepositCodeQueryComponent implements OnInit {
  constructor(
    public appService: AppService,
    public lang: LangService,
    public router: Router,
    private route: ActivatedRoute,
    private api: ActivityAPI,
    public prizeService: PrizeService,
    private currencyService: CurrencyService
  ) {
    const { id } = route.snapshot.params;
    this.tmpId = +id || 0;

    const { tenantId } = route.snapshot.queryParams;
    this.merchantId = tenantId;
  }

  protected readonly PrizeType = PrizeType;

  tmpId;
  merchantId;
  pageSizes: number[] = [...PageSizes]; // 页大小
  paginator: PaginatorState = new PaginatorState(); // 分页
  isLoading = false;

  /** 奖品类型 */
  prizeTypeList: PrizeTypeItem[] = [];

  dataEmpty = {
    time: [],
    uid: '',
    prizeType: 0, // 类型
  };

  data = cloneDeep(this.dataEmpty);

  /** 列表 */
  list: any[] = [];

  ngOnInit() {
    this.loading(true);
    zip(this.api.prize_getprizetypes(this.merchantId)).subscribe(([prizeType]) => {
      this.loading(false);
      this.prizeTypeList = [...(prizeType?.data || [])];

      this.loadData(true);
    });
  }

  loadData(resetPage = false) {
    resetPage && (this.paginator.page = 1);
    this.loading(true);
    this.loadData$().subscribe((res) => {
      this.loading(false);

      this.list = res?.data?.records || [];
      this.paginator.total = res?.data?.total || 0;
    });
  }

  loadData$(sendData?: any) {
    const parmas = {
      TenantId: this.merchantId,
      TmpId: this.tmpId,
      UID: this.data.uid,
      ReleaseType: this.data.prizeType === 0 ? '' : this.data.prizeType,
      CreateTimeStart: toDateStamp(this.data.time[0], false, true) || undefined,
      CreateTimeEnd: toDateStamp(this.data.time[1], true, true) || undefined,
      PageIndex: this.paginator.page,
      PageSize: this.paginator.pageSize,
      ...sendData,
    };
    return this.api.getOldBonusReleaseRecordList(parmas);
  }

  getPrizeName(prizeName: any[]) {
    if (Array.isArray(prizeName)) {
      const multi = this.lang.isLocal ? 'zh-cn' : 'en-us';
      return (
        prizeName.find((v) => v.lang === multi)?.prizeFullName ||
        prizeName.find((v) => v.lang === 'zh-cn')?.prizeFullName ||
        '-'
      );
    }
    return '-';
  }

  onReset() {
    this.data = cloneDeep(this.dataEmpty);
    this.loadData(true);
  }

  // 加载状态
  loading(v: boolean): void {
    this.isLoading = v;
    this.appService.isContentLoadingSubject.next(v);
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
        list = Array.isArray(res?.data?.records) ? res?.data?.records : []; // success === false会自动抛出
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
  async exportExcel(list: any[]) {
    if (!list?.length) return;

    const getPrizeConfigFn = await this.prizeService.getPrizeConfigLang();

    const activityTitle = await this.lang.getOne('member.giveOut.eventTitle'); // 活动标题
    const uid = 'UID'; // UID
    const prizeName = await this.lang.getOne('luckRoulette.prize'); // 奖品
    const prizeType = await this.lang.getOne('luckRoulette.drawRecord.prizeType'); // 奖品类型
    const config = await this.lang.getOne('system.merchants.config'); // 配置
    const count = await this.lang.getOne('member.activity.sencli2.numberRewards'); // 奖励次数
    const amount = await this.lang.getOne('common.amount'); // 金额
    const currency = await this.lang.getOne('common.currency'); // 币种
    const sendTime = await this.lang.getOne('member.giveOut.IssuanceTime'); // 发放时间

    const exportList = list.map((e) => ({
      [activityTitle]: e.activityName || '-',
      [uid]: ExcelFormat.str(e.uid),
      [prizeName]: this.getPrizeName(e?.prizeDetail?.prizeName),
      [prizeType]: this.prizeService.getPrizeName(this.prizeTypeList, e?.prizeDetail?.prizeType),
      [config]: getPrizeConfigFn(e?.prizeDetail),
      [count]: e.orderNum || '-',
      [amount]: e?.money,
      [currency]: e?.moneyType || '-',
      [amount + '（USDT）']: this.currencyService.getUsdtRateAmount(e?.moneyType, e?.money),
      [sendTime]: timeUTCFormat(e.createTime),
    }));

    JSONToExcelDownload(exportList, 'deposit-code-prize-record ' + Date.now());
  }
}
