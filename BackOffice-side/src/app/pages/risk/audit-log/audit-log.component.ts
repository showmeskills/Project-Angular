import { Component, OnInit } from '@angular/core';
import { switchMap, takeUntil, zip } from 'rxjs';
import { AppService } from 'src/app/app.service';
import { SubHeaderService } from 'src/app/_metronic/partials/layout/subheader/subheader1/sub-header.service';
import { PageSizes, PaginatorState } from 'src/app/_metronic/shared/crud-table';
import { NegativeclearApi } from 'src/app/shared/api/negativeclear.api';
import { DestroyService, toDateStamp } from 'src/app/shared/models/tools.model';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { tap } from 'rxjs/operators';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { CurrencyValuePipe } from 'src/app/shared/pipes/currency-value.pipe';
import { TimeFormatPipe } from 'src/app/shared/pipes/time.pipe';
import { PaginatorComponent } from 'src/app/_metronic/shared/crud-table/components/paginator/paginator.component';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { LabelComponent } from 'src/app/shared/components/label/label.component';
import { CurrencyIconDirective } from 'src/app/shared/components/icon/icon.directive';
import { OwlDateTimeComponent } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker.component';
import { OwlDateTimeTriggerDirective } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker-trigger.directive';
import { OwlDateTimeInputDirective } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker-input.directive';
import { MatOptionModule } from '@angular/material/core';
import { AsyncPipe, NgFor, NgIf, NgSwitch, NgSwitchCase } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import {
  NegativeClearCategoryEnum,
  NegativeClearCategoryObjEnum,
  NegativeClearItem,
} from 'src/app/shared/interfaces/monitor';

@Component({
  selector: 'app-audit-log',
  templateUrl: './audit-log.component.html',
  styleUrls: ['./audit-log.component.scss'],
  providers: [DestroyService],
  standalone: true,
  imports: [
    FormRowComponent,
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    NgFor,
    MatOptionModule,
    OwlDateTimeInputDirective,
    OwlDateTimeTriggerDirective,
    OwlDateTimeComponent,
    CurrencyIconDirective,
    NgSwitch,
    NgSwitchCase,
    LabelComponent,
    NgIf,
    AngularSvgIconModule,
    PaginatorComponent,
    AsyncPipe,
    TimeFormatPipe,
    CurrencyValuePipe,
    LangPipe,
    AsyncPipe,
  ],
})
export class AuditLogComponent implements OnInit {
  constructor(
    public appService: AppService,
    public subHeaderService: SubHeaderService,
    private api: NegativeclearApi,
    public modalService: NgbModal,
    private destroy$: DestroyService
  ) {}

  time: any[] = []; // 时间区间
  // 表单搜索数据
  uid = '';
  type: NegativeClearCategoryEnum | '' = '';
  typeList = [
    { text: '负值清零', key: NegativeClearCategoryObjEnum.NegativeClear, lang: 'risk.auto.zeroNeg' },
    { text: '抵用金清零', key: NegativeClearCategoryObjEnum.CreditClear, lang: 'risk.auto.creditClear' },
    {
      text: '提款流水要求清零',
      key: NegativeClearCategoryObjEnum.WithdrawalLimitClear,
      lang: 'risk.auto.withdrawLimitClear',
    },
    { text: '抵用金过期', key: NegativeClearCategoryObjEnum.CreditExpired, lang: 'risk.auto.creditExpired' },
    {
      text: '提款流水要求自动清零',
      key: NegativeClearCategoryObjEnum.WithdrawalLimitAutoClear,
      lang: 'risk.auto.withdrawalLimitAutoClear',
    },
  ];

  //是否为负值清零
  isNegativeClear = false;
  historyTotal = 0;
  todayTotal = 0;
  list: NegativeClearItem[] = [];
  modal: any = '';
  updateData = {};
  pageSizes: number[] = PageSizes; // 页大小
  paginator: PaginatorState = new PaginatorState(); // 分页

  /** getters */
  get curType() {
    return this.typeList.find((item) => item.key === this.type)!;
  }

