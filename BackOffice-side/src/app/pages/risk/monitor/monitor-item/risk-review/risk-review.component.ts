import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconSrcDirective } from 'src/app/shared/components/icon/icon.directive';
import { LabelComponent } from 'src/app/shared/components/label/label.component';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { TimeFormatPipe } from 'src/app/shared/pipes/time.pipe';
import { DestroyService, timeFormat } from 'src/app/shared/models/tools.model';
import { MonitorApi } from 'src/app/shared/api/monitor.api';
import { AppService } from 'src/app/app.service';
import { MonitorService, MonitorServiceParams } from 'src/app/pages/risk/monitor/monitor.service';
import { ReviewStatusObjEnum, RiskReviewList, RiskTypeObjEnum } from 'src/app/shared/interfaces/monitor';
import { PageSizes, PaginatorState } from 'src/app/_metronic/shared/crud-table';
import { EmptyComponent } from 'src/app/shared/components/empty/empty.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { PaginatorComponent } from 'src/app/_metronic/shared/crud-table/components/paginator/paginator.component';
import { FormsModule } from '@angular/forms';
import { AssessmentDetailComponent } from 'src/app/pages/risk/monitor/monitor-item/risk-review/assessment-detail/assessment-detail.component';
import { RiskDetailComponent } from 'src/app/pages/risk/monitor/monitor-item/risk-review/risk-detail/risk-detail.component';
import { UploadDatailComponent } from 'src/app/pages/risk/monitor/monitor-item/risk-review/upload-datail/upload-datail.component';
import { RiskDocAuditPopupComponent } from 'src/app/pages/risk/monitor/monitor-item/risk-review/risk-doc-audit-popup/risk-doc-audit-popup.component';
import { MatModal } from 'src/app/shared/components/dialogs/modal';
import { SubHeaderService } from 'src/app/_metronic/partials/layout/subheader/subheader1/sub-header.service';
import { finalize, takeUntil } from 'rxjs';
import { LoadingDirective } from 'src/app/shared/directive/loading.directive';
import { LangService } from 'src/app/shared/components/lang/lang.service';

/**
 * 风控审核
 */
