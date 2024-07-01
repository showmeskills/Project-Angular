import { Component, OnInit, Optional, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { PageSizes, PaginatorState } from 'src/app/_metronic/shared/crud-table';
import { ActivityAPI } from 'src/app/shared/api/activity.api';
import { ExcelFormat, JSONToExcelDownload, timeFormat, toDateStamp } from 'src/app/shared/models/tools.model';
import { AppService } from 'src/app/app.service';
import { cloneDeep } from 'lodash';
import { lastValueFrom, zip } from 'rxjs';
import {
  LuckRecordParams,
  PrizeType,
  PrizeTypeItem,
  TurntableRecordPrize,
  TurntableRecordTable,
} from 'src/app/shared/interfaces/activity';
import { MatModalRef } from 'src/app/shared/components/dialogs/modal';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { CurrencyValuePipe } from 'src/app/shared/pipes/currency-value.pipe';
import { TimeFormatPipe } from 'src/app/shared/pipes/time.pipe';
import { ModalFooterComponent } from 'src/app/shared/components/dialogs/modal/modal-footer.component';
import { PaginatorComponent } from 'src/app/_metronic/shared/crud-table/components/paginator/paginator.component';
import { EmptyComponent } from 'src/app/shared/components/empty/empty.component';
import { CurrencyIconDirective } from 'src/app/shared/components/icon/icon.directive';
import { OwlDateTimeComponent } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker.component';
import { OwlDateTimeTriggerDirective } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker-trigger.directive';
import { OwlDateTimeInputDirective } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker-input.directive';
import { MatOptionModule } from '@angular/material/core';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { ModalTitleComponent } from 'src/app/shared/components/dialogs/modal/modal-title.component';
import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { AngularSvgIconModule } from 'angular-svg-icon';
import moment from 'moment/moment';
import { map } from 'rxjs/operators';
import { CurrencyService } from 'src/app/shared/service/currency.service';

@Component({
  selector: 'app-draw-record',
  templateUrl: './draw-record.component.html',
  styleUrls: ['./draw-record.component.scss'],
  standalone: true,
  imports: [
    NgIf,
    ModalTitleComponent,
    FormRowComponent,
    MatFormFieldModule,
    MatSelectModule,
    FormsModule,
    NgFor,
    MatOptionModule,
    OwlDateTimeInputDirective,
    OwlDateTimeTriggerDirective,
    OwlDateTimeComponent,
    CurrencyIconDirective,
    EmptyComponent,
    PaginatorComponent,
    ModalFooterComponent,
    TimeFormatPipe,
    CurrencyValuePipe,
    LangPipe,
    AngularSvgIconModule,
    AsyncPipe,
  ],
})
export class DrawRecordComponent implements OnInit {
  constructor(
    public lang: LangService,
    public router: Router,
    private route: ActivatedRoute,
    private api: ActivityAPI,
    public appService: AppService,
    private currencyService: CurrencyService,
    @Optional() public modal: MatModalRef<DrawRecordComponent>
  ) {
    const { id } = route.snapshot.params;
    this.id = +id || 0;

    const { tenantId } = route.snapshot.queryParams;
    this.merchantId = tenantId;
  }

  @ViewChild('stickyWrapper') stickyWrapper!: ElementRef;
  id;
  merchantId;
  isModal = false; // 是否弹窗
  pageSizes: number[] = [...PageSizes]; // 页大小
  paginator: PaginatorState = new PaginatorState(); // 分页

  /** 参与状态 */
  statusList = [
    { name: '全部', value: 0, lang: 'luckRoulette.drawRecord.all' },
    { name: '中奖', value: 1, lang: 'luckRoulette.drawRecord.jackpot' },
    { name: '未中奖', value: 2, lang: 'luckRoulette.drawRecord.unwin' },
  ];

  /** 奖品名称 */
  prizeList: TurntableRecordPrize[] = [];

  /** 奖品类型 */
  prizeTypeList: PrizeTypeItem[] = [];

  dataEmpty = {
    status: 0,
    time: [] as Date[],
    uid: '',
    prizeId: 0,
    prizeType: 0,
    sort: '',
    isAsc: undefined as undefined | boolean,
  };

  data = cloneDeep(this.dataEmpty);

  /** 列表 */
  list: TurntableRecordTable[] = [];

  ngOnInit() {
    this.appService.isContentLoadingSubject.next(true);
    zip(
      this.api.prize_getprizetypes(this.merchantId),
      this.api.turntable_getactivityprizes(this.id, this.merchantId, this.lang.currentLang.toLowerCase())
    ).subscribe(([prizeType, prizeList]) => {
      this.prizeTypeList = prizeType?.data || [];
      this.prizeList = prizeList?.data || [];

      this.loadData(true);
    });
  }

  loadData(resetPage = false) {
    resetPage && (this.paginator.page = 1);

    this.appService.isContentLoadingSubject.next(true);

    this.loadData$().subscribe((res) => {
      this.appService.isContentLoadingSubject.next(false);

      this.list = res?.data?.activities || [];
      this.paginator.total = res?.data?.totalCount || 0;
    });
  }

  loadData$(sendData?: Partial<LuckRecordParams>) {
    return this.api
      .turntable_getdrawdetail({
        activityId: this.id,
        merchantId: this.merchantId,
        status: this.data.status,
        uid: this.data.uid,
        prizeId: this.data.prizeId,
        prizeType: this.data.prizeType,
        lang: this.lang.currentLang,
        pageIndex: this.paginator.page,
        pageSize: this.paginator.pageSize,
        startTime: toDateStamp(this.data.time[0]),
        endTime: toDateStamp(this.data.time[1], true),
        sort: this.data.sort,
        isAsc: this.data.isAsc,
        ...sendData,
      })
      .pipe(
        map((res) => {
          if (res?.data?.activities) {
            res.data.activities = (Array.isArray(res?.data?.activities) ? res.data.activities : []).map((e) => ({
              ...e,
              prizeTypeName: this.prizeTypeList.find((j) => j.prizeTypeValue === e.prizeType)?.prizeTypeName,
            }));
          }

          return res;
        })
      );
  }

  /** 重置 */
  onReset() {
    this.data = cloneDeep(this.dataEmpty);
    this.loadData(true);
  }

  /** 排序 */
  onSort(sortKey: string): void {
    this.data.sort = sortKey;

    const temp = [undefined, true, false];
    const next = (temp.indexOf(this.data.isAsc) + 1) % temp.length;

    if (temp[next] === undefined) this.data.sort = '';
    this.data.isAsc = temp[next];
    this.loadData(true);
  }

  protected readonly PrizeType = PrizeType;

  /**
   * 导出
   * @param isAll
   */
  async onExport(isAll: boolean) {
    let list: TurntableRecordTable[] = [];
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
        const res = await lastValueFrom(this.loadData$({ pageSize: 9e5 }));
        this.appService.isContentLoadingSubject.next(false);
        list = res?.data?.activities || []; // success === false会自动抛出
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
  async exportExcel(list: TurntableRecordTable[]) {
    if (!list?.length) return;

    const prizeName = await this.lang.getOne('luckRoulette.drawRecord.prizeName'); // 奖品
    const uid = 'UID'; // UID
    const prizeType = await this.lang.getOne('luckRoulette.drawRecord.prizeType'); // 奖品类型
    const amount = await this.lang.getOne('common.amount'); // 金额
    const currency = await this.lang.getOne('common.currency'); // 币种
    const sendType = await this.lang.getOne('luckRoulette.drawRecord.drawTime'); // 抽奖时间

    const exportList = list.map((e) => ({
      [prizeName]: e.prizeName || '-',
      [uid]: ExcelFormat.str(e.uid),
      [prizeType]: e.prizeTypeName || '-',
      [amount]: e.sendAmount,
      [currency]: e?.sendCurrency,
      [amount + '（USDT）']: this.currencyService.getUsdtRateAmount(e?.sendCurrency, e?.sendAmount),
      [sendType]: timeFormat(e.drawTime),
    }));

    JSONToExcelDownload(exportList, 'lucky-prize-record ' + Date.now());
  }
}
