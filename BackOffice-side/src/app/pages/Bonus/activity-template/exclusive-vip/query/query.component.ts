import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { Router, ActivatedRoute } from '@angular/router';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { cloneDeep } from 'lodash';
import { lastValueFrom, zip } from 'rxjs';
import { AppService } from 'src/app/app.service';
import { OwlDateTimeModule } from 'src/app/components/datetime-picker';
import { ActivityAPI } from 'src/app/shared/api/activity.api';
import { EmptyComponent } from 'src/app/shared/components/empty/empty.component';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { CurrencyIconDirective, IconSrcDirective } from 'src/app/shared/components/icon/icon.directive';
import { LabelComponent } from 'src/app/shared/components/label/label.component';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { TableSortComponent } from 'src/app/shared/components/table-sort/table-sort.component';
import { InputNumberDirective, InputFloatDirective } from 'src/app/shared/directive/input.directive';
import { BonusReleaseRecordItem, PrizeType, PrizeTypeItem } from 'src/app/shared/interfaces/activity';
import { ExcelFormat, JSONToExcelDownload, toDateStamp, timeFormat } from 'src/app/shared/models/tools.model';
import { FormatMoneyPipe } from 'src/app/shared/pipes/big-number.pipe';
import { TimeFormatPipe } from 'src/app/shared/pipes/time.pipe';
import { PageSizes, PaginatorState } from 'src/app/_metronic/shared/crud-table';
import { PaginatorComponent } from 'src/app/_metronic/shared/crud-table/components/paginator/paginator.component';
import { PrizeService } from 'src/app/pages/Bonus/prize.service';
import { FormWrapComponent } from 'src/app/shared/components/form-row/form-wrap.component';
import { PrizeConfigPipe } from 'src/app/pages/Bonus/bonus.service';
import moment from 'moment';
import { Tabs } from 'src/app/shared/interfaces/base.interface';
import { CurrencyValuePipe } from 'src/app/shared/pipes/currency-value.pipe';
import { CurrencyService } from 'src/app/shared/service/currency.service';
import { VoucherStatus } from 'src/app/shared/interfaces/bonus';

@Component({
  selector: 'exclusive-vip-query',
  templateUrl: './query.component.html',
  styleUrls: ['./query.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormRowComponent,
    MatFormFieldModule,
    MatSelectModule,
    FormsModule,
    FormWrapComponent,
    MatOptionModule,
    PaginatorComponent,
    TimeFormatPipe,
    FormatMoneyPipe,
    LangPipe,
    OwlDateTimeModule,
    EmptyComponent,
    AngularSvgIconModule,
    LabelComponent,
    IconSrcDirective,
    TableSortComponent,
    InputNumberDirective,
    InputFloatDirective,
    PrizeConfigPipe,
    CurrencyIconDirective,
    CurrencyValuePipe,
  ],
})
export class ExclusiveVipQueryComponent implements OnInit {
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
    this.tmpId = +id;

