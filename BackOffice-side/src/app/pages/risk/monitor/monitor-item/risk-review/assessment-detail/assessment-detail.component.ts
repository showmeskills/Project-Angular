import { Component, OnInit, Input } from '@angular/core';
import { AppService } from 'src/app/app.service';
import { MatModalRef } from 'src/app/shared/components/dialogs/modal';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { MonitorApi } from 'src/app/shared/api/monitor.api';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { CurrencyValuePipe } from 'src/app/shared/pipes/currency-value.pipe';
import { TimeFormatPipe } from 'src/app/shared/pipes/time.pipe';
import { FormsModule } from '@angular/forms';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { NgIf, NgFor } from '@angular/common';
import { ModalTitleComponent } from 'src/app/shared/components/dialogs/modal/modal-title.component';

@Component({
  selector: 'app-assessment-detail',
  templateUrl: './assessment-detail.component.html',
  styleUrls: ['./assessment-detail.component.scss'],
  standalone: true,
  imports: [
    ModalTitleComponent,
    NgIf,
    FormRowComponent,
    NgFor,
    FormsModule,
    TimeFormatPipe,
    CurrencyValuePipe,
    LangPipe,
  ],
})
export class AssessmentDetailComponent implements OnInit {
  constructor(
    public modal: MatModalRef<AssessmentDetailComponent>,
    private appService: AppService,
    public lang: LangService,
    private api: MonitorApi
  ) {}

  @Input() data: any;
  auditList: any[] = [
    { name: '通过', lang: 'risk.passing', value: 'Finish' },
    { name: '不通过', lang: 'risk.noPass', value: 'Rejected' },
  ];

  isLoading = false;

  audit: any = 'Finish';
  remark: any = '';
  processState = 1;
  ngOnInit() {}

  /**审核风控问卷 */
  review() {
    if (this.audit === 'Rejected' && !this.remark) {
      this.appService.showToastSubject.next({
        msgLang: 'risk.fillRemarks', // 备注为必填项
        successed: false,
      });
      return;
    }
    if (this.data?.status === 'Pending') {
      this.loading(true);
      this.api.auditRiskForm({ id: this.data.id, status: this.audit, remark: this.remark }).subscribe((res) => {
        this.appService.showToastSubject.next({
          msgLang: res ? 'risk.suc' : 'risk.fail', //发起验证提示语
          successed: res,
        });
        this.loading(false);
        this.modal.close(true);
      });
    } else {
      this.modal.close();
    }
  }

  /** 加载状态 */
  loading(v: boolean): void {
    this.isLoading = v;
    this.appService.isContentLoadingSubject.next(v);
  }
}
