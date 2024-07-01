import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DestroyService } from 'src/app/shared/models/tools.model';
import { MonitorApi } from 'src/app/shared/api/monitor.api';
import { MonitorService, MonitorServiceParams } from 'src/app/pages/risk/monitor/monitor.service';
import { Router } from '@angular/router';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { finalize, forkJoin, takeUntil } from 'rxjs';
import { PageSizes, PaginatorState } from 'src/app/_metronic/shared/crud-table';
import { EmptyComponent } from 'src/app/shared/components/empty/empty.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { PaginatorComponent } from 'src/app/_metronic/shared/crud-table/components/paginator/paginator.component';
import { CurrencyIconDirective, IconSrcDirective } from 'src/app/shared/components/icon/icon.directive';
import { CurrencyValuePipe } from 'src/app/shared/pipes/currency-value.pipe';
import { LabelComponent } from 'src/app/shared/components/label/label.component';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { TimeFormatPipe } from 'src/app/shared/pipes/time.pipe';
import { WinDirective } from 'src/app/shared/directive/common.directive';
import { FormsModule } from '@angular/forms';
import { LoadingDirective } from 'src/app/shared/directive/loading.directive';
import { MatModal } from 'src/app/shared/components/dialogs/modal';
import { BatchRiskDetailComponent } from 'src/app/pages/risk/monitor/monitor-item/batch-review/batch-risk-detail/batch-risk-detail.component';
import { BatchAdjustmentDetailComponent } from 'src/app/pages/risk/monitor/monitor-item/batch-review/batch-adjustment-detail/batch-adjustment-detail.component';
import { BatchReviewListItem, BatchReviewListParams, BatchTypeEnum } from 'src/app/shared/interfaces/risk';
import { BatchStatusComponent } from 'src/app/pages/risk/batch/batch-list/batch-status/batch-status.component';
import { RiskApi } from 'src/app/shared/api/risk.api';
import { CodeDescription } from 'src/app/shared/interfaces/base.interface';
import { catchError } from 'rxjs/operators';
import { BatchRemarksDetailComponent } from 'src/app/pages/risk/monitor/monitor-item/batch-review/batch-remarks-detail/batch-remarks-detail.component';
import { BatchProhibitedDetailComponent } from 'src/app/pages/risk/monitor/monitor-item/batch-review/batch-prohibited-detail/batch-prohibited-detail.component';

@Component({
  selector: 'batch-review',
  standalone: true,
  imports: [
    CommonModule,
    EmptyComponent,
    MatFormFieldModule,
    MatOptionModule,
    MatSelectModule,
    PaginatorComponent,
    CurrencyIconDirective,
    CurrencyValuePipe,
    IconSrcDirective,
    LabelComponent,
    LangPipe,
    TimeFormatPipe,
    WinDirective,
    FormsModule,
    LoadingDirective,
    BatchStatusComponent,
  ],
  templateUrl: './batch-review.component.html',
  styleUrls: ['../../monitor.component.scss', './batch-review.component.scss'],
  providers: [DestroyService],
})
export class BatchReviewComponent implements OnInit {
  private api = inject(MonitorApi);
  public service = inject(MonitorService);
  private router = inject(Router);
  private destroy$ = inject(DestroyService);
  private lang = inject(LangService);
  private modalService = inject(MatModal);
  private riskApi = inject(RiskApi);

  // PS: 导出的话，监听一个导出的流
  // PS: 自己管理内部的分页，如果是“全部”监听接收流数据为{ isAll: true, paginator }流，用当前传递的数据来接管，只展示item
  ngOnInit(): void {
    forkJoin([this.riskApi.getBatchStatusSelect(), this.riskApi.getBatchTypeSelect()]).subscribe(
      ([batchStatusList, batchTypeList]) => {
        this.statusList = batchStatusList;
        this.batchTypeList = batchTypeList;
      }
    );

    this.service
      .reload$()
      .pipe(takeUntil(this.destroy$))
      .subscribe(([reset]) => {
        this.loadData(reset);
      });

    // 导出绑定
    // this.exportBind();
  }

