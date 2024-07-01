import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { OwlDateTimeComponent } from 'src/app/components/datetime-picker';
import { OwlDateTimeInputDirective } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker-input.directive';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { OwlDateTimeTriggerDirective } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker-trigger.directive';
import { AppService } from 'src/app/app.service';
import { SubHeaderService } from 'src/app/_metronic/partials/layout/subheader/subheader1/sub-header.service';
import { RiskApi } from 'src/app/shared/api/risk.api';
import { takeUntil } from 'rxjs/operators';
import { cloneDeep } from 'lodash';
import { PageSizes, PaginatorState } from 'src/app/_metronic/shared/crud-table';
import moment from 'moment';
import { finalize, forkJoin } from 'rxjs';
import { CodeDescription } from 'src/app/shared/interfaces/base.interface';
import { BatchListItem, BatchTypeEnum } from 'src/app/shared/interfaces/risk';
import { TimeFormatPipe } from 'src/app/shared/pipes/time.pipe';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { EmptyComponent } from 'src/app/shared/components/empty/empty.component';
import { PaginatorComponent } from 'src/app/_metronic/shared/crud-table/components/paginator/paginator.component';
import { LoadingDirective } from 'src/app/shared/directive/loading.directive';
import { BatchStatusComponent } from 'src/app/pages/risk/batch/batch-list/batch-status/batch-status.component';
import { BatchAdjustmentDetailComponent } from 'src/app/pages/risk/monitor/monitor-item/batch-review/batch-adjustment-detail/batch-adjustment-detail.component';
import { BatchRiskDetailComponent } from 'src/app/pages/risk/monitor/monitor-item/batch-review/batch-risk-detail/batch-risk-detail.component';
import { BatchRemarksDetailComponent } from 'src/app/pages/risk/monitor/monitor-item/batch-review/batch-remarks-detail/batch-remarks-detail.component';
import { BatchProhibitedDetailComponent } from 'src/app/pages/risk/monitor/monitor-item/batch-review/batch-prohibited-detail/batch-prohibited-detail.component';
import { MatModal } from 'src/app/shared/components/dialogs/modal';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { PrizeService } from 'src/app/pages/Bonus/prize.service';
import { lastValueFrom } from 'rxjs';
import {
  JSONToExcelDownload,
  timeFormat,
  DestroyService,
  getRangeTime,
  toDateStamp,
} from 'src/app/shared/models/tools.model';
import { DetailService } from 'src/app/pages/member/detail/detail.service';
import { CurrencyService } from 'src/app/shared/service/currency.service';
import { GameApi } from 'src/app/shared/api/game.api';
import { ProviderPT } from 'src/app/shared/interfaces/provider';
import { BatchService } from 'src/app/pages/risk/batch/batch.service';
import { SelectApi } from 'src/app/shared/api/select.api';
import { ProviderGroupItem } from 'src/app/shared/interfaces/select.interface';
import { ProviderSelect } from 'src/app/shared/interfaces/provider';

@Component({
  selector: 'batch-list',
  standalone: true,
  imports: [
    CommonModule,
    FormRowComponent,
    MatInputModule,
    MatSelectModule,
    LangPipe,
    OwlDateTimeComponent,
    OwlDateTimeInputDirective,
    ReactiveFormsModule,
    OwlDateTimeTriggerDirective,
    FormsModule,
    TimeFormatPipe,
    EmptyComponent,
    PaginatorComponent,
    LoadingDirective,
    BatchStatusComponent,
    AngularSvgIconModule,
  ],
  templateUrl: './batch-list.component.html',
  styleUrls: ['./batch-list.component.scss'],
  providers: [DestroyService],
})
export class BatchListComponent implements OnInit {
  constructor(
    private appService: AppService,
    private subHeaderService: SubHeaderService,
    private api: RiskApi,
    private destroy$: DestroyService,
    public lang: LangService,
    private modalService: MatModal,
    public prizeService: PrizeService,
    public detailService: DetailService,
    private currencyService: CurrencyService,
    private gameApi: GameApi,
    private batchService: BatchService,
    private selectApi: SelectApi
  ) {}

  readonly EMPTY_DATA = {
    type: '',
    batchID: '',
    applicant: '',
    date: getRangeTime(-3 + 1).map((e) => moment(e).toDate()) as Date[],
  };

