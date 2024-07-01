import { Component, OnInit } from '@angular/core';
import { PageSizes, PaginatorState } from 'src/app/_metronic/shared/crud-table';
import { AppService } from 'src/app/app.service';
import { AgentApi } from 'src/app/shared/api/agent.api';
import { forkJoin } from 'rxjs';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatModalContent, MatModalRef, MatModalTitle } from 'src/app/shared/components/dialogs/modal';
import { ProxyService } from 'src/app/pages/proxy/proxy.service';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { FormatMoneyPipe } from 'src/app/shared/pipes/big-number.pipe';
import { TimeFormatPipe } from 'src/app/shared/pipes/time.pipe';
import { PaginatorComponent } from 'src/app/_metronic/shared/crud-table/components/paginator/paginator.component';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import {
  SelectChildrenDirective,
  SelectDirective,
  SelectGroupDirective,
  SelectTplDirective,
} from 'src/app/shared/directive/select.directive';
import { AngularSvgIconModule } from 'angular-svg-icon';

@Component({
  templateUrl: './proxy-transfer.component.html',
  styleUrls: ['./proxy-transfer.component.scss'],
  standalone: true,
  imports: [
    AngularSvgIconModule,
    SelectChildrenDirective,
    SelectTplDirective,
    NgIf,
    FormRowComponent,
    MatFormFieldModule,
    MatSelectModule,
    FormsModule,
    ReactiveFormsModule,
    NgFor,
    MatOptionModule,
    SelectGroupDirective,
    SelectDirective,
    PaginatorComponent,
    AsyncPipe,
    TimeFormatPipe,
    FormatMoneyPipe,
    LangPipe,
    MatModalTitle,
    MatModalContent,
  ],
})
export class ProxyTransferComponent implements OnInit {
  constructor(
    public modal: MatModalRef<ProxyTransferComponent, boolean>,
    public appService: AppService,
    public api: AgentApi,
    public proxyService: ProxyService
  ) {}

  pageSizes: number[] = PageSizes; // 页大小
  paginator: PaginatorState = new PaginatorState(); // 分页
  list: any[] = [];
  managerList: any[] = [];

  channelManager = new FormControl('', [Validators.required]);

  /** getters */
  get checkedList() {
    return this.list.filter((item) => item.checked);
  }

  /** lifeCycle */
  ngOnInit(): void {
    forkJoin([this.api.group_getrelationbyuser(this.proxyService.curTeamId)]).subscribe(([manager]) => {
      // groupName	团队名称	string
      // id	团队id	integer(int64)
      // userId	渠道经理id	integer(int64)
      // userName	渠道经理名称	string
      this.managerList = manager?.data || [];
    });
  }

  /** methods */
  loadData(): void {}

  onSubmit(): void {
    if (!this.checkedList.length) return this.appService.showToastSubject.next({ msg: '请选择转移的代理' });

    this.channelManager.markAllAsTouched();
    if (this.channelManager.invalid) return;

    this.appService.isContentLoadingSubject.next(true);
    this.api
      .transfer({
        channelManager: this.channelManager.value,
        uidList: this.checkedList.map((item) => item.proxyId),
      })
      .subscribe((res) => {
        this.appService.isContentLoadingSubject.next(false);

        if (res.code === 0) {
          this.appService.showToastSubject.next({
            msg: '转移成功！',
            successed: true,
          });
          this.modal.close(true);
        } else {
          this.appService.showToastSubject.next({
            msg: '转移失败！',
            successed: false,
          });
        }
      });
  }

  toInt(state: any) {
    return Math.abs(state);
  }
}
