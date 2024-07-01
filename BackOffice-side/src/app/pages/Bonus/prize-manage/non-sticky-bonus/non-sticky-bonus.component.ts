import { Component, OnDestroy, OnInit } from '@angular/core';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { PageSizes, PaginatorState } from 'src/app/_metronic/shared/crud-table';
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
import { ActivityAPI } from 'src/app/shared/api/activity.api';
import { ActivatedRoute, Router } from '@angular/router';
import { Clipboard } from '@angular/cdk/clipboard';
import { AppService } from 'src/app/app.service';
import { BreadcrumbsService } from 'src/app/_metronic/partials/layout/subheader/subheader1/breadcrumbs.service';
import { ExcelFormat, JSONToExcelDownload, timeFormat, toDateStamp } from 'src/app/shared/models/tools.model';
import { NonStickySendDetaiItem, NonStickySendDetaiRecord } from 'src/app/shared/interfaces/activity';
import { lastValueFrom } from 'rxjs';
import moment from 'moment';
import { CurrencyService } from 'src/app/shared/service/currency.service';

interface QueryParams {
  prizeId?: string;
  tenantId?: string;
  type?: string;
  tmpCode?: string;
}
@Component({
  selector: 'app-non-sticky-bonus',
  templateUrl: './non-sticky-bonus.component.html',
  styleUrls: ['./non-sticky-bonus.component.scss'],
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
  ],
  providers: [CurrencyValuePipe],
})
export class NonStickyBonusComponent implements OnInit, OnDestroy {
  constructor(
    public lang: LangService,
    private api: ActivityAPI,
    private activatedRoute: ActivatedRoute,
    private clipboard: Clipboard,
    private appService: AppService,
    private breadcrumbsService: BreadcrumbsService,
    public router: Router,
    private currencyService: CurrencyService
  ) {}

  pageSizes: number[] = PageSizes; // 页大小
  paginator: PaginatorState = new PaginatorState(); // 分页
  isLoading = false;

  dataEmpty = {
    title: '', // 名称
    uid: '',
    time: [] as Date[],
    order: '', // 排序字段
    isAsc: true, // 是否为升序排序
  };

  id;
  tenantId;
  tmpCode;
  data = cloneDeep(this.dataEmpty);
  //'member.detail.nonsticky.roi',
  bonusList = [
    'member.detail.nonsticky.players',
    'member.detail.nonsticky.totalDeposit',
    'member.detail.nonsticky.lostReward',
  ];

  list: NonStickySendDetaiItem;

  ngOnInit() {
    this.activatedRoute.queryParams.pipe().subscribe((v: QueryParams) => {
      // if (v.type === 'prize') {
      //   this.breadcrumbsService.setBefore([
      //     {
      //       name: '奖品管理',
      //       lang: 'breadCrumb.prizeManage',
      //       click: () => this.router.navigate(['/bonus/prize-manage']),
      //     },
      //   ]);
      // } else {
      //   this.breadcrumbsService.setBefore([
      //     {
      //       name: '优惠券管理',
      //       lang: 'nav.couponManagement',
      //       click: () => this.router.navigate(['/bonus/coupon-manage']),
      //     },
      //   ]);
      // }
      this.id = v?.prizeId;
      this.tenantId = v?.tenantId;
      this.tmpCode = v?.tmpCode;
      this.onReset();
    });
  }

  onReset() {
    this.data = cloneDeep(this.dataEmpty);
    this.loadData(true);
  }

  onSort() {}

  ngOnDestroy() {}
  async onCopy(content: string) {
    if (!content) return;
    const successed = this.clipboard.copy(content);
    const copySuccess = await this.lang.getOne('common.copySuccess');
    const copyaFiled = await this.lang.getOne('common.copyaFiled');
    const msg = successed ? copySuccess : copyaFiled;
    this.appService.showToastSubject.next({ msg, successed });
  }

  loadData(resetPage = false) {
    if (this.isLoading) return;

    resetPage && (this.paginator.page = 1);
    this.loading(true);
    this.loadData$().subscribe((res) => {
      this.loading(false);
      if (res) {
        this.list = res;
        this.paginator.total = res?.total || 0;
      }
    });
  }

