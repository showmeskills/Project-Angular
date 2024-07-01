import { Component, OnDestroy, OnInit } from '@angular/core';
import moment from 'moment';
import { Subject, takeUntil } from 'rxjs';
import { AppService } from 'src/app/app.service';
import { BonusCouponApi } from 'src/app/shared/api/bonus-coupon.api';
import { toDateStamp } from 'src/app/shared/models/tools.model';
import { SubHeaderService } from 'src/app/_metronic/partials/layout/subheader/subheader1/sub-header.service';
import { PageSizes, PaginatorState } from 'src/app/_metronic/shared/crud-table';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { FormatMoneyPipe } from 'src/app/shared/pipes/big-number.pipe';
import { TimeFormatPipe } from 'src/app/shared/pipes/time.pipe';
import { PaginatorComponent } from 'src/app/_metronic/shared/crud-table/components/paginator/paginator.component';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { CurrencyIconDirective } from 'src/app/shared/components/icon/icon.directive';
import { OwlDateTimeComponent } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker.component';
import { OwlDateTimeTriggerDirective } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker-trigger.directive';
import { OwlDateTimeInputDirective } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker-input.directive';
import { NgFor, NgIf } from '@angular/common';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { CouponTypeEnum } from 'src/app/shared/interfaces/coupon';
import { CouponService } from 'src/app/pages/Bonus/coupon.service';
import { cloneDeep } from 'lodash';
import { CurrencyValuePipe } from 'src/app/shared/pipes/currency-value.pipe';

@Component({
  selector: 'app-record',
  templateUrl: './record.component.html',
  styleUrls: ['./record.component.scss'],
  standalone: true,
  imports: [
    FormRowComponent,
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    NgFor,
    OwlDateTimeInputDirective,
    OwlDateTimeTriggerDirective,
    OwlDateTimeComponent,
    CurrencyIconDirective,
    NgIf,
    AngularSvgIconModule,
    PaginatorComponent,
    TimeFormatPipe,
    FormatMoneyPipe,
    LangPipe,
    CurrencyValuePipe,
  ],
})
export class RecordComponent implements OnInit, OnDestroy {
  _destroyed: any = new Subject<void>(); // 订阅商户的流

  pageSizes: number[] = PageSizes; // 页大小
  paginator: PaginatorState = new PaginatorState(); // 分页

  constructor(
    public subHeaderService: SubHeaderService,
    private appService: AppService,
    private api: BonusCouponApi,
    public couponService: CouponService
  ) {}

  protected readonly CouponTypeEnum = CouponTypeEnum;

  isLoading = false;

  dataEmpty = {
    name: '', // 名称
    uid: '', // uid
    uact: '', // 用户登录名
    type: '', // 类型
    createTime: '', // 创建时间
    receivedTime: '', // 兑换时间

    order: '', // 排序字段
    isAsc: true, // 是否为升序排序
  };

  data = cloneDeep(this.dataEmpty);

  /** 优惠卷 - 类型数据 */
  get typeList() {
    return this.couponService.typeList;
  }

  list: any = [];

  ngOnInit() {
    this.subHeaderService.merchantId$.pipe(takeUntil(this._destroyed)).subscribe(() => {
      this.onReset();
    });
  }

  ngOnDestroy(): void {
    this._destroyed.next();
    this._destroyed.complete();
  }

  // 加载状态
  loading(v: boolean): void {
    this.isLoading = v;
    this.appService.isContentLoadingSubject.next(v);
  }

  getList(resetPage = false) {
    if (this.isLoading) return;

    resetPage && (this.paginator.page = 1);
    this.loading(true);
    this.api
      .getCouponRecordList({
        tenantId: +this.subHeaderService.merchantCurrentId,
        voucherName: this.data.name,
        uid: this.data.uid,
        uact: this.data.uact,
        inReleaseStatus: [5, 6, 7],
        releaseType: this.data.type,
        ...(this.data.createTime[0]
          ? {
              createTimeStart: moment(Number(toDateStamp(this.data.createTime[0], false))).format(
                'YYYY-MM-DD HH:mm:ss'
              ),
            }
          : {}),
        ...(this.data.createTime[1]
          ? {
              createTimeEnd: moment(Number(toDateStamp(this.data.createTime[1], true))).format('YYYY-MM-DD HH:mm:ss'),
            }
          : {}),
        ...(this.data.receivedTime[0]
          ? {
              receivedTimeStart: moment(Number(toDateStamp(this.data.receivedTime[0], false))).format(
                'YYYY-MM-DD HH:mm:ss'
              ),
            }
          : {}),
        ...(this.data.receivedTime[1]
          ? {
              receivedTimeEnd: moment(Number(toDateStamp(this.data.receivedTime[1], true))).format(
                'YYYY-MM-DD HH:mm:ss'
              ),
            }
          : {}),
        // createTimeStart: toDateStamp(this.data.createTime[0], false) || '',
        // createTimeEnd: toDateStamp(this.data.createTime[1], true) || '',
        // receivedTimeStart: toDateStamp(this.data.receivedTime[0], false) || '',
        // receivedTimeEnd: toDateStamp(this.data.receivedTime[1], true) || '',
        current: this.paginator.page,
        size: this.paginator.pageSize,
        ...(this.data.order
          ? {
              orderBy: this.data.order,
              sort: this.data.isAsc ? 'asc' : 'desc',
            }
          : {}),
      })
      .subscribe((res) => {
        this.loading(false);
        if (res.code === '0000') {
          this.list = res?.data?.records || [];
          this.paginator.total = res?.data?.total || 0;
        }
      });
  }

  onReset() {
    this.data = { ...this.dataEmpty };
    this.getList(true);
  }

  onSort(sortKey: any) {
    if (!this.list.length) return;

    if (this.data.isAsc === false && this.data.order === sortKey) {
      this.data.order = '';
      this.data.isAsc = true;
      this.getList(true);
      return;
    }

    if (!this.data.order || this.data.order !== sortKey) {
      this.data.order = sortKey;
      this.data.isAsc = false;
    }

    this.data.isAsc = !this.data.isAsc;
    this.getList(true);
  }
}
