import { Component, OnDestroy, OnInit } from '@angular/core';
import { PageSizes, PaginatorState } from 'src/app/_metronic/shared/crud-table';
import { NavigationEnd, Router } from '@angular/router';
import { AgentApi } from 'src/app/shared/api/agent.api';
import { AppService } from 'src/app/app.service';
import { toDateStamp } from 'src/app/shared/models/tools.model';
import { DistributeManagerComponent } from 'src/app/pages/proxy/review-list/distribute-manager/distribute-manager.component';
import { ProxyService } from 'src/app/pages/proxy/proxy.service';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { MatModal, MatModalRef } from 'src/app/shared/components/dialogs/modal';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { CurrencyValuePipe } from 'src/app/shared/pipes/currency-value.pipe';
import { TimeFormatPipe } from 'src/app/shared/pipes/time.pipe';
import { PaginatorComponent } from 'src/app/_metronic/shared/crud-table/components/paginator/paginator.component';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { LabelComponent } from 'src/app/shared/components/label/label.component';
import { WinDirective, WinColorDirective } from 'src/app/shared/directive/common.directive';
import { SelectChildrenDirective } from 'src/app/shared/directive/select.directive';
import { OwlDateTimeComponent } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker.component';
import { OwlDateTimeTriggerDirective } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker-trigger.directive';
import { OwlDateTimeInputDirective } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker-input.directive';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { MatOptionModule } from '@angular/material/core';
import { AsyncPipe, NgFor, NgIf, NgSwitch, NgSwitchCase } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { NavHeaderComponent } from '../nav-header/nav-header.component';

@Component({
  selector: 'proxy-list',
  templateUrl: './review-list.component.html',
  styleUrls: ['./review-list.component.scss'],
  standalone: true,
  imports: [
    NavHeaderComponent,
    MatFormFieldModule,
    MatSelectModule,
    FormsModule,
    NgFor,
    MatOptionModule,
    FormRowComponent,
    OwlDateTimeInputDirective,
    OwlDateTimeTriggerDirective,
    OwlDateTimeComponent,
    SelectChildrenDirective,
    NgIf,
    NgSwitch,
    NgSwitchCase,
    WinDirective,
    WinColorDirective,
    LabelComponent,
    AngularSvgIconModule,
    PaginatorComponent,
    TimeFormatPipe,
    CurrencyValuePipe,
    LangPipe,
    AsyncPipe,
  ],
})
export class ReviewListComponent implements OnInit, OnDestroy {
  constructor(
    private dialog: MatModal,
    public router: Router,
    private api: AgentApi,
    public appService: AppService,
    public proxyService: ProxyService,
    public lang: LangService
  ) {}

  pageSizes: number[] = PageSizes; // 页大小
  paginator: PaginatorState = new PaginatorState(); // 分页
  list: any[] = [];
  detail: any = {};
  isLoading = false;
  isReviewed = false;

  data: any = {};
  defaultData: any = {
    team: '',
    channelManager: '',
    proxyId: '',
    applyTimeBeginTime: undefined,
  };

  currentItem: any = {};
  dialogRef!: MatModalRef<any>;
  private _destroy$ = new Subject<void>();

  /** lifeCycle */
  ngOnInit(): void {
    /**
     * 页面被释放缓存后，ngOnInit不会被执行
     * 1. 在路由器事件中完成列表数据的更新。
     * 2. 必须是匹配‘编辑’路由返回才进行列表的初始化，避免在未缓存时切换路由造成二次请求。
     */
    this.router.events
      .pipe(
        filter((e) => e instanceof NavigationEnd),
        takeUntil(this._destroy$)
      )
      .subscribe(() => {
        if (this.router.routeReuseStrategy['curr'] === 'review/:id') this.loadData();
      });
    this.proxyService.value$.pipe(takeUntil(this._destroy$)).subscribe(() => this.onReset());
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  /** methods */
  onReset(): void {
    this.data = { ...this.defaultData };
    this.loadData(true);
  }

  // 获取数据
  loadData(resetPage = false) {
    resetPage && (this.paginator.page = 1);

    if (!this.proxyService.curTeamId) {
      this.list = [];
      this.paginator.total = 0;

      return;
    }

    this.appService.isContentLoadingSubject.next(true);
    this.api
      .proxy_audit_list_review({
        current: this.paginator.page,
        size: this.paginator.pageSize,
        state: this.isReviewed ? 1 : 0,
        ...this.data,
        tenantId: this.proxyService.curTenantId,
        team: this.proxyService.curTeamId,
        applyTimeBeginTime: toDateStamp(this.data.applyTimeBeginTime?.[0]),
        applyTimeEndTime: toDateStamp(this.data.applyTimeBeginTime?.[1], true),
      })
      .subscribe((res) => {
        this.appService.isContentLoadingSubject.next(false);
        this.detail = res?.data;
        this.list = this.detail?.records || [];
        this.paginator.total = this.detail?.total || 0;
      });
  }

  onTab(reviewed: boolean): void {
    if (this.isReviewed === reviewed) return;

    this.isReviewed = reviewed;
    this.loadData(true);
  }

  /** 分配渠道经理 */
  onDistribute(item: any): void {
    this.appService.isContentLoadingSubject.next(true);
    this.api.proxy_audit_basic(item.id).subscribe(async (res) => {
      this.appService.isContentLoadingSubject.next(false);

      this.dialogRef = this.dialog.open(DistributeManagerComponent, {
        width: '720px',
      });

      this.dialogRef.componentInstance['data'] = {
        ...item,
        ...(res?.data || {}),
      };

      (await this.dialogRef.result) && this.loadData();
    });
  }

  /** 分配渠道经理 */
  async onOpenReview(tpl, item: any): Promise<void> {
    this.currentItem = item;
    const modal: any = {};
    modal.dialog = this.dialog.open(tpl, { width: '720px' });

    const res = await modal.result;
    if (!res) return;
    this.loadData();
  }

  /** 审核 批准、拒绝 */
  onReviewProcess(isPass: boolean, close: any): void {
    if (this.appService.isContentLoadingSubject.value) return;
    this.appService.isContentLoadingSubject.next(true);
    this.api
      .proxy_audit_save({
        ...this.currentItem,
        auditId: this.currentItem.id,
        isDailySettlement: this.currentItem.applyType === 3,
        action: isPass ? 'approved_application' : 'rejected_application',
      })
      .subscribe((res) => {
        this.appService.isContentLoadingSubject.next(false);

        if (res.data === true) {
          this.loadData();
          this.dialogRef?.close();
          this.proxyService.triggerChange(); // 更新头部统计数据
          this.appService.showToastSubject.next({
            msgLang: 'marketing.pendingList.sucOperation',
            successed: true,
          });
          close();
        } else {
          this.appService.showToastSubject.next({
            msgLang: 'marketing.pendingList.operationFailed',
            successed: false,
          });
        }
      });
  }
}
