import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { cloneDeep } from 'lodash';
import { takeUntil } from 'rxjs';
import { SubHeaderService } from 'src/app/_metronic/partials/layout/subheader/subheader1/sub-header.service';
import { PageSizes, PaginatorState } from 'src/app/_metronic/shared/crud-table';
import { PaginatorComponent } from 'src/app/_metronic/shared/crud-table/components/paginator/paginator.component';
import { AppService } from 'src/app/app.service';
import { OwlDateTimeModule } from 'src/app/components/datetime-picker';
import { EmptyComponent } from 'src/app/shared/components/empty/empty.component';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { DestroyService, toDateStamp } from 'src/app/shared/models/tools.model';
import { TimeFormatPipe } from 'src/app/shared/pipes/time.pipe';
import { AgentTransferAddPopupComponent } from './add-popup/add-popup.component';
import { MatModal } from 'src/app/shared/components/dialogs/modal';
import { AgentApi } from 'src/app/shared/api/agent.api';
import moment from 'moment';
import { AgentTransferItem } from 'src/app/shared/interfaces/agent';

@Component({
  selector: 'system-agent-transfer',
  templateUrl: './agent-transfer.component.html',
  styleUrls: ['./agent-transfer.component.scss'],
  providers: [DestroyService],
  standalone: true,
  imports: [
    CommonModule,
    FormRowComponent,
    MatFormFieldModule,
    MatSelectModule,
    FormsModule,
    MatOptionModule,
    PaginatorComponent,
    TimeFormatPipe,
    LangPipe,
    OwlDateTimeModule,
    EmptyComponent,
    AngularSvgIconModule,
  ],
})
export class AgentTransferComponent implements OnInit {
  constructor(
    public subHeaderService: SubHeaderService,
    private destroy$: DestroyService,
    public appService: AppService,
    private api: AgentApi,
    private modal: MatModal
  ) {}

  /** 页大小 */
  pageSizes: number[] = PageSizes;

  /** 分页 */
  paginator: PaginatorState = new PaginatorState();

  dataEmpty = {
    uid: '', // UID
    time: [] as Date[], // 时间
  };

  data = cloneDeep(this.dataEmpty);

  /** 列表数据 */
  list: AgentTransferItem[] = [];

  ngOnInit() {
    this.subHeaderService.merchantId$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.onReset();
    });
  }

  loadData(resetPage = false) {
    resetPage && (this.paginator.page = 1);

    const parmas = {
      tenantId: this.subHeaderService.merchantCurrentId,
      uid: this.data.uid,
      ...(this.data.time[0]
        ? {
            startTime: moment(Number(toDateStamp(this.data.time[0]))).format('YYYY-MM-DD HH:mm:ss'),
          }
        : {}),
      ...(this.data.time[1]
        ? {
            endTime: moment(Number(toDateStamp(this.data.time[1], true))).format('YYYY-MM-DD HH:mm:ss'),
          }
        : {}),
      current: this.paginator.page,
      size: this.paginator.pageSize,
    };

    this.appService.isContentLoadingSubject.next(true);
    this.api.user_transform_list(parmas).subscribe((res) => {
      this.appService.isContentLoadingSubject.next(false);
      this.list = Array.isArray(res?.data?.records) ? res.data.records : [];
      this.paginator.total = res?.data?.total || 0;
    });
  }

  /** 筛选 - 重置 */
  onReset() {
    this.data = cloneDeep(this.dataEmpty);
    this.loadData(true);
  }

  /** 转移 */
  onTransfer() {
    const modal = this.modal.open(AgentTransferAddPopupComponent, {
      width: '750px',
    });

    modal.componentInstance['tenantId'] = this.subHeaderService.merchantCurrentId;

    modal.result
      .then((res) => {
        res && setTimeout(() => this.loadData(true), 100);
      })
      .catch(() => {});
  }
}
