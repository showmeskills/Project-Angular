import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DestroyService, toDateStamp } from 'src/app/shared/models/tools.model';
import { MonitorApi } from 'src/app/shared/api/monitor.api';
import { AppService } from 'src/app/app.service';
import { MonitorService, MonitorServiceParams } from 'src/app/pages/risk/monitor/monitor.service';
import { MatModal } from 'src/app/shared/components/dialogs/modal';
import { finalize, takeUntil } from 'rxjs';
import { PageSizes, PaginatorState } from 'src/app/_metronic/shared/crud-table';
import { KYCAuditTypeEnum, KYCReviewTypeEnum } from 'src/app/shared/interfaces/kyc';
import { IconSrcDirective } from 'src/app/shared/components/icon/icon.directive';
import { LabelComponent } from 'src/app/shared/components/label/label.component';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { EmptyComponent } from 'src/app/shared/components/empty/empty.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { PaginatorComponent } from 'src/app/_metronic/shared/crud-table/components/paginator/paginator.component';
import { FormsModule } from '@angular/forms';
import { LoadingDirective } from 'src/app/shared/directive/loading.directive';
import { MonitorKycPopupComponent } from 'src/app/pages/risk/monitor/monitor-item/kyc-review/kyc-popup/kyc-popup.component';
import { SubHeaderService } from 'src/app/_metronic/partials/layout/subheader/subheader1/sub-header.service';
import moment from 'moment/moment';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { KYCReviewItem } from 'src/app/shared/interfaces/monitor';
import { TimeFormatPipe } from 'src/app/shared/pipes/time.pipe';

@Component({
  selector: 'kyc-review',
  standalone: true,
  imports: [
    CommonModule,
    IconSrcDirective,
    LabelComponent,
    LangPipe,
    EmptyComponent,
    MatFormFieldModule,
    MatOptionModule,
    MatSelectModule,
    PaginatorComponent,
    FormsModule,
    LoadingDirective,
    TimeFormatPipe,
  ],
  templateUrl: './kyc-review.component.html',
  styleUrls: ['../../monitor.component.scss', './kyc-review.component.scss'],
  providers: [DestroyService],
})
export class KycReviewComponent implements OnInit {
  constructor(
    private destroy$: DestroyService,
    private api: MonitorApi,
    public service: MonitorService,
    private appService: AppService,
    private modalService: MatModal,
    private subHeaderService: SubHeaderService,
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

  protected readonly KYCReviewTypeEnum = KYCReviewTypeEnum;
  protected readonly KYCAuditTypeEnum = KYCAuditTypeEnum;
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
  list: KYCReviewItem[] = [];

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
    if (resetPage) {
      // 历史记录 - 类型：KYC审核 - 时间筛选初始化默认为一周
      if (this.service.curTab === 2 && !this.service.data.time.length) {
        this.service.data.time = [
          new Date(toDateStamp(moment(toDateStamp(new Date(), true)).subtract(6, 'days').toDate())!),
          new Date(toDateStamp(new Date(), true)!),
        ];
      }

      this.paginator.page = 1;
    }

    const sendData = { ...this.service.getParams(this.paginator), ...sendParams, total: undefined };
    return this.api.querykycprocess(sendData);
  }

  /**
   * 审核/详情弹窗
   */
  onDetail(data: KYCReviewItem) {
    // 是否待审核状态
    const isReview = data?.status === KYCReviewTypeEnum.Pending;

    const modal = this.modalService.open(MonitorKycPopupComponent, { width: '740px' });
    modal.componentInstance['isReview'] = isReview;
    modal.componentInstance['data'] = data || {};
    modal.componentInstance.auditSuccess.subscribe(() =>
      setTimeout(() => {
        this.loadData();
      }, 100)
    );
  }

  /**
   * KYC审核 - 显示国家名称
   */
  getCountryName(countryIso3?: string) {
    if (this.subHeaderService.countryList.length > 0 && countryIso3) {
      const country = this.subHeaderService.countryList.find((v) => v.countryIso3 === countryIso3);
      return country?.countryName || countryIso3;
    }

    return countryIso3 || '-';
  }

  /**
   * 导出绑定
   * @private
   */
  exportLoading = false;
  private async exportBind() {
    const type = await this.lang.getOne('common.type');
    const typeValue = await this.lang.getOne('risk.kycAudit');
    const country = await this.lang.getOne('common.country'); // 金额
    const level = await this.lang.getOne('member.table.grade'); // 认证等级
    const createTime = await this.lang.getOne('risk.auto.applyTime');
    const status = await this.lang.getOne('common.status');
    const reviewer = await this.lang.getOne('risk.viewr'); // 审核人

    const levelList = {
      [KYCAuditTypeEnum.Primary]: await this.lang.getOne('member.kyc.basis'),
      [KYCAuditTypeEnum.Intermediate]: await this.lang.getOne('member.kyc.middle'),
      [KYCAuditTypeEnum.Senior]: await this.lang.getOne('member.kyc.adv'),
    };

    this.service.exportExcel$.pipe(takeUntil(this.destroy$)).subscribe(({ isAll, exportExcel }) => {
      this.exportLoading = true;
      this.loadData$(false, isAll ? { page: 1, pageSize: 9e4 } : undefined)
        .pipe(finalize(() => (this.exportLoading = false)))
        .subscribe((res) => {
          exportExcel.KycAudit(
            res.list.map((e) => ({
              [type]: typeValue,
              UID: e.uid,
              [country]: this.getCountryName(e.countryCode),
              [level]: levelList[e.type] || '-',
              [createTime]: e.createTime,
              [reviewer]: e.operator || '-', // 审核人
              [status]: this.service.statusLang[e.status]?.langText,
            }))
          );
        });
    });
  }
}
