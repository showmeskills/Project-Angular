import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { lastValueFrom, takeUntil } from 'rxjs';
import { AppService } from 'src/app/app.service';
import { BonusApi } from 'src/app/shared/api/bonus.api';
import { SubHeaderService } from 'src/app/_metronic/partials/layout/subheader/subheader1/sub-header.service';
import { PageSizes, PaginatorState } from 'src/app/_metronic/shared/crud-table';
import { DatePipe, NgIf, NgFor } from '@angular/common';
import { DestroyService, JSONToExcelDownload, toDateStamp } from 'src/app/shared/models/tools.model';
import moment from 'moment';
import { Clipboard } from '@angular/cdk/clipboard';
import { Router } from '@angular/router';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { CurrencyValuePipe } from 'src/app/shared/pipes/currency-value.pipe';
import { TimeFormatPipe } from 'src/app/shared/pipes/time.pipe';
import { PaginatorComponent } from 'src/app/_metronic/shared/crud-table/components/paginator/paginator.component';
import { CurrencyIconDirective } from 'src/app/shared/components/icon/icon.directive';
import {
  SelectChildrenDirective,
  SelectGroupDirective,
  SelectDirective,
} from 'src/app/shared/directive/select.directive';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { OwlDateTimeComponent } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker.component';
import { OwlDateTimeTriggerDirective } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker-trigger.directive';
import { FormsModule } from '@angular/forms';
import { OwlDateTimeInputDirective } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker-input.directive';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { VipApi } from 'src/app/shared/api/vip.api';
import { VipNamePipe } from 'src/app/shared/pipes/common.pipe';
import { CurrencyService } from 'src/app/shared/service/currency.service';
import { cloneDeep } from 'lodash';

@Component({
  selector: 'give-out',
  templateUrl: './give-out.component.html',
  styleUrls: ['./give-out.component.scss'],
  providers: [DatePipe, DestroyService],
  standalone: true,
  imports: [
    NgIf,
    FormRowComponent,
    OwlDateTimeInputDirective,
    FormsModule,
    OwlDateTimeTriggerDirective,
    OwlDateTimeComponent,
    MatFormFieldModule,
    MatSelectModule,
    NgFor,
    MatOptionModule,
    AngularSvgIconModule,
    SelectChildrenDirective,
    SelectGroupDirective,
    SelectDirective,
    CurrencyIconDirective,
    PaginatorComponent,
    TimeFormatPipe,
    CurrencyValuePipe,
    LangPipe,
    VipNamePipe,
  ],
})
export class GiveOutComponent implements OnInit {
  constructor(
    private bonusApi: BonusApi,
    private appService: AppService,
    public subHeaderService: SubHeaderService,
    private clipboard: Clipboard,
    public router: Router,
    public lang: LangService,
    private vipApi: VipApi,
    private currencyService: CurrencyService,
    private destroy$: DestroyService
  ) {}

  @ViewChild('stickyWrapper') stickyWrapper!: ElementRef;

  pageSizes: number[] = [...PageSizes, 2e3, 3e3, 5e3]; // 页大小
  paginator: PaginatorState = new PaginatorState(); // 分页

  isLoading = false;

  vipList: { name: string; value: number }[] = [];

  /** 完成度列表 */
  releaseStatusList: { name: string; value: number }[] = [
    // '未提交'
    { name: 'member.giveOut.unsubmitted', value: 0 },
    // '已提交'
    { name: 'member.giveOut.submitted', value: 1 },
    // '审核通过'
    { name: 'member.giveOut.releaseEnquiry', value: 2 },
    // '发放失败'
    { name: 'member.giveOut.failedissue', value: 3 },
    // '待领取'
    { name: 'member.giveOut.pendingCollection', value: 4 },
    // '已领取'
    { name: 'member.giveOut.received', value: 5 },
    // '使用中'
    { name: 'member.giveOut.Using', value: 6 },
    // '已使用'
    { name: 'member.giveOut.Used', value: 7 },
    // '已失效'
    { name: 'member.giveOut.expired', value: 8 },
  ];

  dataEmpty = {
    applyTime: [] as Date[],
    grantTime: [] as Date[],
    uid: '',
    oddNumbers: '',
    selectedVipList: [],
    releaseStatus: '',
  };

  data = cloneDeep(this.dataEmpty);

  list: any[] = [];

