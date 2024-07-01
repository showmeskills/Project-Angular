import { Component, Input, OnInit } from '@angular/core';
import { AppService } from 'src/app/app.service';
import { AgentApi } from 'src/app/shared/api/agent.api';
import { AllianceApi } from 'src/app/shared/api/alliance.api';
import { DrawerService, MatModalRef } from 'src/app/shared/components/dialogs/modal';
import { PageSizes, PaginatorState } from 'src/app/_metronic/shared/crud-table';
import { RecommendFriendsDetailPopupDetailComponent } from './detail/detail.component';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { CurrencyValuePipe } from 'src/app/shared/pipes/currency-value.pipe';
import { FormatMoneyPipe } from 'src/app/shared/pipes/big-number.pipe';
import { TimeFormatPipe, TimeUTCFormatPipe } from 'src/app/shared/pipes/time.pipe';
import { PaginatorComponent } from 'src/app/_metronic/shared/crud-table/components/paginator/paginator.component';
import { MatOptionModule } from '@angular/material/core';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { EmptyComponent } from 'src/app/shared/components/empty/empty.component';
import { WinDirective, WinColorDirective } from 'src/app/shared/directive/common.directive';
import { CurrencyIconDirective } from 'src/app/shared/components/icon/icon.directive';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { NgIf, NgFor } from '@angular/common';
import { ModalTitleComponent } from 'src/app/shared/components/dialogs/modal/modal-title.component';

@Component({
  selector: 'recommend-friends-detail-popup',
  templateUrl: './detail-popup.component.html',
  styleUrls: ['./detail-popup.component.scss'],
  standalone: true,
  imports: [
    ModalTitleComponent,
    NgIf,
    NgFor,
    AngularSvgIconModule,
    CurrencyIconDirective,
    WinDirective,
    WinColorDirective,
    EmptyComponent,
    MatFormFieldModule,
    MatSelectModule,
    FormsModule,
    MatOptionModule,
    PaginatorComponent,
    TimeFormatPipe,
    FormatMoneyPipe,
    CurrencyValuePipe,
    TimeUTCFormatPipe,
    LangPipe,
  ],
})
export class RecommendFriendsDetailPopupComponent implements OnInit {
  constructor(
    public modal: MatModalRef<RecommendFriendsDetailPopupComponent>,
    public appService: AppService,
    private drawer: DrawerService,
    private allianceApi: AllianceApi,
    private agentApi: AgentApi
  ) {}

  @Input() type: any;
  @Input() tenantId: any;
  @Input() curTime: any[] = [];

  isLoading = false;
  pageSizes: number[] = PageSizes; // 调整每页个数的数组
  paginator: PaginatorState = new PaginatorState(); // 分页

  titleList: any[] = [
    { name: '常规返佣', value: 'regularRebate', lang: 'marketing.recommendFriends.regularRebate' },
    { name: '顶级推荐人', value: 'topReferrer', lang: 'marketing.recommendFriends.topReferrer' },
    { name: 'CPA奖励', value: 'cpaRewards', lang: 'marketing.recommendFriends.cpaRewards' },
    { name: '最新首存', value: 'firstDeposit', lang: 'game.proxy.firstDeposit' },
    { name: '最新注册', value: 'register', lang: 'game.proxy.latestRegistration' },
  ];

  // 头部筛选时间
  headerTime: Date[] = [];

  list: any[] = []; // 列表数据

  /** 是否商户5 - SIT：28; PROD: 20 */
  get isFiveMerchant() {
    return ['20', '28'].includes(this.tenantId);
  }

  ngOnInit() {
    // 时间初始化
    this.headerTime = this.curTime.length ? [this.curTime[0], this.curTime[1]] : [];
    this.loadData();
  }

  curTitle() {
    return this.titleList.find((v) => v.value === this.type)?.lang || '-';
  }

  loadData(resetPage = false) {
    resetPage && (this.paginator.page = 1);
    this[this.type]();
  }

  /** 常规返佣 - 获取数据 */
  regularRebate() {
    const parmas = {
      tenantId: this.tenantId,
      startTime: this.headerTime[0],
      endTime: this.headerTime[1],
      current: this.paginator.page,
      size: this.paginator.pageSize,
    };
    this.loading(true);
    this.allianceApi.getdailytotalcommissionrewardslist(parmas).subscribe((res) => {
      this.loading(false);

      this.list = res?.data?.records || [];
      this.paginator.total = res?.data?.total || 0;
    });
  }

  /** 顶级推荐人 - 获取数据 */
  topReferrer() {}

  /** CAP奖励 - 获取数据 */
  cpaRewards() {
    const parmas = {
      tenantId: this.tenantId,
      startTime: this.headerTime[0],
      endTime: this.headerTime[1],
      ...(!this.isFiveMerchant
        ? {
            current: this.paginator.page,
            size: this.paginator.pageSize,
          }
        : {
            Page: this.paginator.page,
            PageSize: this.paginator.pageSize,
          }),
    };
    this.loading(true);
    this.allianceApi.getdailytotalreferralrewardslist(parmas).subscribe((res) => {
      this.loading(false);

      this.list = res?.data?.records || [];
      this.paginator.total = res?.data?.total || 0;
    });
  }

  /** 最新首存 - 获取数据 */
  firstDeposit() {
    const parmas = {
      tenantId: this.tenantId,
      beginTime: this.headerTime[0],
      endTime: this.headerTime[1],
      ...(!this.isFiveMerchant
        ? {
            current: this.paginator.page,
            size: this.paginator.pageSize,
          }
        : {
            Page: this.paginator.page,
            PageSize: this.paginator.pageSize,
          }),
    };
    this.appService.isContentLoadingSubject.next(true);
    this[!this.isFiveMerchant ? 'agentApi' : 'allianceApi'].getftdlistpage(parmas).subscribe((res) => {
      this.appService.isContentLoadingSubject.next(false);

      this.list = (!this.isFiveMerchant ? res?.data?.records : res?.list) || [];
      this.paginator.total = (!this.isFiveMerchant ? res?.data?.total : res?.total) || 0;
    });
  }

  /** 最新注册 - 获取数据 */
  register() {
    const parmas = {
      tenantId: this.tenantId,
      beginTime: this.headerTime[0],
      endTime: this.headerTime[1],
      ...(!this.isFiveMerchant
        ? {
            current: this.paginator.page,
            size: this.paginator.pageSize,
          }
        : {
            Page: this.paginator.page,
            PageSize: this.paginator.pageSize,
          }),
    };
    this.appService.isContentLoadingSubject.next(true);
    this[!this.isFiveMerchant ? 'agentApi' : 'allianceApi'].getregisterpage(parmas).subscribe((res) => {
      this.appService.isContentLoadingSubject.next(false);

      this.list = (!this.isFiveMerchant ? res?.data?.records : res?.list) || [];
      this.paginator.total = (!this.isFiveMerchant ? res?.data?.total : res?.total) || 0;
    });
  }

  /** 打开 常规返佣/顶级推荐人CAP奖励 - 详情弹窗 */
  openDetailPopup(data: any) {
    const modal = this.drawer.open(RecommendFriendsDetailPopupDetailComponent, { width: '60%', maxWidth: '800px' });
    modal.componentInstance['tenantId'] = this.tenantId;
    modal.componentInstance['type'] = this.type;
    modal.componentInstance['data'] = data;
    modal.result.then(() => {}).catch(() => {});
  }

  // 加载状态
  loading(v: boolean): void {
    this.isLoading = v;
    this.appService.isContentLoadingSubject.next(v);
  }
}