    const { tenantId } = route.snapshot.queryParams;
    this.tenantId = tenantId;
  }

  protected readonly VoucherStatus = VoucherStatus;
  protected readonly PrizeType = PrizeType;

  /** 活动模板ID */
  tmpId;

  /** 商户ID */
  tenantId;

  /** 页大小 */
  pageSizes: number[] = PageSizes;

  /** 分页 */
  paginator: PaginatorState = new PaginatorState();

  /** 奖品类型 */
  prizeTypeList: PrizeTypeItem[] = [];

  /** 筛选 - 状态列表 */
  statusList: Tabs[] = [
    { name: '送审失败', lang: 'member.coupon.toReviewFail', value: VoucherStatus.ReviewFail },
    { name: '审核中', lang: 'member.kyc.underReview', value: VoucherStatus.Reviewing },
    { name: '审核拒绝', lang: 'member.kyc.declined', value: VoucherStatus.ReviewReject },
    { name: '发放失败', lang: 'member.giveOut.failedissue', value: VoucherStatus.IssueFail },
    { name: '待领取', lang: 'member.giveOut.pendingCollection', value: VoucherStatus.Unclaimed },
    { name: '已领取', lang: 'member.giveOut.received', value: VoucherStatus.Received },
    { name: '使用中', lang: 'member.giveOut.Using', value: VoucherStatus.InUse },
    { name: '已使用', lang: 'member.giveOut.Used', value: VoucherStatus.Used },
    { name: '已失效', lang: 'member.giveOut.expired', value: VoucherStatus.Invalid },
  ];

  dataEmpty = {
    uid: '', // UID
    issuer: '', // 发放人
    time: [] as Date[], // 发放时间
    status: '', // 状态
  };

  data = cloneDeep(this.dataEmpty);

  /** 列表数据 */
  list: BonusReleaseRecordItem[] = [];

  ngOnInit() {
    this.appService.isContentLoadingSubject.next(true);
    zip(this.api.prize_getprizetypes(this.tenantId)).subscribe(([prizeType]) => {
      this.appService.isContentLoadingSubject.next(false);
      this.prizeTypeList = [...(prizeType?.data || [])];

      this.loadData(true);
    });
  }

  loadData(resetPage = false) {
    resetPage && (this.paginator.page = 1);
    this.appService.isContentLoadingSubject.next(true);
    this.loadData$().subscribe((res) => {
      this.appService.isContentLoadingSubject.next(false);

      this.list = res?.data?.records || [];
      this.paginator.total = res?.data?.total || 0;
    });
  }

  loadData$(sendData?) {
    const parmas = {
      tenantId: this.tenantId,
      tmpId: this.tmpId,
      uid: this.data.uid,
      createBy: this.data.issuer,
      releaseStatus: this.data.status,
      createTimeStart: toDateStamp(this.data.time[0], false, true) || undefined,
      createTimeEnd: toDateStamp(this.data.time[1], true, true) || undefined,
      pageIndex: this.paginator.page,
      pageSize: this.paginator.pageSize,
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

  /**
   * 导出
   */
  async onExport(isAll: boolean) {
    let list: BonusReleaseRecordItem[] = [];
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
        list = Array.isArray(res?.data?.records) ? res?.data?.records : [];
        this.list = list;
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
  async exportExcel(list: BonusReleaseRecordItem[]) {
    if (!list.length) return this.appService.showToastSubject.next({ msgLang: 'common.emptyText' });

    const getPrizeConfigFn = await this.prizeService.getPrizeConfigLang();

    const activityTitle = await this.lang.getOne('member.giveOut.eventTitle'); // 活动标题
    const uid = 'UID'; // UID
    const prizeName = await this.lang.getOne('luckRoulette.prize'); // 奖品
    const prizeType = await this.lang.getOne('luckRoulette.drawRecord.prizeType'); // 奖品类型
    const config = await this.lang.getOne('system.merchants.config'); // 配置
    const amount = await this.lang.getOne('common.amount'); // 金额
    const currency = await this.lang.getOne('common.currency'); // 币种
    const issuer = await this.lang.getOne('member.activity.sencli16.issuer'); // 发放人员
    const sendTime = await this.lang.getOne('member.giveOut.IssuanceTime'); // 发放时间
    // const status = await this.lang.getOne('common.status'); // 状态

    // const statusLang = {
    //   [VoucherStatus.ReviewFail]: await this.lang.getOne('member.coupon.toReviewFail'), // 送审失败
    //   [VoucherStatus.Reviewing]: await this.lang.getOne('member.kyc.underReview'), // 审核中
    //   [VoucherStatus.ReviewReject]: await this.lang.getOne('member.kyc.declined'), // 审核拒绝
    //   [VoucherStatus.IssueFail]: await this.lang.getOne('member.giveOut.failedissue'), // 发放失败
    //   [VoucherStatus.Unclaimed]: await this.lang.getOne('member.giveOut.pendingCollection'), // 待领取
    //   [VoucherStatus.Received]: await this.lang.getOne('member.giveOut.received'), // 已领取
    //   [VoucherStatus.InUse]: await this.lang.getOne('member.giveOut.Using'), // 使用中
    //   [VoucherStatus.Used]: await this.lang.getOne('member.giveOut.Used'), // 已使用
    //   [VoucherStatus.Invalid]: await this.lang.getOne('member.giveOut.expired'), // 已失效
    // };

    const exportList = list.map((e) => ({
      [activityTitle]: e?.activityName || '-',
      [uid]: ExcelFormat.str(e.uid),
      [prizeName]: this.getPrizeName(e?.prizeDetail?.prizeName),
      [prizeType]: this.prizeService.getPrizeName(this.prizeTypeList, e?.prizeDetail?.prizeType),
      [config]: getPrizeConfigFn(e?.prizeDetail),
      [amount]: e.money,
      [currency]: e.moneyType,
      [amount + '（USDT）']: this.currencyService.getUsdtRateAmount(e?.moneyType, e?.money),
      [issuer]: e.createBy || '-',
      [sendTime]: timeFormat(e.createTime),
      // [status]: statusLang[e.releaseStatus],
    }));

    JSONToExcelDownload(exportList, 'exclusive-vip-record ' + Date.now());
  }
}