  data = cloneDeep(this.EMPTY_DATA);
  pageSizes: number[] = PageSizes; // 页大小
  paginator: PaginatorState = new PaginatorState(); // 分页
  list: BatchListItem[] = [];
  typeList: CodeDescription[] = [];
  statusList: CodeDescription[] = [];
  loading = false;

  ngOnInit() {
    this.loading = true;
    this.subHeaderService.merchantId$
      .pipe(
        finalize(() => (this.loading = false)),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.loading = true;
        forkJoin([this.api.getBatchTypeSelect(), this.api.getBatchStatusSelect()])
          .pipe(finalize(() => (this.loading = false)))
          .subscribe(([type, status]) => {
            this.typeList = type;
            this.statusList = status;
            this.reset();
          });
      });
  }

  loadData(resetPage = false) {
    this.appService.isContentLoadingSubject.next(true);
    this.loadData$(resetPage)
      .pipe(finalize(() => this.appService.isContentLoadingSubject.next(false)))
      .subscribe((res) => {
        this.list = Array.isArray(res?.list) ? res.list : [];
        this.paginator.total = res?.total || 0;
      });
  }

  loadData$(resetPage = false, sendData?: Partial<any>) {
    resetPage && (this.paginator.page = 1);

    const parmas = {
      tenantId: this.subHeaderService.merchantCurrentId,
      batchId: this.data.batchID,
      applicant: this.data.applicant,
      batchType: this.data.type,
      startTime: toDateStamp(this.data.date[0]),
      endTime: toDateStamp(this.data.date[1], true),
      page: this.paginator.page,
      pageSize: this.paginator.pageSize,
      ...sendData,
    };

    return this.api.getBatchList(parmas);
  }

  reset() {
    this.data = cloneDeep(this.EMPTY_DATA);
    this.loadData(true);
  }

  getType(code: string) {
    return this.typeList.find((e) => e.code === code)?.description || 'Unknown';
  }

  async onDetail(item: BatchListItem) {
    switch (BatchTypeEnum[item.batchType] as any as BatchTypeEnum) {
      /**
       * 批量调账审核
       */
      case BatchTypeEnum.Adjustment: {
        const modalRef = this.modalService.open(BatchAdjustmentDetailComponent, {
          width: '1200px',
        });
        modalRef.componentInstance.data = item;
        modalRef.componentInstance.statusList = this.statusList;
        modalRef.componentInstance.isView = true;
        break;
      }

      /**
       * 批量风控审核
       */
      case BatchTypeEnum.Risk: {
        const modalRef = this.modalService.open(BatchRiskDetailComponent, {
          width: '1200px',
        });
        modalRef.componentInstance.data = item;
        modalRef.componentInstance.statusList = this.statusList;
        modalRef.componentInstance.isView = true;
        break;
      }

      /**
       * 批量备注
       */
      case BatchTypeEnum.Remarks: {
        const modalRef = this.modalService.open(BatchRemarksDetailComponent, {
          width: '1200px',
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
        });
        modalRef.componentInstance.data = item;
        modalRef.componentInstance.statusList = this.statusList;
        modalRef.componentInstance.isView = true;
        break;
      }
    }
  }

  /**
   * 导出
   */
  async onExport(isAll: boolean) {
    if (!this.data.type) return this.appService.showToastSubject.next({ msgLang: 'conten.chooseType' });
    let list: BatchListItem[] = [];
    if (isAll) {
      try {
        this.appService.isContentLoadingSubject.next(true);
        const res = await lastValueFrom(this.loadData$(true, { pageSize: 9e5 }));
        this.appService.isContentLoadingSubject.next(false);
        list = Array.isArray(res?.list) ? res.list : [];
      } finally {
        this.appService.isContentLoadingSubject.next(false);
      }
    } else {
      list = this.list;
    }

    this.exportExcel(cloneDeep(list));
  }

  /**
   * 导出Excel
   * @param list
   */
  async exportExcel(list: any[]) {
    if (!list?.length) return;

    const reduceList = this.flattenedArray(list);

    this.switchBatchType(reduceList);
  }

  flattenedArray(list: any[]) {
    return list.reduce((result, obj) => {
      // 将对象的非嵌套部分添加到结果数组
      result = result.concat({
        fbatchId: obj.batchId,
        fbatchType: obj.batchType,
        fapplicationDate: obj.applicationDate,
        fcompletionDate: obj.completionDate,
        fapplicant: obj.applicant,
        fbatchStatus: obj.status,
      });

      // 将嵌套数组的元素添加到结果数组
      if (obj.info && obj.info.length > 0) {
        if (obj.batchType == 'Remarks') {
          obj.info.forEach((e) => {
            if (!e.status) {
              e.status = obj.status;
            }
          });
        }
        result = result.concat(obj.info);
      }
      return result;
    }, []);
  }

  async switchBatchType(list: any[]) {
    const fbatchId = await this.lang.getOne('risk.batchList.batchID'); // 批量ID
    const fbatchType = await this.lang.getOne('common.type'); // 类型
    const fapplicationDate = await this.lang.getOne('risk.batchList.applicationDate'); // 提交日期
    const fcompletionDate = await this.lang.getOne('finance.deposit.completeTime'); // 完成时间
    const fapplicant = await this.lang.getOne('risk.batchList.applicant'); // 申请人
    const fbatchStatus = await this.lang.getOne('common.status'); // 状态

    let exportList;
    switch (BatchTypeEnum[this.data.type] as any as BatchTypeEnum) {
      /**
       * 批量调账审核
       */
      case BatchTypeEnum.Adjustment: {
        const result = await this.gameApi
          .getProvider({ baseID: '', abbreviation: '', page: 1, pageSize: 999 })
          .toPromise();
        const providerList: ProviderPT[] = result?.list || [];

        const UID = 'UID';
        const account = await this.lang.getOne('member.overview.account'); // 账户
        const currency = await this.lang.getOne('common.currency'); // 币种
        const adjustmentAmout = await this.lang.getOne('finance.bill.adjustmentAmout'); // 调账金额
        const withdrawalLimit = await this.lang.getOne('finance.bill.withdrawalLimit'); // 提款流水要求
        const type = await this.lang.getOne('finance.bill.type'); // 调账类型
        const product = await this.lang.getOne('content.foot.product'); // 产品类型
        const remarks = await this.lang.getOne('common.remarks'); // 备注
        const denialReason = await this.lang.getOne('member.kyc.model.denialReason'); // 拒绝原因
        const AdjustmentStatus = await this.lang.getOne('finance.bill.status'); // 状态

        exportList = await Promise.all(
          list.map(async (e) => ({
            [fbatchId]: e.fbatchId,
            [fbatchType]: e.fbatchType ? this.getType(e.fbatchType) : '',
            [fapplicationDate]: e.fapplicationDate ? timeFormat(e.fapplicationDate) : '',
            [fcompletionDate]: e.fcompletionDate ? timeFormat(e.fcompletionDate) : '',
            [fapplicant]: e.fapplicant ? e.fapplicant : '',
            [fbatchStatus]: e.fbatchStatus ? this.getStatus(e.fbatchStatus) : '',
            [UID]: e.uid ? e.uid : '',
            [account]: e.detail
              ? await this.lang.getOne(this.getAdjustmentCategory('adjustmentCategoryList', e.detail.category))
              : '',
            [currency]: e.detail ? e.detail.currency : '',
            [adjustmentAmout]: e.detail
              ? this.currencyService.toFormatCurrency(e.detail.currency, e.detail.amount)
              : '',
            [withdrawalLimit]: e.detail
              ? this.currencyService.toFormatCurrency(e.detail.currency, e.detail.withdrawLimit)
              : '',
            [type]: e.detail
              ? await this.lang.getOne(this.getAdjustmentCategory('adjustmentTypeList', e.detail.adjustType))
              : '',
            [product]: e.detail ? this.getAdjustmentProduct(e.detail.adjustTypeSubclass, providerList) : '',
            [remarks]: e.detail ? e.detail.remark : '',
            [denialReason]: e.detail ? e.detail.rejectRemark : '',
            [AdjustmentStatus]: e.status ? this.getStatus(e.status) : '',
          }))
        );
        break;
      }

      /**
       * 批量风控审核
       */
      case BatchTypeEnum.Risk: {
        const UID = 'UID';
        const riskLevel = await this.lang.getOne('risk.batch.riskLevel'); // 等级调整
        const remarks = await this.lang.getOne('common.remarks'); // 备注
        const denialReason = await this.lang.getOne('member.kyc.model.denialReason'); // 拒绝原因
        const typeRisk = await this.lang.getOne('finance.bill.typeRisk'); // 状态

        exportList = await Promise.all(
          list.map(async (e) => ({
            [fbatchId]: e.fbatchId,
            [fbatchType]: e.fbatchType ? this.getType(e.fbatchType) : '',
            [fapplicationDate]: e.fapplicationDate ? timeFormat(e.fapplicationDate) : '',
            [fcompletionDate]: e.fcompletionDate ? timeFormat(e.fcompletionDate) : '',
            [fapplicant]: e.fapplicant ? e.fapplicant : '',
            [fbatchStatus]: e.fbatchStatus ? this.getStatus(e.fbatchStatus) : '',
            [UID]: e.uid ? e.uid : '',
            [riskLevel]: e.detail ? e.detail.originalRiskControl + '→' + e.detail.riskControl : '',
            [remarks]: e.detail ? e.detail.remark : '',
            [denialReason]: e.detail ? e.detail.rejectRemark : '',
            [typeRisk]: e.status ? this.getStatus(e.status) : '',
          }))
        );
        break;
      }

      /**
       * 批量备注
       */
      case BatchTypeEnum.Remarks: {
        const UID = 'UID';
        const remarks = await this.lang.getOne('common.remarks'); // 备注
        const typeRemarks = await this.lang.getOne('finance.bill.typeRemarks'); // 状态

        exportList = await Promise.all(
          list.map(async (e) => ({
            [fbatchId]: e.fbatchId,
            [fbatchType]: e.fbatchType ? this.getType(e.fbatchType) : '',
            [fapplicationDate]: e.fapplicationDate ? timeFormat(e.fapplicationDate) : '',
            [fcompletionDate]: e.fcompletionDate ? timeFormat(e.fcompletionDate) : '',
            [fapplicant]: e.fapplicant ? e.fapplicant : '',
            [fbatchStatus]: e.fbatchStatus ? this.getStatus(e.fbatchStatus) : '',
            [UID]: e.uid ? e.uid : '',
            [remarks]: e.detail ? e.detail.remark : '',
            [typeRemarks]: e.detail ? this.getStatus(e.status || e.fbatchStatus || '') : '',
          }))
        );
        break;
      }

      /**
       * 批量禁止
       */
      case BatchTypeEnum.Prohibited: {
        const result = await this.selectApi
          .getProviderGroupSelect({ tenantId: this.subHeaderService.merchantCurrentId, gameStatue: 'Online' })
          .toPromise();
        const providerList: ProviderGroupItem[] = result || [];

        const UID = 'UID';
        const typeProhibited = await this.lang.getOne('finance.bill.typeProhibited'); // 类型
        const category = await this.lang.getOne('common.category'); // 备注
        const content = await this.lang.getOne('member.model.content'); // 备注
        const timeRange = await this.lang.getOne('risk.batch.timeRange'); // 备注

        exportList = await Promise.all(
          list.map(async (e) => ({
            [fbatchId]: e.fbatchId,
            [fbatchType]: e.fbatchType ? this.getType(e.fbatchType) : '',
            [fapplicationDate]: e.fapplicationDate ? timeFormat(e.fapplicationDate) : '',
            [fcompletionDate]: e.fcompletionDate ? timeFormat(e.fcompletionDate) : '',
            [fapplicant]: e.fapplicant ? e.fapplicant : '',
            [fbatchStatus]: e.fbatchStatus ? this.getStatus(e.fbatchStatus) : '',
            [UID]: e.uid ? e.uid : '',
            [typeProhibited]: e.status ? await this.lang.getOne(this.getTypeProhibited(e.detail)) : '',
            [category]: e.detail ? await this.getCategory(e.detail, providerList) : '',
            [content]: e.detail ? await this.getContent(e.detail, providerList) : '',
            [timeRange]: e.detail ? await this.getTimeRange(e.detail) : '',
          }))
        );
        break;
      }
    }
    JSONToExcelDownload(exportList, this.data.type + Date.now());
    // return exportList
  }

  getAdjustmentCategory(type: string, value: any) {
    let lang = '';
    this.detailService[type].forEach((e) => {
      if (e.code == value) {
        lang = e.lang;
      }
    });
    return lang;
  }

  getStatus(code: string | null) {
    if (!code) return '';

    const item = this.statusList.find((e) => e.code === code);
    return this.lang.isLocal ? item?.description : item?.code;
  }

  getAdjustmentProduct(value, providerList: ProviderPT[], defaultValue = '') {
    if (!value?.baseId || !value?.providerId || !value?.gameCategory || !providerList?.length) return defaultValue;

    const provider = providerList.find((e) => e.baseId === value.baseId);
    const category = provider?.details?.find((e) => e.category === value.gameCategory);
    return `${provider?.abbreviation || ''} - ${category?.categoryName || ''}`;
  }

  getTypeProhibited(detail) {
    let lang = '';
    this.batchService.mainList.forEach((type) => {
      if (type.main === this.batchService.BatchMainType.login && detail.isLoginDisable) {
        lang = type.lang;
      }
      if (type.main === this.batchService.BatchMainType.game && detail.gameCodes?.length) {
        lang = type.lang;
      }
      if (
        type.main === this.batchService.BatchMainType.pay &&
        (detail.depositType?.length || detail.withdrawType?.length)
      ) {
        lang = type.lang;
      }
    });
    return lang;
  }

  /**
   * 获取厂商数据
   */
  getProviderData(providerCatId: any, providerList) {
    if (!providerCatId) {
      return { provider: undefined, current: undefined };
    }

    let child: ProviderSelect | undefined;
    const parent = providerList.find((e) =>
      e.providers.some((j) => {
        const res = j.providerCatId === providerCatId;
        if (res) {
          child = j;
        }
        return res;
      })
    );

    return { provider: parent, current: child };
  }

  async getCategory(detail, providerList) {
    if (detail.gameCodes?.length) {
      return this.getProviderData(detail.gameCodes[0], providerList)?.provider?.description;
    }
    if (detail.depositType?.length) {
      await this.lang.getOne('payment.method.deposit');
    }
    if (detail.withdrawType?.length) {
      await this.lang.getOne('payment.method.withdrawType');
    }
  }

  async getContent(detail, providerList) {
    let lang = '';
    if (detail.depositType?.length) {
      for (let i = 0; i < detail.depositType.length; i++) {
        const deposit = detail.depositType[i];
        for (let j = 0; j < this.batchService.depositList.length; j++) {
          const depositTypeItem = this.batchService.depositList[j];
          if (depositTypeItem.type === deposit) {
            lang += `${await this.lang.getOne(depositTypeItem.lang)}${i === detail.depositType.length - 1 ? '' : ', '}`;
          }
        }
      }
    }
    if (detail.withdrawType?.length) {
      for (let i = 0; i < detail.withdrawType.length; i++) {
        const withdrawal = detail.withdrawType[i];
        for (let j = 0; j < this.batchService.depositList.length; j++) {
          const withdrawTypeItem = this.batchService.depositList[j];
          if (withdrawTypeItem.type === withdrawal) {
            lang += `${await this.lang.getOne(withdrawTypeItem.lang)}${
              i === detail.withdrawType.length - 1 ? '' : ', '
            }`;
          }
        }
      }
    }
    if (detail.gameCodes?.length) {
      for (let i = 0; i < detail.gameCodes.length; i++) {
        const gameCode = detail.gameCodes[i];
        lang += `${this.getProviderData(gameCode, providerList)?.current?.name}${
          i === detail.gameCodes.length - 1 ? '' : ', '
        }`;
      }
    }
    return lang;
  }

  async getTimeRange(detail) {
    if (detail.isForbidGameForever || detail.isForbidLoginForever || detail.isForbidPaymentForever) {
      return await this.lang.getOne('risk.batch.permanently');
    } else {
      return (
        timeFormat(detail.forbidGameStartTime || detail.forbidLoginStartTime || detail.forbidPaymentStartTime) +
        '~' +
        timeFormat(detail.forbidGameEndTime || detail.forbidLoginEndTime || detail.forbidPaymentEndTime)
      );
    }
  }
}
