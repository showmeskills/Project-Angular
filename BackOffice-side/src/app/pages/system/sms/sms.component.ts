import { Component, OnInit } from '@angular/core';
import { finalize, lastValueFrom, takeUntil } from 'rxjs';
import { AppService } from 'src/app/app.service';
import { SubHeaderService } from 'src/app/_metronic/partials/layout/subheader/subheader1/sub-header.service';
import { PageSizes, PaginatorState } from 'src/app/_metronic/shared/crud-table';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { TimeFormatPipe } from 'src/app/shared/pipes/time.pipe';
import { PaginatorComponent } from 'src/app/_metronic/shared/crud-table/components/paginator/paginator.component';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { OwlDateTimeComponent } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker.component';
import { OwlDateTimeTriggerDirective } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker-trigger.directive';
import { OwlDateTimeInputDirective } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker-input.directive';
import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { MatOptionModule } from '@angular/material/core';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { SystemLogApi } from 'src/app/shared/api/system-log.api';
import { SMSEmailDto, SMSEmailItem, SMSEmailTypeItem } from 'src/app/shared/interfaces/system.interface';
import { DestroyService, JSONToExcelDownload, timeFormat, toDateStamp } from 'src/app/shared/models/tools.model';
import { EmptyComponent } from 'src/app/shared/components/empty/empty.component';
import { cloneDeep } from 'lodash';
import moment from 'moment';
import { LangService } from 'src/app/shared/components/lang/lang.service';

@Component({
  selector: 'app-sms',
  templateUrl: './sms.component.html',
  styleUrls: ['./sms.component.scss'],
  providers: [DestroyService],
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
    EmptyComponent,
    AsyncPipe,
  ],
})
export class SmsComponent implements OnInit {
  pageSizes: number[] = PageSizes;
  paginator: PaginatorState = new PaginatorState();

  constructor(
    public appService: AppService,
    private systemLogApi: SystemLogApi,
    public subHeaderService: SubHeaderService,
    private lang: LangService,
    private destroy$: DestroyService
  ) {}

  dataEmpty = {
    verifyType: '',
    uid: '',
    mobileNo: '',
    time: [],
    selectedType: '' as SMSEmailDto,
    sendType: '',
  };

  data = cloneDeep(this.dataEmpty);

  isLoading = false;
  verifyTypeList = [
    { value: '', lang: 'common.all' },
    { value: 'Mobile', lang: 'system.sms.phoneNumber' },
    { value: 'Email', lang: 'system.sms.email' },
  ];

  typeList: SMSEmailTypeItem[] = [];
  list: SMSEmailItem[] = [];

  ngOnInit() {
    this.subHeaderService.merchantId$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.onReset();
    });

    this.getInitData();
  }

  /** 获取操作类型 */
  getInitData() {
    this.loading(true);
    this.systemLogApi.getOtpTypeList().subscribe((res) => {
      this.typeList = res || [];
      this.loading(false);
    });
  }

  /** 获取页面渲染数据 */
  loadData(resetPage = false) {
    resetPage && (this.paginator.page = 1);
    // 没有商户
    if (!this.subHeaderService.merchantCurrentId) return this.loading(false);

    this.loading(true);
    this.loadData$().subscribe((data) => {
      this.list = data.list;
      this.paginator.total = data.total;
    });
  }

  loadData$(sendData?) {
    return this.systemLogApi
      .getOtplogList({
        TenantId: this.subHeaderService.merchantCurrentId,
        OtpCategory: this.data.verifyType,
        Uid: this.data.uid,
        SendNumber: this.data.mobileNo,
        OtpType: this.data.selectedType,
        StartTime: toDateStamp(this.data.time[0], false) || 0,
        EndTime: toDateStamp(this.data.time[1], true) || 0,
        Status: this.data.sendType,
        Page: this.paginator.page,
        PageSize: this.paginator.pageSize,
        ...sendData,
      })
      .pipe(finalize(() => this.loading(false)));
  }

  loading(v: boolean): void {
    this.isLoading = v;
    this.appService.isContentLoadingSubject.next(v);
  }

  onReset() {
    this.data = cloneDeep(this.dataEmpty);
    this.loadData(true);
  }

  /**
   * 导出
   */
  async onExport(isAll: boolean) {
    let list: SMSEmailItem[] = [];
    if (isAll) {
      const maxDay = 3;
      const thrErr = () =>
        this.appService.showToastSubject.next({ msgLang: 'form.chooseDayTime', msgArgs: { n: maxDay } });

      // 比较时间是否超过 maxDay 天
      if (!(this.data.time?.[0] && this.data.time?.[1])) return thrErr();

      const start = toDateStamp(this.data.time[0], false);
      const end = toDateStamp(this.data.time[1], true);
      if (Math.abs(moment(start).diff(end, 'days')) > maxDay) return thrErr();

      try {
        this.appService.isContentLoadingSubject.next(true);
        const res = await lastValueFrom(this.loadData$({ PageSize: 9e6 }));
        this.appService.isContentLoadingSubject.next(false);
        list = Array.isArray(res?.list) ? res.list : []; // success === false会自动抛出
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
  async exportExcel(list: SMSEmailItem[]) {
    if (!list?.length) return;

    const verifyType = await this.lang.getOne('system.sms.verifyType'); // 验证类型
    const uid = 'UID'; // UID
    const operationType = await this.lang.getOne('system.sms.operationType'); // 操作类型
    const phoneEmail = await this.lang.getOne('system.sms.phoneEmail'); // 手机号/邮箱
    const sendTime = await this.lang.getOne('otp.sendTime'); // 发送时间
    const sendStatus = await this.lang.getOne('otp.sendStatus'); // 发送状态
    const reasonFailure = await this.lang.getOne('system.sms.reasonFailure'); // 失败原因

    const exportList = list.map((e) => ({
      [verifyType]: e.otpCategory || '-',
      [uid]: e.uid,
      [operationType]: e.otpType,
      [phoneEmail]: e.sendNumber,
      [sendTime]: timeFormat(e.createdTime),
      [sendStatus]: e.status,
      [reasonFailure]: e.failReason || '-',
    }));

    JSONToExcelDownload(exportList, 'sms-email-record ' + Date.now());
  }
}
