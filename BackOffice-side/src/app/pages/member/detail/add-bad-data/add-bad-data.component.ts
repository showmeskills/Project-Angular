import { Component, OnInit, ViewEncapsulation, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalTitleComponent } from 'src/app/shared/components/dialogs/modal/modal-title.component';
import {
  DismissCloseDirective,
  ModalFooterComponent,
} from 'src/app/shared/components/dialogs/modal/modal-footer.component';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { OwlDateTimeComponent } from 'src/app/components/datetime-picker';
import { OwlDateTimeInputDirective } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker-input.directive';
import { OwlDateTimeTriggerDirective } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker-trigger.directive';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { MatModal, MatModalRef } from 'src/app/shared/components/dialogs/modal';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { AppService } from 'src/app/app.service';
import { CheckboxArrayControlDirective } from 'src/app/shared/directive/input.directive';
import { MemberApi } from 'src/app/shared/api/member.api';
import { SubHeaderService } from 'src/app/_metronic/partials/layout/subheader/subheader1/sub-header.service';

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
  selector: 'add-bad-data',
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
  templateUrl: './add-bad-data.component.html',
  styleUrls: ['./add-bad-data.component.scss'],
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
export class AddBadDataComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    public modal: MatModalRef<AddBadDataComponent>,
    public lang: LangService,
    private appService: AppService,
    private api: MemberApi,
    private modalService: MatModal,
    public subHeaderService: SubHeaderService
  ) {}

  @Input() uid = '';
  @Input() tenantId = '';

  data = {
    type: 'IP',
    email: '',
    ip: '',
    fingerprint: '',
    comment: '',
    value: '',
    brand: null,
  };

  @Input() userDetailsInfo: any;

  ngOnInit(): void {
    this.subHeaderService.loadMerchant(true);
    this.data.ip = this.userDetailsInfo?.lastLoginInfo?.ip;
    this.data.email = this.userDetailsInfo.email;
    this.data.fingerprint = this.userDetailsInfo?.fingerprint;
  }

  /**
   * 提交
   */
  onSubmit() {
    let value;
    switch (this.data.type) {
      case 'IP':
        value = this.data.ip;
        break;
      case 'Email':
        value = this.data.email;
        break;
      case 'Fingerprint':
        value = this.data.fingerprint;
        break;
    }

    if (!this.data.comment || !value) {
      return this.appService.showToastSubject.next({ msgLang: 'form.formInvalid' });
    }

    this.appService.isContentLoadingSubject.next(true);
    this.api
      .addmemberbaddata({
        uid: this.uid,
        tenantId: +this.tenantId,
        brand: this.tenantId,
        type: this.data.type,
        value: value,
        comment: this.data.comment,
      })
      .subscribe(async (res) => {
        this.appService.isContentLoadingSubject.next(false);
        if (res === true) this.modal.close(true);
        this.appService.toastOpera(res === true);
      });
  }
}
