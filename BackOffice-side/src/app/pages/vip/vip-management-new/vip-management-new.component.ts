import { Component, OnInit } from '@angular/core';
import { cloneDeep } from 'lodash';
import { takeUntil, zip, tap, finalize } from 'rxjs';
import { AppService } from 'src/app/app.service';
import { VipApi } from 'src/app/shared/api/vip.api';
import { MatModal } from 'src/app/shared/components/dialogs/modal';
import { DestroyService, toDateStamp } from 'src/app/shared/models/tools.model';
import { SubHeaderService } from 'src/app/_metronic/partials/layout/subheader/subheader1/sub-header.service';
import { PageSizes, PaginatorState } from 'src/app/_metronic/shared/crud-table';
import { VipManagementNewLevelPopupComponent } from './level-popup/level-popup.component';
import { VipManagementNewBonusPopupComponent } from './bonus-popup/bonus-popup.component';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { CurrencyValuePipe } from 'src/app/shared/pipes/currency-value.pipe';
import { FormatMoneyPipe } from 'src/app/shared/pipes/big-number.pipe';
import { TimeFormatPipe } from 'src/app/shared/pipes/time.pipe';
import { PaginatorComponent } from 'src/app/_metronic/shared/crud-table/components/paginator/paginator.component';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { EmptyComponent } from 'src/app/shared/components/empty/empty.component';
import { NgFor, NgIf, NgClass } from '@angular/common';
import { OwlDateTimeComponent } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker.component';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { OwlDateTimeTriggerDirective } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker-trigger.directive';
import { FormsModule } from '@angular/forms';
import { OwlDateTimeInputDirective } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker-input.directive';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { LoadingDirective } from 'src/app/shared/directive/loading.directive';
import { VipPointsItem } from 'src/app/shared/interfaces/vip';

@Component({
  selector: 'app-vip-management-model-c',
  templateUrl: './vip-management-new.component.html',
  styleUrls: ['./vip-management-new.component.scss'],
  providers: [DestroyService],
  standalone: true,
  imports: [
    LoadingDirective,
    FormRowComponent,
    OwlDateTimeInputDirective,
    FormsModule,
    OwlDateTimeTriggerDirective,
    AngularSvgIconModule,
    OwlDateTimeComponent,
    NgFor,
    NgIf,
    EmptyComponent,
    NgClass,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    PaginatorComponent,
    TimeFormatPipe,
    FormatMoneyPipe,
    CurrencyValuePipe,
    LangPipe,
  ],
})
export class VipManagementNewComponent implements OnInit {
  constructor(
    private appService: AppService,
    private subHeader: SubHeaderService,
    private destroy$: DestroyService,
    private vipApi: VipApi,
    private modalService: MatModal
  ) {}

  pageSizes: number[] = [10, ...PageSizes]; // 页大小
  paginator: PaginatorState = new PaginatorState(); // 分页

  /** vip数据详情 */
  vipUserCount: number | string = '';
  vipLevelList: any[] = [];
  vipLevelLoading = true;

  /** 福利一览 */
  time: Date[] = []; // 时间区间
  glanceLoading = true;
  glanceList: any[] = [];

  /** 成长值配置 */
  isGrowthEdit = false;
  vipPointsLoading = true;
  growthList: VipPointsItem[] = [];

  growthEditList: VipPointsItem[] = [];

  /** 福利总览 */
  overviewList: any = [];
  overviewTime: Date[] = [];
  overviewLoading = false;

  /** 福利领取状况 */
  welfareStatus = 'All';
  welfareList: any[] = [];
  welfareLoading = false;