  ngOnInit() {
    this.subHeaderService.merchantId$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.getVipLevelList();
      this.onReset();
    });
  }

  /** 获取VIP等级列表 */
  getVipLevelList() {
    this.vipApi.vip_manage_level_simple_list(+this.subHeaderService.merchantCurrentId).subscribe((res) => {
      if (res?.code === '0000' && Array.isArray(res?.data))
        this.vipList = res.data.map((v) => ({ name: v?.vipName, value: v?.vipLevel }));
    });
  }

  loadData(resetPage = false) {
    if (this.isLoading) return;

    resetPage && (this.paginator.page = 1);

    this.loading(true);
    this.loadData$().subscribe((res) => {
      this.loading(false);

      this.list = res?.data?.pageDate?.records || [];
      this.paginator.total = res?.data?.pageDate?.total || 0;
    });
  }

  loadData$(sendData?: any) {
    const params = {
      tenantId: +this.subHeaderService.merchantCurrentId,
      current: this.paginator.page,
      size: this.paginator.pageSize,
      userNo: this.data.uid,
      bonusNo: this.data.oddNumbers,
      vipLevels: this.data.selectedVipList,
      releaseStatus: this.data.releaseStatus,
      ...(this.data.applyTime[0]
        ? {
            applyTimeBegin: moment(Number(toDateStamp(this.data.applyTime[0]))).format('YYYY-MM-DD HH:mm:ss'),
          }
        : {}),
      ...(this.data.applyTime[1]
        ? {
            applyTimeEnd: moment(Number(toDateStamp(this.data.applyTime[1], true))).format('YYYY-MM-DD HH:mm:ss'),
          }
        : {}),
      ...(this.data.grantTime[0]
        ? {
            releaseTimeBegin: moment(Number(toDateStamp(this.data.grantTime[0]))).format('YYYY-MM-DD HH:mm:ss'),
          }
        : {}),
      ...(this.data.grantTime[1]
        ? {
            releaseTimeEnd: moment(Number(toDateStamp(this.data.grantTime[1], true))).format('YYYY-MM-DD HH:mm:ss'),
          }
        : {}),
      ...sendData,
    };

    return this.bonusApi.getReleaseList(params);
  }

  getReleaseStatus(status: number) {
    return this.releaseStatusList.find((v) => v.value === status)?.name || '-';
  }

  onReset() {
    this.data = cloneDeep(this.dataEmpty);
    this.loadData(true);
  }

  //复制
  async onCopy(content: string) {
    if (!content) return;
    const successed = this.clipboard.copy(content);
    const copySuccess = await this.lang.getOne('common.copySuccess');
    const copyaFiled = await this.lang.getOne('common.copyaFiled');
    const msg = successed ? copySuccess : copyaFiled;
    this.appService.showToastSubject.next({ msg, successed });
  }

  // async openExportAll() {
  //   this.loading(true);
  //   const downloadSuccessful = await this.lang.getOne('member.giveOut.downloadSuccessful');
  //   const downloadFailed = await this.lang.getOne('member.giveOut.downloadFailed');
  //   this.bonusApi.exportReleaseData({ tenantId: +this.subHeaderService.merchantCurrentId }).subscribe((isSuccess) => {
  //     this.loading(false);
  //     this.appService.showToastSubject.next({
  //       msg: isSuccess ? downloadSuccessful : downloadFailed,
  //       successed: isSuccess,
  //     });
  //   });
  // }

  /**
   * 导出
   */
  async onExport(isAll: boolean) {
    let list: any[] = [];

    if (isAll) {
      const maxDay = 90;
      const thrErr = () =>
        this.appService.showToastSubject.next({ msgLang: 'form.chooseDayTime', msgArgs: { n: maxDay } });

      if (
        !(this.data.applyTime?.[0] && this.data.applyTime?.[1]) &&
        !(this.data.grantTime?.[0] && this.data.grantTime?.[1])
      )
        return thrErr();

      // 比较时间是否超过90天
      const startApplyTime = toDateStamp(this.data.applyTime[0]);
      const endApplyTime = toDateStamp(this.data.applyTime[1], true);
      const starGrantTime = toDateStamp(this.data.grantTime[0]);
      const endGrantTime = toDateStamp(this.data.grantTime[1], true);
      if (
        Math.abs(moment(startApplyTime).diff(endApplyTime, 'days')) > maxDay ||
        Math.abs(moment(starGrantTime).diff(endGrantTime, 'days')) > maxDay
      )
        return thrErr();

      try {
        this.appService.isContentLoadingSubject.next(true);
        const res = await lastValueFrom(this.loadData$({ size: 9e5 }));
        this.appService.isContentLoadingSubject.next(false);
        list = Array.isArray(res?.data?.pageDate?.records) ? res?.data?.pageDate?.records : []; // success === false会自动抛出
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
  async exportExcel(list: any[]) {
    if (!list?.length) return;

    const uid = 'UID'; // UID
    const eventTitle = await this.lang.getOne('member.giveOut.eventTitle');
    const vipLevel = await this.lang.getOne('member.giveOut.vipLevel');
    const bonusNumber = await this.lang.getOne('member.giveOut.bonusNumber');
    const issuanceType = await this.lang.getOne('member.giveOut.IssuanceType');
    const amount = await this.lang.getOne('member.giveOut.amount');
    const issuanceTime = await this.lang.getOne('member.giveOut.IssuanceTime');
    const completeness = await this.lang.getOne('member.giveOut.completeness');
    const cashCoupon = await this.lang.getOne('member.giveOut.cashCoupon');
    const coupon = await this.lang.getOne('member.giveOut.coupon');
    const currency = await this.lang.getOne('common.currency');

    const status = {
      0: await this.lang.getOne('member.giveOut.unsubmitted'),
      1: await this.lang.getOne('member.giveOut.submitted'),
      2: await this.lang.getOne('member.giveOut.releaseEnquiry'),
      3: await this.lang.getOne('member.giveOut.failedissue'),
      4: await this.lang.getOne('member.giveOut.pendingCollection'),
      5: await this.lang.getOne('member.giveOut.received'),
      6: await this.lang.getOne('member.giveOut.Using'),
      7: await this.lang.getOne('member.giveOut.Used'),
      8: await this.lang.getOne('member.giveOut.expired'),
    };

    const exportList = list.map((e) => ({
      [eventTitle]: e.activitesName,
      [uid]: e.userNo,
      [vipLevel]: 'VIP' + e.vipLevel,
      [bonusNumber]: e.bonusNo,
      [issuanceType]: e.releaseType === 1 ? cashCoupon : coupon,
      [amount]: e.money,
      [currency]: e.moneyType,
      [amount + '（USDT）']: this.currencyService.getUsdtRateAmount(e?.moneyType, e?.money),
      [issuanceTime]: moment(+e.releaseTime).format('YYYY-MM-DD HH:mm:ss'),
      [completeness]: status[e.releaseStatus],
    }));

    JSONToExcelDownload(exportList, 'release-list' + Date.now());
  }

  // 加载状态
  loading(v: boolean): void {
    this.isLoading = v;
    this.appService.isContentLoadingSubject.next(v);
  }
}
