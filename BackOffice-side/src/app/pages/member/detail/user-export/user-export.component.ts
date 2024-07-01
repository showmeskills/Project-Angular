import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalTitleComponent } from 'src/app/shared/components/dialogs/modal/modal-title.component';
import {
  DismissCloseDirective,
  ModalFooterComponent,
} from 'src/app/shared/components/dialogs/modal/modal-footer.component';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { FormBuilder, FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { OwlDateTimeComponent } from 'src/app/components/datetime-picker';
import { OwlDateTimeInputDirective } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker-input.directive';
import { OwlDateTimeTriggerDirective } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker-trigger.directive';
import { MatDatepicker, MatDatepickerModule } from '@angular/material/datepicker';
import moment, { Moment } from 'moment/moment';
import { MatInputModule } from '@angular/material/input';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { MatModal, MatModalRef } from 'src/app/shared/components/dialogs/modal';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { AppService } from 'src/app/app.service';
import { CheckboxArrayControlDirective } from 'src/app/shared/directive/input.directive';
import { MemberApi } from 'src/app/shared/api/member.api';
import { MemberExportParams, MemberExportTimeType } from 'src/app/shared/interfaces/member.interface';
import { JSONToExcelDownload } from 'src/app/shared/models/tools.model';
import { ExportPreviewComponent } from 'src/app/pages/member/detail/user-export/export-preview/export-preview.component';

const MY_FORMATS = {
  parse: {
    dateInput: 'YYYY-MM',
  },
  display: {
    dateInput: 'YYYY-MM',
    monthYearLabel: 'YYYY MMM',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'YYYY MMMM',
  },
};

@Component({
  selector: 'user-export',
  standalone: true,
  imports: [
    CommonModule,
    ModalTitleComponent,
    ModalFooterComponent,
    LangPipe,
    FormsModule,
    FormRowComponent,
    OwlDateTimeComponent,
    OwlDateTimeInputDirective,
    OwlDateTimeTriggerDirective,
    MatDatepickerModule,
    ReactiveFormsModule,
    MatInputModule,
    AngularSvgIconModule,
    DismissCloseDirective,
    CheckboxArrayControlDirective,
  ],
  templateUrl: './user-export.component.html',
  styleUrls: ['./user-export.component.scss'],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
    },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
    { provide: MAT_DATE_LOCALE, useValue: 'zh-CN' },
  ],
  encapsulation: ViewEncapsulation.None,
})
export class UserExportComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    public modal: MatModalRef<UserExportComponent>,
    public lang: LangService,
    private appService: AppService,
    private api: MemberApi,
    private modalService: MatModal
  ) {}

  uid = '';
  tenantId = '';

  protected TimeType = MemberExportTimeType;

  data = {
    timeType: MemberExportTimeType.Day,
    dayTime: [],
    yearTime: new FormControl([] as Moment[]),
  };

  yearList = [
    { name: '今年', value: moment() },
    { name: '去年', value: moment().subtract('1', 'y') },
  ];

  today = new Date();

  monthFG = this.fb.group({
    start: [moment()],
    end: [moment()],
  });

  dayMin = moment().subtract(1, 'month').add(1, 'day').hours(0).minute(0).seconds(0).millisecond(0).toDate();
  dayMax = moment().toDate();

  monthMin = moment().subtract(1, 'year').add(1, 'month');
  monthMax = moment();

  ngOnInit(): void {}

  setMonthAndYear(normalizedMonthAndYear: Moment, datepicker: MatDatepicker<Moment>, control: FormControl<Moment>) {
    const ctrlValue = control.value!;
    ctrlValue.month(normalizedMonthAndYear.month());
    ctrlValue.year(normalizedMonthAndYear.year());
    control.setValue(ctrlValue);
    datepicker.close();
  }

  /**
   * 提交
   */
  onSubmit(isPreview?: boolean) {
    const sendData: MemberExportParams = {
      startYear: 0,
      endYear: 0,
      startMonth: 0,
      endMonth: 0,
      startDay: 0,
      endDay: 0,
      uid: this.uid,
      requestCategory: this.data.timeType,
      exportYear: this.data.yearTime.value!.map((e) => e.get('year')),
    };
    let time: Moment[] = [];

    switch (this.data.timeType) {
      case MemberExportTimeType.Day:
        if (!(this.data.dayTime[0] && this.data.dayTime[1])) {
          return this.appService.showToastSubject.next({ msgLang: 'member.detail.statementDayTips' });
        }
        time = this.data.dayTime.map((e) => moment(e));
        break;
      case MemberExportTimeType.Month:
        if (!(this.monthFG.value.start && this.monthFG.value.end)) {
          return this.appService.showToastSubject.next({ msgLang: 'member.detail.statementMonthTips' });
        } else if (this.monthFG.value.start > this.monthFG.value.end) {
          return this.appService.showToastSubject.next({ msgLang: 'member.detail.statementMonthEndTips' });
        }
        time = [this.monthFG.value.start, this.monthFG.value.end].filter((e) => e);
        break;
      case MemberExportTimeType.Year:
        if (!this.data.yearTime.value!.length) {
          return this.appService.showToastSubject.next({ msgLang: 'member.detail.statementYearTips' });
        }
        time = this.data.yearTime.value!.map((e) => e.startOf('year'));
        break;
    }

    if (time.length >= 2) {
      sendData.startYear = time[0].get('year');
      sendData.startMonth = time[0].get('month') + 1;
      sendData.startDay = time[0].get('date');
      sendData.endYear = time[1].get('year');
      sendData.endMonth = time[1].get('month') + 1;
      sendData.endDay = time[1].get('date');
    }

    this.appService.isContentLoadingSubject.next(true);
    this.api.getStatement(sendData).subscribe(async (res) => {
      this.appService.isContentLoadingSubject.next(false);

      const date = await this.lang.getOne('member.detail.date'); // 日期
      const totalDeposit = await this.lang.getOne('member.detail.totalDeposit'); // 总存款
      const totalWithdrawals = await this.lang.getOne('member.detail.totalWithdrawals'); // 总提款
      const ggr = 'GGR'; // ngr & ggr
      const totalBonus = await this.lang.getOne('member.detail.totalBonus'); // 总红利
      const betAmount = await this.lang.getOne('member.detail.betAmount'); // 投注金额

      const listArr = res.map((e) => ({
        [date]: e.date === 'Grand Total' && this.lang.isLocal ? '总计' : e.date,
        [totalDeposit + '(USDT)']: e.totalDesposit,
        [totalWithdrawals + '(USDT)']: e.totalWithdrawals,
        [ggr + '(USDT)']: e.ggr,
        [betAmount + '(USDT)']: e.betAmount,
        [totalBonus + '(USDT)']: e.totalBonus,
      }));

      if (!listArr.length) {
        return this.appService.showToastSubject.next({
          msgLang: 'common.emptyText',
          successed: false,
        });
      }

      if (isPreview) {
        this.preview(listArr);
      } else {
        JSONToExcelDownload(listArr, 'memberStatement-' + this.uid + ' ' + Date.now());
        this.modal.close();
      }
    });
  }

  /**
   * 预览
   */
  preview(list: any[]) {
    const modal = this.modalService.open(ExportPreviewComponent, { width: '800px' });
    modal.componentInstance.list = list;
  }
}