  ngOnInit() {
    this.subHeader.merchantId$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      zip(
        // 福利总览
        this.getVipOverview(),
        // vip数据详情
        this.summarybygrouplevel(),
        // 福利领取状况
        this.getVipReceiveDetail(true),
        // 福利一览
        this.getGlanceData(),
        // 成长值配置
        this.vip_manage_points_list()
      ).subscribe(() => {});
    });
  }

  /** vip数据详情 - 获取 */
  summarybygrouplevel() {
    this.vipLevelLoading = true;
    return this.vipApi.summarybygrouplevel({}, this.subHeader.merchantCurrentId).pipe(
      tap((res) => {
        this.vipUserCount = res?.data?.vipUserCount || 0;
        this.vipLevelList = res?.data?.reportVipLevelGroupResDtoList || [];
      }),
      finalize(() => (this.vipLevelLoading = false))
    );
  }

  /** 福利一览 - 获取数据 */
  getGlanceData() {
    const params = {
      TenantId: this.subHeader.merchantCurrentId,
      StartTime: toDateStamp(this.time[0], false),
      EndTime: toDateStamp(this.time[1], true),
    };
    this.glanceLoading = true;
    return this.vipApi.benefitsoverview(params).pipe(
      tap((res) => {
        this.glanceList = res || [];
      }),
      finalize(() => (this.glanceLoading = false))
    );
  }

  /** 福利一览 - 删除时间操作 */
  onClear(event: Event): void {
    event.stopPropagation();
    event.preventDefault();

    if (!this.time.length) return;

    this.time = [];
    this.getGlanceData().subscribe();
  }

  /** 成长值配置 - 获取 */
  vip_manage_points_list() {
    this.vipPointsLoading = true;
    return this.vipApi.vip_manage_points_list({}, this.subHeader.merchantCurrentId).pipe(
      tap((res) => {
        this.growthList = res?.data || [];
      }),
      finalize(() => (this.vipPointsLoading = false))
    );
  }

  /** 成长值配置 - 编辑操作 */
  onGrowthValueEdit() {
    this.growthEditList = cloneDeep(this.growthList);
    this.isGrowthEdit = !this.isGrowthEdit;
  }

  /** 成长值配置 - 编辑确认 */
  growthEdit() {
    this.vipPointsLoading = true;
    const parmas = this.growthEditList.map((v) => ({
      pointsId: v.pointsId,
      dailyMaxPoints: v.dailyMaxPoints,
      points: v.points,
    }));
    this.vipApi.vip_manage_points_batchupdateinfo(parmas, this.subHeader.merchantCurrentId).subscribe((res) => {
      this.vipPointsLoading = false;
      if (res?.code !== '0000') return this.appService.showToastSubject.next({ msg: res?.message });
      this.appService.showToastSubject.next({ msgLang: 'common.sucOperation', successed: true });
      this.isGrowthEdit = false;
      setTimeout(() => {
        this.vip_manage_points_list().subscribe();
      }, 100);
    });
  }

  /** 福利总览 - 获取数据 */
  getVipOverview() {
    const parmas = {
      TenantId: this.subHeader.merchantCurrentId,
      ...(this.overviewTime[0] ? { StartTime: toDateStamp(this.overviewTime[0]) } : {}),
      ...(this.overviewTime[1] ? { EndTime: toDateStamp(this.overviewTime[1], true) } : {}),
    };
    this.overviewLoading = true;
    return this.vipApi.getVipOverview(parmas).pipe(
      tap((res) => {
        this.overviewList = res || [];
      }),
      finalize(() => (this.overviewLoading = false))
    );
  }

  /** 福利总览 - 删除时间操作 */
  onOverviewTimeClear(event: Event): void {
    event.stopPropagation();
    event.preventDefault();

    if (!this.overviewTime.length) return;

    this.overviewTime = [];
    this.getVipOverview().subscribe();
  }

  /** 福利领取状况 - 获取数据 */
  getVipReceiveDetail(resetPage = false) {
    resetPage && (this.paginator.page = 1) && (this.paginator.pageSize = 10);
    const params = {
      TenantId: this.subHeader.merchantCurrentId,
      ReceiveType: this.welfareStatus,
      PageIndex: this.paginator.page,
      PageSize: this.paginator.pageSize,
    };
    this.welfareLoading = true;
    return this.vipApi.getVipReceiveDetail(params).pipe(
      tap((res) => {
        this.welfareLoading = false;
        this.welfareList = res?.list || [];
        this.paginator.total = res?.total || 0;
      }),
      finalize(() => {})
    );
  }

  /** 福利领取状况 - 选择 */
  selectWelfareStatus(type: string) {
    this.welfareStatus = type;
    this.getVipReceiveDetail(true).subscribe();
  }

  /** 等级配置 - 详情 弹窗 */
  openLevelPopup() {
    const modalRef = this.modalService.open(VipManagementNewLevelPopupComponent, {
      width: '500px',
      disableClose: true,
    });
    modalRef.componentInstance['list'] = this.vipLevelList;
    modalRef.result.then(() => {}).catch(() => {});
  }

  /** 福利配置 - 编辑 弹窗 */
  openBonusPopup() {
    const modalRef = this.modalService.open(VipManagementNewBonusPopupComponent, {
      width: '1400px',
      disableClose: true,
    });
    modalRef.componentInstance['tenantId'] = this.subHeader.merchantCurrentId;
    modalRef.result.then(() => {}).catch(() => {});
  }
}