  loading = false;

  /**
   * 页大小
   */
  pageSizes: number[] = PageSizes;

  /**
   * 分页
   */
  paginator: PaginatorState = new PaginatorState(); // 分页

  /**
   * 列表数据
   */
  list: BatchReviewListItem[] = [];

  /**
   * 状态列表
   */
  statusList: CodeDescription[] = [];

  /**
   * 批量类型
   */
  batchTypeList: CodeDescription[] = [];

  /**
   * 是否全部类型
   */
  get isAllType() {
    return this.service.isAllType;
  }

  /**
   * 存款申诉 - 获取实时监控数据
   */
  async loadData(resetPage = false) {
    return new Promise((resolve, reject) => {
      if (this.loading) return;

      this.loading = true;
      this.loadData$(resetPage)
        .pipe(finalize(() => (this.loading = false)))
        .pipe(
          catchError((err) => {
            reject(err);
            return [];
          })
        )
        .subscribe((res) => {
          this.list = res?.list || [];
          this.paginator.total = res?.total || 0;
          resolve(this.list);
        });
    });
  }

  loadData$(resetPage = false, sendParams?: Partial<MonitorServiceParams>) {
    resetPage && (this.paginator.page = 1);

    const sendData: BatchReviewListParams = {
      ...this.service.getParams(this.paginator),
      ...sendParams,
    };
    return this.api.getBatchReviewList(sendData);
  }

  async onDetail(item: BatchReviewListItem) {
    switch (BatchTypeEnum[item.batchType] as any as BatchTypeEnum) {
      /**
       * 批量调账审核
       */
      case BatchTypeEnum.Adjustment: {
        const modalRef = this.modalService.open(BatchAdjustmentDetailComponent, {
          width: '1200px',
          disableClose: true,
        });
        modalRef.componentInstance.data = item;
        modalRef.componentInstance.statusList = this.statusList;
        modalRef.componentInstance.reload$.subscribe(async () => {
          await this.loadData();

          // 如果实例销毁了，就不需要再赋值了
          if (modalRef.componentInstance) {
            modalRef.componentInstance.data = this.list.find((e) => e.batchId === item.batchId);
          }
        });
        if ((await modalRef.result) !== true) return;
        this.loadData();
        break;
      }

      /**
       * 批量风控审核
       */
      case BatchTypeEnum.Risk: {
        const modalRef = this.modalService.open(BatchRiskDetailComponent, {
          width: '1200px',
          disableClose: true,
        });
        modalRef.componentInstance.data = item;
        modalRef.componentInstance.statusList = this.statusList;
        modalRef.componentInstance.reload$.subscribe(async () => {
          await this.loadData();

          // 如果实例销毁了，就不需要再赋值了
          if (modalRef.componentInstance) {
            modalRef.componentInstance.data = this.list.find((e) => e.batchId === item.batchId);
          }
        });
        if ((await modalRef.result) !== true) return;
        this.loadData();
        break;
      }

      /**
       * 批量备注
       */
      case BatchTypeEnum.Remarks: {
        const modalRef = this.modalService.open(BatchRemarksDetailComponent, {
          width: '1200px',
          disableClose: true,
        });
        modalRef.componentInstance.data = item;
        modalRef.componentInstance.statusList = this.statusList;
        modalRef.componentInstance.isView = true;
        break;
      }

      /**
       * 批量禁止
       */
      case BatchTypeEnum.Prohibited: {
        const modalRef = this.modalService.open(BatchProhibitedDetailComponent, {
          width: '1200px',
          disableClose: true,
        });
        modalRef.componentInstance.data = item;
        modalRef.componentInstance.statusList = this.statusList;
        modalRef.componentInstance.isView = true;
        break;
      }
    }
  }
}
