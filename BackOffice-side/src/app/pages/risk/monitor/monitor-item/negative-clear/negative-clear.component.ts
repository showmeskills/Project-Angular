import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DestroyService, timeFormat } from 'src/app/shared/models/tools.model';
import { CurrencyIconDirective, IconSrcDirective } from 'src/app/shared/components/icon/icon.directive';
import { CurrencyValuePipe } from 'src/app/shared/pipes/currency-value.pipe';
import { LabelComponent } from 'src/app/shared/components/label/label.component';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { TimeFormatPipe } from 'src/app/shared/pipes/time.pipe';
import { WinDirective } from 'src/app/shared/directive/common.directive';
import { EmptyComponent } from 'src/app/shared/components/empty/empty.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { PaginatorComponent } from 'src/app/_metronic/shared/crud-table/components/paginator/paginator.component';
import { AppService } from 'src/app/app.service';
import { MonitorService, MonitorServiceParams } from 'src/app/pages/risk/monitor/monitor.service';
import { SubHeaderService } from 'src/app/_metronic/partials/layout/subheader/subheader1/sub-header.service';
import { MatModal } from 'src/app/shared/components/dialogs/modal';
import { finalize, takeUntil } from 'rxjs';
import {
  NegativeClearCategoryObjEnum,
  NegativeClearItem,
  NegativeClearStatusObjEnum,
} from 'src/app/shared/interfaces/monitor';
import { PageSizes, PaginatorState } from 'src/app/_metronic/shared/crud-table';
import { NegativeclearApi } from 'src/app/shared/api/negativeclear.api';
import { FormsModule } from '@angular/forms';
import { LoadingDirective } from 'src/app/shared/directive/loading.directive';
import { MonitorApi } from 'src/app/shared/api/monitor.api';
import { AuditPopupComponent } from 'src/app/pages/risk/monitor/audit-popup/audit-popup.component';
import { LangService } from 'src/app/shared/components/lang/lang.service';

@Component({
  selector: 'negative-clear',
  standalone: true,
  imports: [
    CommonModule,
    CurrencyIconDirective,
    CurrencyValuePipe,
    IconSrcDirective,
    LabelComponent,
    LangPipe,
    TimeFormatPipe,
    WinDirective,
    EmptyComponent,
    MatFormFieldModule,
    MatOptionModule,
    MatSelectModule,
    PaginatorComponent,
    FormsModule,
    LoadingDirective,
    AuditPopupComponent,
  ],
  templateUrl: './negative-clear.component.html',
  styleUrls: ['../../monitor.component.scss', './negative-clear.component.scss'],
  providers: [DestroyService],
})
export class NegativeClearComponent implements OnInit {
  constructor(
    private destroy$: DestroyService,
    private appService: AppService,
    public service: MonitorService,
    private subHeaderService: SubHeaderService,
    private api: NegativeclearApi,
    private monitorApi: MonitorApi,
    private modalService: MatModal,
    private lang: LangService
  ) {}

  // PS: 导出的话，监听一个导出的流
  // PS: 自己管理内部的分页，如果是“全部”监听接收流数据为{ isAll: true, paginator }流，用当前传递的数据来接管，只展示item
  ngOnInit(): void {
    this.service
      .reload$()
      .pipe(takeUntil(this.destroy$))
      .subscribe(([reset]) => {
        this.loadData(reset);
      });

    // 导出
    this.exportBind();
  }

  protected readonly StatusEnum = NegativeClearStatusObjEnum;
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
  list: NegativeClearItem[] = [];

  /**
   * 是否全部类型
   */
  get isAllType() {
    return this.service.isAllType;
  }

  /**
   * 审核类型：操作审核 - 获取实时监控&历史记录数据
   */
  loadData(resetPage = false) {
    if (this.loading) return;

    this.loading = true;
    this.loadData$(resetPage)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe((res) => {
        this.list = res?.list || [];
        this.paginator.total = res?.total || 0;
      });
  }

  loadData$(resetPage = false, sendParams?: Partial<MonitorServiceParams>) {
    resetPage && (this.paginator.page = 1);

    const sendData = {
      ...this.service.getParams(this.paginator),
      ...sendParams,
      category: NegativeClearCategoryObjEnum.NegativeClear, // 负面清零 固定分类参数
    };
    return this.api.getNegativeClearList(sendData);
  }

  /**
   * 审核弹窗 - 根据不同审核进入流程
   */
  onDetail(item: NegativeClearItem) {
    this.loading = true;
    this.monitorApi
      .getAuditNegativeClearDetail({ orderId: item.orderId })
      .pipe(finalize(() => (this.loading = false)))
      .subscribe((data) => {
        if (data) {
          const modalRef = this.modalService.open(AuditPopupComponent, {
            width: '788px',
            disableClose: true,
          });
          modalRef.componentInstance['type'] = data.category;
          modalRef.componentInstance['data'] = data || {};

          modalRef.componentInstance.auditSuccess.subscribe(() =>
            setTimeout(() => {
              this.loadData();
            }, 100)
          );
          modalRef.result.then(() => {}).catch(() => {});
        } else {
          this.appService.showToastSubject.next({ msgLang: 'risk.failToGet', successed: false });
        }
      });
  }

  /**
   * 导出绑定
   * @private
   */
  exportLoading = false;
  private async exportBind() {
    const content = await this.lang.getOne('member.model.content'); // 内容
    const contentValue = await this.lang.getOne('risk.negativeClear'); // 负值清零
    const type = await this.lang.getOne('common.type');
    const typeValue = await this.lang.getOne('risk.actCheck');
    const amount = await this.lang.getOne('common.amount'); // 金额
    const currency = await this.lang.getOne('common.currency'); // 币种
    const createTime = await this.lang.getOne('risk.auto.applyTime');
    const status = await this.lang.getOne('common.status');
    const reviewer = await this.lang.getOne('risk.viewr'); // 审核人
    const reviewedTime = await this.lang.getOne('risk.checkTime'); // 审核时间

    this.service.exportExcel$.pipe(takeUntil(this.destroy$)).subscribe(({ isAll, exportExcel }) => {
      this.exportLoading = true;
      this.loadData$(false, isAll ? { page: 1, pageSize: 9e4 } : undefined)
        .pipe(finalize(() => (this.exportLoading = false)))
        .subscribe((res) => {
          exportExcel.NegativeClear(
            res.list.map((e) => ({
              [type]: typeValue,
              UID: e.uid,
              [content]: contentValue,
              [amount]: e.detail?.amount,
              [currency]: e.detail?.currency,
              [createTime]: timeFormat(e.createdTime),
              [reviewer]: e.modifiedUserName || '-', // 审核人
              [reviewedTime]: (this.service.curTab === 2 && timeFormat(e.modifiedTime)) || '-', // 审核时间
              [status]: this.service.statusLang[e.status]?.langText,
            }))
          );
        });
    });
  }
}
