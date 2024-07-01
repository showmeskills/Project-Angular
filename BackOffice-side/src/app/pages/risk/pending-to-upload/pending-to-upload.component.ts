import { Component, OnInit } from '@angular/core';
import { cloneDeep } from 'lodash';
import { Tabs } from 'src/app/shared/interfaces/base.interface';
import { SubHeaderService } from 'src/app/_metronic/partials/layout/subheader/subheader1/sub-header.service';
import { PageSizes, PaginatorState } from 'src/app/_metronic/shared/crud-table';
import { MonitorService } from 'src/app/pages/risk/monitor/monitor.service';
import { DestroyService, toDateStamp } from 'src/app/shared/models/tools.model';
import { takeUntil } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { OwlDateTimeModule } from 'src/app/components/datetime-picker';
import { EmptyComponent } from 'src/app/shared/components/empty/empty.component';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { FormatMoneyPipe } from 'src/app/shared/pipes/big-number.pipe';
import { TimeFormatPipe } from 'src/app/shared/pipes/time.pipe';
import { PaginatorComponent } from 'src/app/_metronic/shared/crud-table/components/paginator/paginator.component';
import { LoadingDirective } from 'src/app/shared/directive/loading.directive';
import { LabelComponent } from 'src/app/shared/components/label/label.component';
import { MatModal } from 'src/app/shared/components/dialogs/modal';
import { PendingedPopupComponent } from './pendinged-popup/pendinged-popup.component';
import {
  PendingedCategoryObjEnum,
  PendingedCategoryEnum,
  RiskFormTypeObjEnum,
} from 'src/app/shared/interfaces/monitor';
import { KYCAuditTypeEnum } from 'src/app/shared/interfaces/kyc';
import { RiskApi } from 'src/app/shared/api/risk.api';
import { IconSrcDirective } from 'src/app/shared/components/icon/icon.directive';

@Component({
  selector: 'app-pending-to-upload',
  templateUrl: './pending-to-upload.component.html',
  styleUrls: ['./pending-to-upload.component.scss'],
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
    FormatMoneyPipe,
    LangPipe,
    OwlDateTimeModule,
    EmptyComponent,
    AngularSvgIconModule,
    LoadingDirective,
    LabelComponent,
    IconSrcDirective,
  ],
})
export class PendingToUploadComponent implements OnInit {
  constructor(
    public subHeaderService: SubHeaderService,
    public service: MonitorService,
    private destroy$: DestroyService,
    private modalService: MatModal,
    private riskApi: RiskApi
  ) {}

  protected readonly PendingedCategoryObjEnum = PendingedCategoryObjEnum;
  protected readonly KYCAuditTypeEnum = KYCAuditTypeEnum;
  protected readonly RiskFormTypeObjEnum = RiskFormTypeObjEnum;

  /** 是否加载中 */
  isLoading = false;

  /** 页大小 */
  pageSizes: number[] = PageSizes;

  /** 分页 */
  paginator: PaginatorState = new PaginatorState();

  /** 列表数据 */
  list = [];

  /** 筛选 - 类型:当前选择 */
  curTypeValue = PendingedCategoryObjEnum.Risk;
  /** 筛选 - 类型数据 */
  typeList: Tabs[] = [
    { name: '风控审核', lang: 'risk.riskReview', value: PendingedCategoryObjEnum.Risk },
    { name: 'KYC审核', lang: 'risk.kycAudit', value: PendingedCategoryObjEnum.Kyc },
  ];

  dataEmpty = {
    curFormTypeValue: '', // 文件类型
    uid: '',
    time: [] as Date[],
  };

  data = cloneDeep(this.dataEmpty);

  ngOnInit() {
    this.subHeaderService.loadCountry(true);
    this.subHeaderService.merchantId$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.loadData(true);
    });
  }

  loadData(resetPage = false) {
    if (this.isLoading) return;

    resetPage && (this.paginator.page = 1);

    this.isLoading = true;
    const parmas = {
      tenantId: this.subHeaderService.merchantCurrentId,
      pendingUploadFormType: this.curTypeValue,
      uid: this.data.uid,
      startTime: toDateStamp(this.data.time[0]),
      endTime: toDateStamp(this.data.time[1], true),
      ...(this.data.curFormTypeValue ? { formType: this.data.curFormTypeValue } : {}),
      status: 'Normal',
      // type: 2,
      page: this.paginator.page,
      pageSize: this.paginator.pageSize,
    };
    this.riskApi.querynormalriskform(parmas).subscribe((res) => {
      this.isLoading = false;
      this.list = res?.list || [];
      this.paginator.total = res?.total;
    });
  }

  openPendingedPopup(item, pendingedType: PendingedCategoryEnum) {
    const modal = this.modalService.open(PendingedPopupComponent, { width: '740px' });
    modal.componentInstance['data'] = item;
    modal.componentInstance['pendingedType'] = pendingedType;
    modal.componentInstance.confirmSuccess.subscribe(() =>
      setTimeout(() => {
        this.loadData();
      }, 100)
    );
  }

  onReset() {
    this.data = cloneDeep(this.dataEmpty);
    this.loadData(true);
  }

  /**
   * 显示国家名称
   * @countryCode 国家二码
   */
  getCountryName(countryCode: string) {
    if (this.subHeaderService.countryList.length > 0 && countryCode) {
      const country = this.subHeaderService.countryList.find((v) => v.countryCode === countryCode);
      return country?.countryName || countryCode;
    }

    return countryCode || '-';
  }
}
