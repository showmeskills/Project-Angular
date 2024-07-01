import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { cloneDeep } from 'lodash';
import { AppService } from 'src/app/app.service';
import { ActivityAPI } from 'src/app/shared/api/activity.api';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { DestroyService, toDateStamp } from 'src/app/shared/models/tools.model';
import { SubHeaderService } from 'src/app/_metronic/partials/layout/subheader/subheader1/sub-header.service';
import { PageSizes, PaginatorState } from 'src/app/_metronic/shared/crud-table';
import { takeUntil } from 'rxjs/operators';
import moment from 'moment';
import { PrizeType, PrizeTypeItem } from 'src/app/shared/interfaces/activity';
import { PrizeService } from 'src/app/pages/Bonus/prize.service';
import { zip } from 'rxjs';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { TimeFormatPipe } from 'src/app/shared/pipes/time.pipe';
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
import { PrizeConfigPipe } from 'src/app/pages/Bonus/bonus.service';

@Component({
  selector: 'app-query',
  templateUrl: './query.component.html',
  styleUrls: ['./query.component.scss'],
  providers: [DestroyService],
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
    TimeFormatPipe,
    LangPipe,
    PrizeConfigPipe,
    AsyncPipe,
  ],
})
export class NewcomerTaskQueryComponent implements OnInit {
  constructor(
    public appService: AppService,
    public lang: LangService,
    private subHeader: SubHeaderService,
    public router: Router,
    private route: ActivatedRoute,
    private api: ActivityAPI,
    public prizeService: PrizeService,
    private destroy$: DestroyService
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

  dataEmpty: any = {
    time: '',
    uid: '',
    prizeType: 0, // 类型
  };

  data = cloneDeep(this.dataEmpty);

  /** 列表 */
  list: any[] = [];

  ngOnInit() {
    this.subHeader.merchantId$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.loading(true);
      zip(this.api.prize_getprizetypes(this.subHeader.merchantCurrentId)).subscribe(([prizeType]) => {
        this.loading(false);
        this.prizeTypeList = [...(prizeType?.data || [])];

        this.loadData(true);
      });
    });
  }

  loadData(resetPage = false) {
    resetPage && (this.paginator.page = 1);
    this.loading(true);
    const parmas = {
      tenantId: this.subHeader.merchantCurrentId,
      tmpId: this.tmpId,
      uid: this.data.uid,
      releaseType: this.data.prizeType === 0 ? '' : this.data.prizeType,
      ...(this.data.time[0]
        ? {
            createTimeStart: moment(Number(toDateStamp(this.data.time[0]))).format('YYYY-MM-DD HH:mm:ss'),
          }
        : {}),
      ...(this.data.time[1]
        ? {
            createTimeEnd: moment(Number(toDateStamp(this.data.time[1], true))).format('YYYY-MM-DD HH:mm:ss'),
          }
        : {}),
      pageIndex: this.paginator.page,
      pageSize: this.paginator.pageSize,
    };
    this.api.getOldBonusReleaseRecordList(parmas).subscribe((res) => {
      this.loading(false);

      this.list = res?.data?.records || [];
      this.paginator.total = res?.data?.total || 0;
    });
  }

  // 排序
  onSort(sortKey: any) {
    if (!this.list.length) return;

    if (this.data.isAsc === false && this.data.order === sortKey) {
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
    this.data = { ...this.dataEmpty };
    this.loadData(true);
  }

  // 加载状态
  loading(v: boolean): void {
    this.isLoading = v;
    this.appService.isContentLoadingSubject.next(v);
  }
}
