import { Component, OnInit } from '@angular/core';
import { CommonModule, NgFor } from '@angular/common';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { MatSelectModule } from '@angular/material/select';
import { PageSizes, PaginatorState } from 'src/app/_metronic/shared/crud-table';
import { AppService } from 'src/app/app.service';
import { ActivatedRoute, Router } from '@angular/router';
import { EmptyComponent } from 'src/app/shared/components/empty/empty.component';
import { PaginatorComponent } from 'src/app/_metronic/shared/crud-table/components/paginator/paginator.component';
import { FormsModule } from '@angular/forms';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { BonusCouponApi } from 'src/app/shared/api/bonus-coupon.api';
import { VoucherItem, VoucherParams, VoucherStatus, VoucherStatusValue } from 'src/app/shared/interfaces/bonus';
import { TimeFormatPipe } from 'src/app/shared/pipes/time.pipe';
import { LabelComponent } from 'src/app/shared/components/label/label.component';
import { cloneDeep } from 'lodash';
import { OwlDateTimeComponent } from 'src/app/components/datetime-picker';
import { OwlDateTimeInputDirective } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker-input.directive';
import { OwlDateTimeTriggerDirective } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker-trigger.directive';
import { finalize } from 'rxjs';
import { ExcelFormat, JSONToExcelDownload, timeFormat, toDateStamp } from 'src/app/shared/models/tools.model';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { LoadingDirective } from 'src/app/shared/directive/loading.directive';
import { CouponTypeEnum } from 'src/app/shared/interfaces/coupon';
import { CouponService } from 'src/app/pages/Bonus/coupon.service';
import { CurrencyValuePipe } from 'src/app/shared/pipes/currency-value.pipe';
import { CurrencyService } from 'src/app/shared/service/currency.service';

@Component({
  selector: 'distribution-records',
  standalone: true,
  imports: [
    CommonModule,
    FormRowComponent,
    LangPipe,
    MatSelectModule,
    EmptyComponent,
    PaginatorComponent,
    FormsModule,
    AngularSvgIconModule,
    NgFor,
    TimeFormatPipe,
    LabelComponent,
    OwlDateTimeComponent,
    OwlDateTimeInputDirective,
    OwlDateTimeTriggerDirective,
    LoadingDirective,
    CurrencyValuePipe,
  ],
  templateUrl: './distribution-records.component.html',
  styleUrls: ['./distribution-records.component.scss'],
})
export class DistributionRecordsComponent implements OnInit {
  constructor(
    private appService: AppService,
    private route: ActivatedRoute,
    private api: BonusCouponApi,
    private router: Router,
    private lang: LangService,
    public couponService: CouponService,
    private currencyService: CurrencyService
  ) {
    this.id = route.snapshot.params['id'] || null;
    this.tenantId = route.snapshot.params['tenantId'] || null;

    if (!+this.id || !+this.tenantId) {
      appService.showToastSubject.next({ msgLang: 'form.paramsError' });
      router.navigate(['/bonus/coupon-manage']);
    }
  }

  id = 0;
  tenantId = 0;
  loading = false;
  pageSizes: number[] = [...PageSizes, 2e3, 3e3, 5e3]; // 页大小
  paginator: PaginatorState = new PaginatorState(); // 分页
  list: VoucherItem[] = [];

  protected readonly VoucherStatus = VoucherStatus;
  protected readonly CouponTypeEnum = CouponTypeEnum;
  readonly defaultFilter = {
    uid: '',
    issued: '',
    issuedTime: [] as Date[],
    status: '' as VoucherStatusValue | '',
  };

  data = cloneDeep(this.defaultFilter);

  ngOnInit() {
    this.onReset();
  }

  loadData(resetPage = false) {
    if (this.loading) return;

    this.loading = true;
    this.loadData$(resetPage)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe((res) => {
        this.list = Array.isArray(res?.data?.records) ? res.data!.records : [];
        this.paginator.total = res?.data?.total || 0;
      });
  }