  loadData$(params?) {
    return this.api.prize_getNonStickyPrizeSendDetail({
      TenantId: this.tenantId,
      Name: this.data.title,
      UId: this.data.uid,
      PageIndex: this.paginator.page,
      PageSize: this.paginator.pageSize,
      StartTime: toDateStamp(this.data.time[0], false),
      EndTime: toDateStamp(this.data.time[1], true),
      PrizeId: this.id,
      TmpCode: this.tmpCode ? this.tmpCode : '',
      // TmpCode: '5W848WP6',
      // ...(this.data.order
      //   ? {
      //       Sort: this.data.order,
      //       IsAsc: this.data.isAsc,
      //     }
      //   : {}),
      ...params,
    });
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
    let list: NonStickySendDetaiRecord[] = [];
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
        list = Array.isArray(res?.list) ? res.list : []; // success === false会自动抛出
      } finally {
        this.appService.isContentLoadingSubject.next(false);
      }
    } else {
      list = this.list?.list;
    }
    this.exportExcel(cloneDeep(list));
  }

  /**
   * 导出Excel
   * @param list
   */
  async exportExcel(list) {
    if (!list?.length) return;
    const prizeName = await this.lang.getOne('member.detail.nonsticky.prizeName'); // 奖品名称
    const uid = 'UID'; // UID
    const prizeType = await this.lang.getOne('luckRoulette.drawRecord.prizeType'); // 奖品类型
    const eventName = await this.lang.getOne('member.activity.sencliCommon.eventName'); // 活动名称
    const amount = await this.lang.getOne('common.amount'); // 金额
    const status = await this.lang.getOne('common.status'); // 状态
    const sendTime = await this.lang.getOne('member.giveOut.IssuanceTime'); // 发放时间
    const duration = await this.lang.getOne('member.detail.nonsticky.duration'); // 持续时间
    const depositAmount = await this.lang.getOne('member.detail.nonsticky.depositAmount'); // 存款金额
    const lbf = await this.lang.getOne('member.detail.nonsticky.lbf'); // 是否损失奖金资金
    const wp = await this.lang.getOne('member.detail.nonsticky.wp'); // 已投注进度
    const bta = await this.lang.getOne('member.detail.nonsticky.bta'); // 奖金流水金额
    const nextCount = await this.lang.getOne('member.detail.nonsticky.nextCount'); // 下次次数/投注要求次数
    const currency = await this.lang.getOne('common.currency'); // 币种
    const day = await this.lang.getOne('common.day'); // 币种
    const yes = await this.lang.getOne('common.yes'); // 是
    const no = await this.lang.getOne('common.no'); // 否;

    const exportList = list.map((e) => ({
      [prizeName]: e.prizeName || '-',
      [uid]: ExcelFormat.str(e.uid),
      [prizeType]: e.prizeTypeDesc || '-',
      [eventName]: e.activityName || '-',
      [amount]: `${e.amount}`,
      [amount + '（USDT）']: this.currencyService.getUsdtRateAmount(e?.currency, e?.amount),
      [status]: e.statusDesc || '-',
      [sendTime]: timeFormat(e.sendTime),
      [duration]: e?.isActivated ? `${timeFormat(e.beginTime)}-${timeFormat(e.endTime)}` : `${e.durationDays}${day}`,
      [depositAmount]: `${e.depositAmount}`,
      [depositAmount + '（USDT）']: this.currencyService.getUsdtRateAmount(e?.currency, e?.depositAmount),
      [lbf]: e.lostAmount ? `${yes},${e.lostAmount}` : no,
      [wp]: `${e.betProgress}%`,
      [bta]: `${e.currentBetTurnover}`,
      [bta + '（USDT）']: this.currencyService.getUsdtRateAmount(e?.currency, e?.currentBetTurnover),
      [nextCount]: e.betCount || '-',
      [currency]: e.currency,
    }));

    JSONToExcelDownload(exportList, 'prize-record ' + Date.now());
  }
}
