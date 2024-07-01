import { Component, OnInit } from '@angular/core';
import { AgentApi } from 'src/app/shared/api/agent.api';
import { AppService } from 'src/app/app.service';
import { FormControl, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ProxyService } from 'src/app/pages/proxy/proxy.service';
import { MatModalRef } from 'src/app/shared/components/dialogs/modal';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { TimeFormatPipe } from 'src/app/shared/pipes/time.pipe';
import { MatOptionModule } from '@angular/material/core';
import { NgFor, NgIf } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { AngularSvgIconModule } from 'angular-svg-icon';
@Component({
  selector: 'distribute-manager',
  templateUrl: './distribute-manager.component.html',
  styleUrls: ['./distribute-manager.component.scss'],
  standalone: true,
  imports: [
    AngularSvgIconModule,
    FormRowComponent,
    MatFormFieldModule,
    MatSelectModule,
    FormsModule,
    ReactiveFormsModule,
    NgFor,
    MatOptionModule,
    NgIf,
    TimeFormatPipe,
    LangPipe,
  ],
})
export class DistributeManagerComponent implements OnInit {
  constructor(
    public modal: MatModalRef<any>,
    private api: AgentApi,
    private appService: AppService,
    private proxyService: ProxyService,
    public lang: LangService
  ) {}

  data: any = {};
  managerList: any[] = [];
  curManager = new FormControl('', [Validators.required]);

  ngOnInit(): void {
    this.api.group_getrelationbyuser(this.proxyService.curTeamId).subscribe((res) => {
      this.managerList = res?.data || [];
    });
  }

  // 分配经理
  submit(): void {
    this.curManager.markAllAsTouched();
    if (this.curManager.invalid) return;

    this.appService.isContentLoadingSubject.next(true);
    this.api
      .auditTransfer({
        channelManager: this.curManager.value,
        uid: this.data.proxyId,
      })
      .subscribe((res) => {
        this.appService.isContentLoadingSubject.next(false);
        this.proxyService.triggerChange(); // 更新一次头部统计数据

        if (res?.data === true) {
          this.appService.showToastSubject.next({
            msgLang: 'marketing.pendingList.allocationSuc',
            successed: true,
          });
          this.modal.close(true);
        } else {
          this.appService.showToastSubject.next({
            msgLang: 'marketing.pendingList.allocationFail',
            successed: false,
          });
        }
      });
  }
}
