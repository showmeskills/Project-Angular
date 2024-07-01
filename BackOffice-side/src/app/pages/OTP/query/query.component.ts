import { Component, inject, OnInit } from '@angular/core';
import { finalize, forkJoin, takeUntil } from 'rxjs';
import { AppService } from 'src/app/app.service';
import { OtpManageApi } from 'src/app/shared/api/otp-manage.api';
import { SubHeaderService } from 'src/app/_metronic/partials/layout/subheader/subheader1/sub-header.service';
import { PageSizes, PaginatorState } from 'src/app/_metronic/shared/crud-table';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { TimeFormatPipe } from 'src/app/shared/pipes/time.pipe';
import { PaginatorComponent } from 'src/app/_metronic/shared/crud-table/components/paginator/paginator.component';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { OwlDateTimeComponent } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker.component';
import { OwlDateTimeTriggerDirective } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker-trigger.directive';
import { OwlDateTimeInputDirective } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker-input.directive';
import { NgFor, NgIf, AsyncPipe } from '@angular/common';
import { MatOptionModule } from '@angular/material/core';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { CodeDescription } from 'src/app/shared/interfaces/base.interface';
import { OTPItem } from 'src/app/shared/interfaces/system.interface';
import { DestroyService } from 'src/app/shared/models/tools.model';

@Component({
  selector: 'OTP-list',
  templateUrl: './query.component.html',
  styleUrls: ['./query.component.scss'],
  standalone: true,
  imports: [
    FormRowComponent,
    MatFormFieldModule,
    MatSelectModule,
    FormsModule,
    MatOptionModule,
    NgFor,
    OwlDateTimeInputDirective,
    OwlDateTimeTriggerDirective,
    OwlDateTimeComponent,
    NgIf,
    AngularSvgIconModule,
    PaginatorComponent,
    TimeFormatPipe,
    LangPipe,
    AsyncPipe,
  ],
  providers: [DestroyService],
})
export class QueryComponent implements OnInit {
  pageSizes: number[] = PageSizes; // 页大小
  paginator: PaginatorState = new PaginatorState(); // 分页

  public appService = inject(AppService);
  private otpManageApi = inject(OtpManageApi);
  public subHeaderService = inject(SubHeaderService);
  private _destroyed = inject(DestroyService);

  isLoading = false;

  // 头部筛选
  mobileNo = ''; // 手机号
  time: Date[] = []; // 时间区间
  typeList: CodeDescription[] = []; // 服务商
  selectedType = ''; // 当前选中的服务商

  // 页面数据
  list: OTPItem[] = [];

  ngOnInit() {
    // this.paginator.pageSize = 10;
    this.subHeaderService.merchantId$.pipe(takeUntil(this._destroyed)).subscribe(() => {
      this.loadData(true);
    });

    this.getInitData();
  }

  // 获取筛选数据
  getInitData() {
    this.loading(true);
    forkJoin([this.otpManageApi.getIpsSelect()]).subscribe(([typeData]) => {
      this.loading(false);

      this.typeList = typeData || [];
    });
  }

  // 获取页面渲染数据
  loadData(resetPage = false) {
    resetPage && (this.paginator.page = 1);
    // 没有商户
    if (!this.subHeaderService.merchantCurrentId) return this.loading(false);

    this.loading(true);
    const param = {
      TenantId: this.subHeaderService.merchantCurrentId,
      IpsCode: this.selectedType,
      MobileNo: this.mobileNo,
      ...(this.time[0] ? { SendStartTime: +String(+this.time[0]).slice(0, -3) } : {}),
      ...(this.time[1] ? { SendEndTime: +String(+this.time[1]).slice(0, -3) } : {}),
      Page: this.paginator.page,
      PageSize: this.paginator.pageSize,
    };
    this.otpManageApi
      .getList(param)
      .pipe(finalize(() => this.loading(false)))
      .subscribe((data) => {
        this.list = data.list;
        this.paginator.total = data.total;
      });
  }

  // 加载状态
  loading(v: boolean): void {
    this.isLoading = v;
    this.appService.isContentLoadingSubject.next(v);
  }

  onSearch() {
    this.paginator.page = 1;
    this.loadData();
  }

  onReset() {
    this.mobileNo = '';
    this.time = [];
    this.selectedType = '';
    this.paginator.page = 1;
  }
}
