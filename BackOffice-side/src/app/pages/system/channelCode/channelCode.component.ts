import { Component, OnInit } from '@angular/core';
import { takeUntil } from 'rxjs';
import { AppService } from 'src/app/app.service';
import { SubHeaderService } from 'src/app/_metronic/partials/layout/subheader/subheader1/sub-header.service';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { NgFor, NgIf } from '@angular/common';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { DestroyService } from 'src/app/shared/models/tools.model';
import { MemberApi } from 'src/app/shared/api/member.api';
import { FormValidator } from 'src/app/shared/form-validator';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { updateChannelCodeParams } from 'src/app/shared/interfaces/system.interface';
import { OwlDateTimeComponent } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker.component';
import { OwlDateTimeTriggerDirective } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker-trigger.directive';
import { OwlDateTimeInputDirective } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker-input.directive';
import { toDateStamp } from 'src/app/shared/models/tools.model';
import { EmptyComponent } from 'src/app/shared/components/empty/empty.component';
import moment from 'moment';
@Component({
  selector: 'app-channelCodeComponent',
  templateUrl: './channelCode.component.html',
  styleUrls: ['./channelCode.component.scss'],
  providers: [DestroyService],
  standalone: true,
  imports: [
    FormRowComponent,
    MatFormFieldModule,
    MatSelectModule,
    FormsModule,
    MatOptionModule,
    NgFor,
    NgIf,
    LangPipe,
    ReactiveFormsModule,
    OwlDateTimeInputDirective,
    OwlDateTimeTriggerDirective,
    OwlDateTimeComponent,
    EmptyComponent,
  ],
})
export class ChannelCodeComponent implements OnInit {
  constructor(
    private appService: AppService,
    private memberApi: MemberApi,
    public subHeaderService: SubHeaderService,
    private destroy$: DestroyService,
    private fb: FormBuilder
  ) {}

  formGroup: FormGroup = this.fb.group({});
  validator!: FormValidator;
  isLoading = false;
  time = [] as Date[];
  list: string[] = [];

  ngOnInit() {
    this.subHeaderService.merchantId$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.onReset();
    });
    this.loadForm();
  }

  loadForm(): void {
    this.formGroup = this.fb.group({
      channel: ['MyAffiliate'],
      referralCode: ['', Validators.required],
      uidCollection: ['', Validators.required],
      time: [
        [
          new Date(toDateStamp(moment().subtract(1, 'week').startOf('isoWeek').toDate())!),
          new Date(toDateStamp(moment().subtract(1, 'week').endOf('isoWeek').toDate())!),
        ],
      ],
    });
    this.validator = new FormValidator(this.formGroup);
    this.formGroup.get('channel')?.disable();
  }

  loading(v: boolean): void {
    this.isLoading = v;
    this.appService.isContentLoadingSubject.next(v);
  }

  onReset() {
    this.formGroup.patchValue({
      referralCode: '',
      uidCollection: '',
    });
  }

  submit() {
    const params: updateChannelCodeParams = {
      type: 'MyAffiliate',
      inviteCode: this.formGroup.value.referralCode,
      uidList: this.formGroup.value.uidCollection,
    };
    this.formGroup.markAllAsTouched(); // 手动执行验证
    if (this.formGroup.invalid) return;
    this.loading(true);
    this.memberApi.updateCreateChannel(params).subscribe((res) => {
      this.appService.showToastSubject.next({
        msgLang: res ? 'common.updateCompleted' : 'common.updateFailed',
        successed: res,
      });
      this.loading(false);
    });
  }

  testing() {
    // 后端要求传递时间只要日期不需要时间
    const beginTime = this.formGroup.value.time?.[0]
      ? moment(new Date(this.formGroup.value.time[0])).format('YYYY-M-D')
      : '0';
    const endTime = this.formGroup.value.time?.[1]
      ? moment(new Date(this.formGroup.value.time[1])).format('YYYY-M-D')
      : '0';

    this.loading(true);
    this.memberApi
      .checkMaUidList({
        beginTime,
        endTime,
      })
      .subscribe((res) => {
        this.list = res;
        this.loading(false);
      });
  }

  timeChange() {
    if (!this.timeChecking()) {
      this.formGroup.patchValue({
        time: [
          new Date(toDateStamp(moment().subtract(1, 'week').startOf('isoWeek').toDate())!),
          new Date(toDateStamp(moment().subtract(1, 'week').endOf('isoWeek').toDate())!),
        ],
      });
      return this.appService.showToastSubject.next({ msgLang: 'form.chooseDayTime', msgArgs: { n: 7 } });
    }
  }

  /**
   * 时间检测
   */
  timeChecking() {
    const maxDay = 7;
    // 没有时间范围
    if (!(this.formGroup.value.time?.[0] && this.formGroup.value.time?.[1])) return false;
    const start = toDateStamp(this.formGroup.value.time[0], false);
    const end = toDateStamp(this.formGroup.value.time[1], true);
    if (Math.abs(moment(start).diff(end, 'days')) > maxDay) return false;
    return true;
  }
}