@Component({
  selector: 'risk-review',
  standalone: true,
  imports: [
    CommonModule,
    IconSrcDirective,
    LabelComponent,
    LangPipe,
    TimeFormatPipe,
    EmptyComponent,
    MatFormFieldModule,
    MatOptionModule,
    MatSelectModule,
    PaginatorComponent,
    FormsModule,
    LoadingDirective,
  ],
  templateUrl: './risk-review.component.html',
  styleUrls: ['../../monitor.component.scss', './risk-review.component.scss'],
  providers: [DestroyService],
})
export class RiskReviewComponent implements OnInit {
  constructor(
    private destroy$: DestroyService,
    private api: MonitorApi,
    private appService: AppService,
    public service: MonitorService,
    private subHeaderService: SubHeaderService,
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

  protected readonly RiskTypeEnum = RiskTypeObjEnum;
  protected readonly RiskStatusEnum = ReviewStatusObjEnum;
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
  list: RiskReviewList[] = [];

  /**
   * 是否全部类型
   */
  get isAllType() {
    return this.service.isAllType;
  }

  /**
   * 审核类型：风控审核 - 获取实时监控&历史记录数据
   * @param resetPage
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

    const sendData = { ...this.service.getParams(this.paginator), ...sendParams };
    return this.api.queryPageRiskForm(sendData);
  }

  /**
   * 打开风控审核弹窗
   * @param item
   */
  onDetail(item) {
    // RiskAssessment:1, 风险评估问卷
    if (item.type === RiskTypeObjEnum.RiskAssessment) {
      const modal = this.modalService.open(AssessmentDetailComponent, {
        autoFocus: false,
        width: '800px',
      });
      modal.componentInstance['data'] = item;
      modal.result
        .then(() => {
          this.loadData();
        })
        .catch(() => {});
    }
    //  WealthSource:2, 财富来源证明
    if (item.type === RiskTypeObjEnum.WealthSource) {
      const modal = this.modalService.open(RiskDetailComponent, {
        autoFocus: false,
        width: '800px',
      });
      modal.componentInstance['data'] = item;
      modal.result
        .then(() => {
          this.loadData();
        })
        .catch(() => {});
    }
    //  FullAudit:3, 上传审核文件
    if (item.type === RiskTypeObjEnum.FullAudit) {
      const modal = this.modalService.open(UploadDatailComponent, {
        autoFocus: false,
        width: '800px',
      });
      modal.componentInstance['dataList'] = item;
      modal.componentInstance['tenantId'] = this.subHeaderService.merchantCurrentId;
      modal.result
        .then(() => {
          this.loadData();
        })
        .catch(() => {});
    }

    // 欧洲KYC - 1.发送文件请求类型 2.风险评估问卷
    // ID: 身份认证, POA: 地址证明, WealthSourceDocument: 补充财富来源证明,
    // PaymentMethod: 支付方式, Customize: 自定义, EDD: 风险评估问卷
    if (
      [
        RiskTypeObjEnum.ID,
        RiskTypeObjEnum.POA,
        RiskTypeObjEnum.WealthSourceDocument,
        RiskTypeObjEnum.PaymentMethod,
        RiskTypeObjEnum.Customize,
        RiskTypeObjEnum.EDD,
      ].includes(item?.type)
    ) {
      const modal = this.modalService.open(RiskDocAuditPopupComponent, {
        autoFocus: false,
        width: '800px',
      });
      modal.componentInstance['data'] = item;
      modal.componentInstance['tenantId'] = this.subHeaderService.merchantCurrentId;
      modal.result
        .then(() => {
          this.loadData();
        })
        .catch(() => {});
    }
  }

  /**
   * 导出绑定
   * @private
   */
  exportLoading = false;
  private async exportBind() {
    const content = await this.lang.getOne('member.model.content'); // 内容
    const type = await this.lang.getOne('common.type');
    const typeValue = await this.lang.getOne('risk.riskReview');
    const createTime = await this.lang.getOne('risk.auto.applyTime');
    const status = await this.lang.getOne('common.status');
    const sendFileRequest = await this.lang.getOne('risk.docRequest.backendDocRequest');
    const reviewer = await this.lang.getOne('risk.viewr'); // 审核人
    const createdUserName = await this.lang.getOne('auManage.role.creater'); // 创建人
    const reviewedTime = await this.lang.getOne('risk.checkTime'); // 审核时间

    const typeList = {
      [RiskTypeObjEnum.RiskAssessment]: await this.lang.getOne('risk.riskTitle'),
      [RiskTypeObjEnum.WealthSource]: await this.lang.getOne('risk.wealthTitle'),
      [RiskTypeObjEnum.FullAudit]: await this.lang.getOne('risk.uploadSpecified'),
      [RiskTypeObjEnum.ID]: sendFileRequest + ' - ' + (await this.lang.getOne('risk.docRequest.id')),
      [RiskTypeObjEnum.POA]: sendFileRequest + ' - ' + (await this.lang.getOne('risk.docRequest.poa')),
      [RiskTypeObjEnum.PaymentMethod]:
        sendFileRequest + ' - ' + (await this.lang.getOne('risk.docRequest.payMentMethod')),
      [RiskTypeObjEnum.WealthSourceDocument]:
        sendFileRequest + ' - ' + (await this.lang.getOne('risk.docRequest.sourceOfWealth')),
      [RiskTypeObjEnum.EDD]: await this.lang.getOne('member.kyc.edd'),
      [RiskTypeObjEnum.Customize]: sendFileRequest + ' - ' + (await this.lang.getOne('risk.docRequest.customize')),
    };

    this.service.exportExcel$.pipe(takeUntil(this.destroy$)).subscribe(({ isAll, exportExcel }) => {
      this.exportLoading = true;
      this.loadData$(false, isAll ? { page: 1, pageSize: 9e4 } : undefined)
        .pipe(finalize(() => (this.exportLoading = false)))
        .subscribe((res) => {
          exportExcel.RiskReview(
            res.list.map((e) => ({
              [type]: typeValue,
              UID: e.uid,
              [content]: typeList[e.type],
              [createdUserName]: e.createdUserName || '-', // 创建人
              [createTime]: timeFormat(e.createdTime),
              [reviewer]: e.lastModifiedUserName || '-', // 审核人
              [reviewedTime]: (this.service.curTab === 2 && timeFormat(e.lastModifiedTime)) || '-', // 审核时间
              [status]: this.service.statusLang[e.status]?.langText,
            }))
          );
        });
    });
  }
}
