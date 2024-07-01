import { Component, Input, OnInit } from '@angular/core';
import { AppService } from 'src/app/app.service';
import { AllianceApi } from 'src/app/shared/api/alliance.api';
import { MatModalRef } from 'src/app/shared/components/dialogs/modal';
import { PageSizes, PaginatorState } from 'src/app/_metronic/shared/crud-table';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { TimeUTCFormatPipe } from 'src/app/shared/pipes/time.pipe';
import { CurrencyValuePipe } from 'src/app/shared/pipes/currency-value.pipe';
import { FormatMoneyPipe } from 'src/app/shared/pipes/big-number.pipe';
import { PaginatorComponent } from 'src/app/_metronic/shared/crud-table/components/paginator/paginator.component';
import { MatOptionModule } from '@angular/material/core';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { EmptyComponent } from 'src/app/shared/components/empty/empty.component';
import { NgSwitch, NgSwitchCase, NgFor, NgIf } from '@angular/common';
import { CurrencyIconDirective } from 'src/app/shared/components/icon/icon.directive';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { ModalTitleComponent } from 'src/app/shared/components/dialogs/modal/modal-title.component';

@Component({
  selector: 'recommend-friends-detail-popup-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss'],
  standalone: true,
  imports: [
    ModalTitleComponent,
    AngularSvgIconModule,
    CurrencyIconDirective,
    NgSwitch,
    NgSwitchCase,
    NgFor,
    NgIf,
    EmptyComponent,
    MatFormFieldModule,
    MatSelectModule,
    FormsModule,
    MatOptionModule,
    PaginatorComponent,
    FormatMoneyPipe,
    CurrencyValuePipe,
    TimeUTCFormatPipe,
    LangPipe,
  ],
})
export class RecommendFriendsDetailPopupDetailComponent implements OnInit {
  constructor(
    public modal: MatModalRef<RecommendFriendsDetailPopupDetailComponent>,
    public appService: AppService,
    private allianceApi: AllianceApi
  ) {}

  @Input() type: any;
  @Input() data: any;
  @Input() tenantId: any;

  isLoading = false;
  pageSizes: number[] = PageSizes; // 调整每页个数的数组
  paginator: PaginatorState = new PaginatorState(); // 分页

  titleList: any[] = [
    { name: '常规返佣 - 详情', lang: 'marketing.recommendFriends.regularRebate', value: 'regularRebate' },
    { name: '顶级推荐人 - 详情', lang: 'marketing.recommendFriends.topReferrer', value: 'topReferrer' },
    { name: 'CPA奖励 - 详情', lang: 'marketing.recommendFriends.cpaRewards', value: 'cpaRewards' },
  ];

  list: any[] = []; // 列表数据

  ngOnInit() {
    this.loadData(true);
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
      rewardTime: this.data?.rewardDate,
      current: this.paginator.page,
      size: this.paginator.pageSize,
    };
    this.loading(true);
    this.allianceApi.getdailycommissionrewardslist(parmas).subscribe((res) => {
      this.loading(false);

      this.list = res?.data?.list || [];
      this.paginator.total = res?.data?.total || 0;
    });
  }

  /** CPA奖励 - 获取数据 */
  cpaRewards() {
    const parmas = {
      tenantId: this.tenantId,
      rewardTime: this.data?.rewardDate,
      current: this.paginator.page,
      size: this.paginator.pageSize,
    };
    this.loading(true);
    this.allianceApi.getdailyreferralrewardslist(parmas).subscribe((res) => {
      this.loading(false);

      this.list = res?.data?.list || [];
      this.paginator.total = res?.data?.total || 0;
    });
  }

  topReferrer() {}

  // 加载状态
  loading(v: boolean): void {
    this.isLoading = v;
    this.appService.isContentLoadingSubject.next(v);
  }
}
