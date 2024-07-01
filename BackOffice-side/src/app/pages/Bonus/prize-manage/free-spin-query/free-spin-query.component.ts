import { NgFor, NgSwitch, NgSwitchCase, NgSwitchDefault, NgIf, AsyncPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { ActivatedRoute, Router } from '@angular/router';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { cloneDeep } from 'lodash';
import { finalize, lastValueFrom } from 'rxjs';
import { AppService } from 'src/app/app.service';
import { OwlDateTimeComponent } from 'src/app/components/datetime-picker';
import { OwlDateTimeInputDirective } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker-input.directive';
import { OwlDateTimeTriggerDirective } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker-trigger.directive';
import { FreeSpinBonusDetailPopupComponent } from 'src/app/pages/member/detail/free-spin-detail/bonus-detail-popup/bonus-detail-popup.component';
import { ActivityAPI } from 'src/app/shared/api/activity.api';
import { MatModal } from 'src/app/shared/components/dialogs/modal';
import { EmptyComponent } from 'src/app/shared/components/empty/empty.component';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { IconSrcDirective, CurrencyIconDirective } from 'src/app/shared/components/icon/icon.directive';
import { LabelComponent } from 'src/app/shared/components/label/label.component';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { FreeSpinStat } from 'src/app/shared/interfaces/member.interface';
import { JSONToExcelDownload, ExcelFormat, timeFormat, toDateStamp } from 'src/app/shared/models/tools.model';
import { FormatMoneyPipe } from 'src/app/shared/pipes/big-number.pipe';
import { CurrencyValuePipe } from 'src/app/shared/pipes/currency-value.pipe';
import { TimeFormatPipe } from 'src/app/shared/pipes/time.pipe';
import { CurrencyService } from 'src/app/shared/service/currency.service';
import { BreadcrumbsService } from 'src/app/_metronic/partials/layout/subheader/subheader1/breadcrumbs.service';
import { PageSizes, PaginatorState } from 'src/app/_metronic/shared/crud-table';
import { PaginatorComponent } from 'src/app/_metronic/shared/crud-table/components/paginator/paginator.component';

@Component({
  selector: 'free-spin-query',
  templateUrl: './free-spin-query.component.html',
  styleUrls: ['./free-spin-query.component.scss'],
  standalone: true,
  imports: [
    NgFor,
    NgSwitch,
    NgSwitchCase,
    IconSrcDirective,
    NgSwitchDefault,
    CurrencyIconDirective,
    NgIf,
    AngularSvgIconModule,
    MatFormFieldModule,
    MatSelectModule,
    FormsModule,
    MatOptionModule,
    PaginatorComponent,
    AsyncPipe,
    FormatMoneyPipe,
    CurrencyValuePipe,
    LangPipe,
    EmptyComponent,
    TimeFormatPipe,
    LabelComponent,
    FormRowComponent,
    OwlDateTimeInputDirective,
    OwlDateTimeTriggerDirective,
    OwlDateTimeComponent,
    AsyncPipe,
  ],
})
export class FreeSpinQueryComponent implements OnInit {
  constructor(
    public appService: AppService,
    public activatedRoute: ActivatedRoute,
    public router: Router,
    public lang: LangService,
    private breadcrumbsService: BreadcrumbsService,
    private modalService: MatModal,
    private api: ActivityAPI,
    private currencyService: CurrencyService
  ) {
    const { prizeId, tmpCode, tenantId } = activatedRoute.snapshot.queryParams; // params参数;

    this.prizeId = prizeId;
    this.tmpCode = tmpCode;

    this.tenantId = tenantId;
  }

  /** 商户ID */
  tenantId;

  /** 奖品ID */
  prizeId;

  /** 优惠卷code */
  tmpCode;

  /** 页大小 */
  pageSizes: number[] = PageSizes;

  /** 分页 */
  paginator: PaginatorState = new PaginatorState();

  dataEmpty = {
    title: '', // 名称
    uid: '',
    time: [] as Date[],
  };

  data = cloneDeep(this.dataEmpty);

  /** 统计数据 */
  stat: FreeSpinStat | null;

  /** 列表数据 */
  list = [];

  ngOnInit() {
    this.getMemberFreeSpinBonusStat();
    this.onReset();
  }

  /** 统计数据 */
  getMemberFreeSpinBonusStat() {
    this.appService.isContentLoadingSubject.next(true);
    this.api.getfreespinbonusstat(this.tenantId, this.prizeId, this.tmpCode).subscribe((res) => {
      this.appService.isContentLoadingSubject.next(false);

      this.stat = res;
    });
  }

  /** 列表数据 */
  loadData(resetPage = false) {
    this.appService.isContentLoadingSubject.next(true);
    this.loadData$(resetPage)
      .pipe(finalize(() => this.appService.isContentLoadingSubject.next(false)))
      .subscribe((res) => {
        this.list = Array.isArray(res?.list) ? res.list : [];
        this.paginator.total = res?.total || 0;
      });
  }

  loadData$(resetPage = false, sendData?: Partial<any>) {
    resetPage && (this.paginator.page = 1);

    const parmas = {
      tenantId: this.tenantId,
      prizeId: this.prizeId,
      tmpCode: this.tmpCode,
      uid: this.data.uid,
      name: this.data.title,
      startTime: toDateStamp(this.data.time[0], false),
      endTime: toDateStamp(this.data.time[1], true),
      pageIndex: this.paginator.page,
      pageSize: this.paginator.pageSize,
      ...sendData,
    };

    return this.api.getfreespinlist(parmas);
  }

  onReset() {
    this.data = cloneDeep(this.dataEmpty);
    this.loadData(true);
  }

  /** 获取状态类型 */
  getLabelType(status: string) {
    const typeList = new Map([
      ['Pending', 'default'], // 待使用
      ['Using', 'primary'], // 使用中
      ['Completed', 'success'], // 已完成
      ['Expired', 'danger'], // 已过期
    ]);
    return typeList.get(status) || 'default';
  }

  /** 查看奖金详情 */
  onView(item) {
    const modalRef = this.modalService.open(FreeSpinBonusDetailPopupComponent, { width: '775px', autoFocus: false });
    modalRef.componentInstance['id'] = item.id;
    modalRef.componentInstance['isPrizeCoupon'] = this.prizeId || this.tmpCode ? true : false;
    modalRef.result.then(() => {}).catch(() => {});
  }

  /**
   * 导出
   */
  async onExport(isAll: boolean) {
    let list = this.list;

    if (isAll) {
      try {
        this.appService.isContentLoadingSubject.next(true);
        const res = await lastValueFrom(this.loadData$(true, { pageSize: 9e5 }));
        this.appService.isContentLoadingSubject.next(false);
        list = Array.isArray(res?.list) ? res.list : [];
      } finally {
        this.appService.isContentLoadingSubject.next(false);
      }
    }

    if (!list.length) return this.appService.showToastSubject.next({ msgLang: 'common.emptyText' });

    const prizeName = await this.lang.getOne('member.detail.freeSpin.prizeName'); // 奖品名称
    const uid = 'UID'; // UID
    const prizeType = await this.lang.getOne('luckRoulette.drawRecord.prizeType'); // 奖品类型
    const activityTitle = await this.lang.getOne('member.detail.freeSpin.activityName'); // 活动名称
    const supportGames = await this.lang.getOne('member.detail.freeSpin.supportGames'); // 支持游戏
    const numberOfIssuances = await this.lang.getOne('member.detail.freeSpin.numberOfIssuances'); // 发放次数
    const usageCount = await this.lang.getOne('member.detail.freeSpin.usageCount'); // 使用次数
    const spinBonus = await this.lang.getOne('member.detail.freeSpin.spinBonus'); // 旋转奖金
    const disburseBonus = await this.lang.getOne('member.detail.freeSpin.disburseBonus'); // 发放奖金
    const issuanceTime = await this.lang.getOne('member.giveOut.IssuanceTime'); // 发放时间
    const status = await this.lang.getOne('common.status'); // 状态
    const currency = await this.lang.getOne('common.currency'); // 币种

    JSONToExcelDownload(
      list.map((e: any) => ({
        [prizeName]: e.prizeName || '',
        [uid]: ExcelFormat.str(e.uid),
        [prizeType]: 'Free Spin',
        ...(this.prizeId ? { [activityTitle]: e.activityName || '-' } : {}),
        [supportGames]: e.providerName + '/' + e.gameName || '-',
        [numberOfIssuances]: e.maxSpinNum,
        [status]: e.statusDesc || '-',
        [issuanceTime]: timeFormat(e.createdTime) || '-',
        [usageCount]: e.currentSpinNum,
        [spinBonus]: e.balance,
        [currency]: e.currency,
        [spinBonus + '（USDT）']: this.currencyService.getUsdtRateAmount(e?.currency, e?.balance),
        [disburseBonus]: e.bonusAmount,
        [disburseBonus + '（USDT）']: this.currencyService.getUsdtRateAmount(e?.currency, e?.bonusAmount),
      })),
      'free-spin-detail ' + Date.now()
    );
  }
}