  loadData$(resetPage = false, sendData?: Partial<VoucherParams>) {
    resetPage && (this.paginator.page = 1);
    return this.api.getCouponRecordList({
      tenantId: this.tenantId,
      tmpId: this.id,
      current: this.paginator.page,
      size: this.paginator.pageSize,
      uid: this.data.uid,
      createBy: this.data.issued,
      createTimeStart: toDateStamp(this.data.issuedTime[0], false, true) || '',
      createTimeEnd: toDateStamp(this.data.issuedTime[1], true, true) || '',
      releaseStatus: this.data.status,
      ...sendData,
    });
  }

  onReset() {
    this.data = cloneDeep(this.defaultFilter);
    this.loadData(true);
  }

  /**
   * 导出
   */
  exportLoading = true;
  async onExport(isAll: boolean) {
    let list = this.list;

    if (isAll) {
      this.exportLoading = true;
      this.loadData$(true, { size: 9e5 })
        .pipe(finalize(() => (this.exportLoading = false)))
        .subscribe((res) => {
          list = Array.isArray(res?.data?.records) ? res.data!.records : [];
        });
    }

    if (!list.length) return this.appService.showToastSubject.next({ msgLang: 'common.emptyText' });

    const name = await this.lang.getOne('member.coupon.name'); // 名称
    const couponCode = await this.lang.getOne('member.coupon.couponCode'); // 券码
    const type = await this.lang.getOne('common.type'); // 类型
    const amount = await this.lang.getOne('common.amount'); // 金额
    const currency = await this.lang.getOne('common.currency'); // 币种
    const uid = 'UID'; // UID
    const sender = await this.lang.getOne('member.coupon.sender'); // 发放人员
    const IssuanceTime = await this.lang.getOne('member.giveOut.IssuanceTime'); // 发放时间
    const status = await this.lang.getOne('common.status'); // 状态
    const couponType = {
      [CouponTypeEnum.CashCoupons]: await this.lang.getOne('member.coupon.model.cashCoupon'),
      [CouponTypeEnum.Voucher]: await this.lang.getOne('member.coupon.model.bettingCredit'),
      [CouponTypeEnum.SVIPExperienceCoupon]: await this.lang.getOne('member.coupon.model.svipVoucher'),
      [CouponTypeEnum.NonStickyBonus]: await this.lang.getOne(
        'member.activity.prizeCommon.configurationList.nonStickyBonus'
      ),
    };
    const statusLang = {
      [VoucherStatus.ReviewFail]: await this.lang.getOne('member.coupon.toReviewFail'),
      [VoucherStatus.Reviewing]: await this.lang.getOne('member.kyc.underReview'),
      [VoucherStatus.ReviewReject]: await this.lang.getOne('member.kyc.declined'),
      [VoucherStatus.IssueFail]: await this.lang.getOne('member.giveOut.failedissue'),
      [VoucherStatus.Unclaimed]: await this.lang.getOne('member.giveOut.pendingCollection'),
      [VoucherStatus.Received]: await this.lang.getOne('member.giveOut.received'),
      [VoucherStatus.InUse]: await this.lang.getOne('member.giveOut.Using'),
      [VoucherStatus.Used]: await this.lang.getOne('member.giveOut.Used'),
      [VoucherStatus.Invalid]: await this.lang.getOne('member.giveOut.expired'),
    };

    JSONToExcelDownload(
      list.map((e) => ({
        [name]: e.voucherName || '',
        [couponCode]: e.tmpCode || '-',
        [type]: couponType[e.releaseType] || '-',
        [amount]: e.money,
        [currency]: e.moneyType,
        [amount + '（USDT）']: this.currencyService.getUsdtRateAmount(e?.moneyType, e?.money),
        [uid]: ExcelFormat.str(e.uid),
        [sender]: e.createBy || '-',
        [IssuanceTime]: timeFormat(e.createTime),
        [status]: statusLang[e.releaseStatus] || '-',
      })),
      'voucher ' + Date.now()
    );
  }
}