  /** lifeCycle */
  ngOnInit(): void {
    this.appService.isContentLoadingSubject.next(true);
    this.api.negativeclearcategoryselect().subscribe((typeList) => {
      this.typeList = typeList.map((e) => ({
        ...e,
        lang: this.typeList.find((item) => item.key === e.key)?.lang || '',
      }));
      this.type = this.typeList[0].key;

      this.subHeaderService.merchantId$
        .pipe(
          tap(() => this.appService.isContentLoadingSubject.next(true)),
          switchMap(() => zip([this.loadTotal$(), this.loadData$(true)])),
          takeUntil(this.destroy$)
        )
        .subscribe(() => {
          this.appService.isContentLoadingSubject.next(false);
        });
    });
  }

  loadData(resetPage = false) {
    this.appService.isContentLoadingSubject.next(true);

    this.loadData$(resetPage).subscribe(() => {
      this.appService.isContentLoadingSubject.next(false);
    });
  }

  loadData$(resetPage = false) {
    resetPage && (this.paginator.page = 1);
    return this.api
      .getNegativeClearList({
        uid: this.uid,
        page: this.paginator.page,
        pageSize: this.paginator.pageSize,
        category: this.type || undefined,
        tenantId: this.subHeaderService.merchantCurrentId,
        startTime: toDateStamp(this.time[0]),
        endTime: toDateStamp(this.time[1], true),
      })
      .pipe(
        tap((res) => {
          this.list = Array.isArray(res.list) ? res.list : [];
          this.paginator.total = res?.total || 0;
        })
      );
  }

  loadTotal() {
    this.appService.isContentLoadingSubject.next(true);
    this.loadTotal$().subscribe(() => {
      this.appService.isContentLoadingSubject.next(false);
    });
  }

  loadTotal$() {
    const params = { category: this.type, tenantId: this.subHeaderService.merchantCurrentId };

    return zip([this.api.todayTotal(params), this.api.historyTotal(params)]).pipe(
      tap(([todayTotal, historyTotal]) => {
        this.historyTotal = historyTotal;
        this.todayTotal = todayTotal;
      })
    );
  }

  onReset() {
    this.uid = '';
    this.time = [];
    this.type = this.typeList[0].key;
    this.loadData(true);
  }

  openView(temp, item) {
    this.modal = this.modalService.open(temp, { centered: true });
    this.updateData = { orderId: item.orderId };
    item.category === 'NegativeClear' ? (this.isNegativeClear = true) : (this.isNegativeClear = false);
  }

  closeModal() {
    this.modal.close();
  }

  /** 已拒绝 */
  // updateStatusRejected() {
  //   this.updateData = { ...this.updateData, status: 'Rejected' };
  //   this.appService.isContentLoadingSubject.next(true);
  //   if (this.isNegativeClear) {
  //     this.api.updatenegativeclearstatus(this.updateData).subscribe((res) => {
  //       if (res) {
  //         this.closeModal();
  //         this.loadData();
  //         this.appService.isContentLoadingSubject.next(false);
  //       }
  //     });
  //   } else {
  //     this.api.updateStatus(this.updateData).subscribe((res) => {
  //       if (res) {
  //         this.closeModal();
  //         this.loadData();
  //         this.appService.isContentLoadingSubject.next(false);
  //       }
  //     });
  //   }
  // }

  /** 状态改变 */
  updateStatus(status) {
    this.updateData = { ...this.updateData, status };
    this.appService.isContentLoadingSubject.next(true);
    if (this.isNegativeClear) {
      this.api.updatenegativeclearstatus(this.updateData).subscribe((res) => {
        if (res) {
          this.closeModal();
          this.loadData();
          this.appService.isContentLoadingSubject.next(false);
        }
      });
    } else {
      this.api.updateStatus(this.updateData).subscribe((res) => {
        if (res) {
          this.closeModal();
          this.loadData();
          this.appService.isContentLoadingSubject.next(false);
        }
      });
    }
  }

  /** 类别 */
  onType() {
    this.appService.isContentLoadingSubject.next(true);
    zip([this.loadTotal$(), this.loadData$(true)]).subscribe(() => this.appService.isContentLoadingSubject.next(false));
  }
}
