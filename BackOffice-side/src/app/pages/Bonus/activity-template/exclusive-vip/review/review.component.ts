import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { Router, ActivatedRoute } from '@angular/router';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { zip } from 'rxjs';
import { AppService } from 'src/app/app.service';
import { OwlDateTimeModule } from 'src/app/components/datetime-picker';
import { ActivityAPI } from 'src/app/shared/api/activity.api';
import { EmptyComponent } from 'src/app/shared/components/empty/empty.component';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { CurrencyIconDirective, IconSrcDirective } from 'src/app/shared/components/icon/icon.directive';
import { LabelComponent } from 'src/app/shared/components/label/label.component';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { TableSortComponent } from 'src/app/shared/components/table-sort/table-sort.component';
import { InputNumberDirective, InputFloatDirective } from 'src/app/shared/directive/input.directive';
import { ExclusiveVipReviewItem, PrizeTypeItem } from 'src/app/shared/interfaces/activity';
import { FormatMoneyPipe } from 'src/app/shared/pipes/big-number.pipe';
import { TimeFormatPipe } from 'src/app/shared/pipes/time.pipe';
import { PageSizes, PaginatorState } from 'src/app/_metronic/shared/crud-table';
import { PaginatorComponent } from 'src/app/_metronic/shared/crud-table/components/paginator/paginator.component';
import { PrizeService } from 'src/app/pages/Bonus/prize.service';
import { FormWrapComponent } from 'src/app/shared/components/form-row/form-wrap.component';
import { PrizeConfigPipe } from 'src/app/pages/Bonus/bonus.service';
import { CurrencyValuePipe } from 'src/app/shared/pipes/currency-value.pipe';
import { SelectChildrenDirective, SelectGroupDirective } from 'src/app/shared/directive/select.directive';
import { ConfirmModalService } from 'src/app/shared/components/dialogs/confirm-modal/confirm-modal.service';

@Component({
  selector: 'exclusive-vip-review',
  templateUrl: './review.component.html',
  styleUrls: ['./review.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormRowComponent,
    MatFormFieldModule,
    MatSelectModule,
    FormsModule,
    FormWrapComponent,
    MatOptionModule,
    PaginatorComponent,
    TimeFormatPipe,
    FormatMoneyPipe,
    LangPipe,
    OwlDateTimeModule,
    EmptyComponent,
    AngularSvgIconModule,
    LabelComponent,
    IconSrcDirective,
    TableSortComponent,
    InputNumberDirective,
    InputFloatDirective,
    PrizeConfigPipe,
    CurrencyIconDirective,
    CurrencyValuePipe,
    SelectChildrenDirective,
    SelectGroupDirective,
  ],
})
export class ExclusiveVipReviewComponent implements OnInit {
  constructor(
    private appService: AppService,
    public lang: LangService,
    public router: Router,
    private route: ActivatedRoute,
    private api: ActivityAPI,
    public prizeService: PrizeService,
    private confirmModalService: ConfirmModalService
  ) {
    const { id } = route.snapshot.params;
    this.tmpId = id;

    const { tenantId } = route.snapshot.queryParams;
    this.tenantId = +tenantId;
  }

  /** 活动模板ID */
  tmpId;

  /** 商户ID */
  tenantId;

  /** 页大小 */
  pageSizes: number[] = PageSizes;

  /** 分页 */
  paginator: PaginatorState = new PaginatorState();

  /** 奖品类型 */
  prizeTypeList: PrizeTypeItem[] = [];

  /** 当前tab */
  curTabValue = 1;
  /** tab列表 */
  tabList = [
    {
      name: '待审核记录',
      lang: 'member.activity.sencli16.pendingReviewList',
      releaseStatus: [1],
      value: 1,
    },
    {
      name: '历史记录',
      lang: 'member.activity.sencli16.historyRecord',
      releaseStatus: [0, 2, 3, 4, 5, 6, 7, 8],
      value: 2,
    },
  ];

  /** 列表数据 */
  list: ExclusiveVipReviewItem[] = [];

  ngOnInit() {
    this.appService.isContentLoadingSubject.next(true);
    zip(this.api.prize_getprizetypes(this.tenantId)).subscribe(([prizeType]) => {
      this.appService.isContentLoadingSubject.next(false);
      this.prizeTypeList = [...(prizeType?.data || [])];

      this.loadData(true);
    });
  }

  loadData(resetPage = false) {
    resetPage && (this.paginator.page = 1);

    const parmas = {
      tenantId: this.tenantId,
      tmpId: this.tmpId,
      releaseStatus: this.tabList.find((v) => v.value === this.curTabValue)?.releaseStatus,
      current: this.paginator.page,
      size: this.paginator.pageSize,
    };

    this.appService.isContentLoadingSubject.next(true);
    this.api.vipexclusive_backpag(parmas).subscribe((res) => {
      this.appService.isContentLoadingSubject.next(false);

      this.list = res?.data?.records || [];
      this.paginator.total = res?.data?.total || 0;
    });
  }

  /** tab - 选择 */
  onSelectTab(value) {
    this.curTabValue = value;
    this.loadData(true);
  }

  /** 获取奖品名称 */
  getPrizeName(prizeName: any[]) {
    if (Array.isArray(prizeName)) {
      const multi = this.lang.isLocal ? 'zh-cn' : 'en-us';
      return (
        prizeName.find((v) => v.lang === multi)?.prizeFullName ||
        prizeName.find((v) => v.lang === 'zh-cn')?.prizeFullName ||
        '-'
      );
    }
    return '-';
  }

  /**
   * 待审核列表 - 审批
   * @flag true=通过; false=驳回
   */
  onApproval(flag: boolean) {
    if (!this.list.length) return this.appService.showToastSubject.next({ msgLang: 'bonus.activity.noData' });

    const selectListIds = this.list.filter((v) => v.checked).map((v) => v.id);
    if (!selectListIds.length)
      return this.appService.showToastSubject.next({
        msgLang: flag ? 'bonus.activity.selApproveContent' : 'bonus.activity.selRejectFile',
      });

    const params = {
      tmpId: this.tmpId,
      auditType: 1, // 0-全部通过 ,1-批量通过
      audit: flag ? 1 : 0, // 0-拒绝 1-通过
      ids: selectListIds,
    };

    this.appService.isContentLoadingSubject.next(true);
    this.api.vipexclusive_reviewcallback(params).subscribe((res) => {
      this.appService.isContentLoadingSubject.next(false);

      if (res?.code !== '0000')
        return this.appService.showToastSubject.next(
          res?.message ? { msg: res?.message } : { msgLang: 'common.operationFailed' }
        );
      this.appService.showToastSubject.next({ msgLang: 'common.operationSuccess', successed: true });
      this.loadData(true);
    });
  }

  /** 待审核列表 - 审批：全体通过 */
  onAllPassed() {
    if (!this.list.length) return this.appService.showToastSubject.next({ msgLang: 'bonus.activity.noData' });

    this.confirmModalService
      .open({
        msgLang: 'member.activity.sencli16.isAllPass',
      })
      .result.then(() => {
        const params = {
          tmpId: this.tmpId,
          auditType: 0, // 0-全部通过 ,1-批量通过
          audit: 1, // 0-拒绝 1-通过
        };

        this.appService.isContentLoadingSubject.next(true);
        this.api.vipexclusive_reviewcallback(params).subscribe((res) => {
          this.appService.isContentLoadingSubject.next(false);

          if (res?.code !== '0000')
            return this.appService.showToastSubject.next(
              res?.message ? { msg: res?.message } : { msgLang: 'common.operationFailed' }
            );
          this.appService.showToastSubject.next({ msgLang: 'common.operationSuccess', successed: true });
          this.loadData(true);
        });
      })
      .catch(() => {});
  }
}
