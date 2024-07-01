import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { CurrencyIconDirective, IconSrcDirective } from 'src/app/shared/components/icon/icon.directive';
import { CurrencyValuePipe } from 'src/app/shared/pipes/currency-value.pipe';
import { FormatMoneyPipe } from 'src/app/shared/pipes/big-number.pipe';
import { LabelComponent } from 'src/app/shared/components/label/label.component';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { TimeFormatPipe } from 'src/app/shared/pipes/time.pipe';
import { WinColorDirective, WinDirective } from 'src/app/shared/directive/common.directive';
import { EmptyComponent } from 'src/app/shared/components/empty/empty.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { PaginatorComponent } from 'src/app/_metronic/shared/crud-table/components/paginator/paginator.component';
import { FormsModule } from '@angular/forms';
import { LoadingDirective } from 'src/app/shared/directive/loading.directive';
import { DestroyService, timeFormat } from 'src/app/shared/models/tools.model';
import { AppService } from 'src/app/app.service';
import { MonitorService, MonitorServiceParams } from 'src/app/pages/risk/monitor/monitor.service';
import { SubHeaderService } from 'src/app/_metronic/partials/layout/subheader/subheader1/sub-header.service';
import { MonitorApi } from 'src/app/shared/api/monitor.api';
import { DrawerService } from 'src/app/shared/components/dialogs/modal';
import { finalize, takeUntil } from 'rxjs';
import {
  AbnormalMemberCategoryObjEnum,
  AbnormalMemberItem,
  AbnormalMemberStatusObjEnum,
} from 'src/app/shared/interfaces/monitor';
import { PageSizes, PaginatorState } from 'src/app/_metronic/shared/crud-table';
import { AbnormalMembersDetailComponent } from './abnormal-members-detail/abnormal-members-detail.component';
import { NgbPopover } from '@ng-bootstrap/ng-bootstrap';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { RiskApi } from 'src/app/shared/api/risk.api';

@Component({
  selector: 'abnormal-members',
  standalone: true,
  imports: [
    CommonModule,
    AngularSvgIconModule,
    CurrencyIconDirective,
    CurrencyValuePipe,
    FormatMoneyPipe,
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
    WinColorDirective,
    NgbPopover,
  ],
  templateUrl: './abnormal-members.component.html',
  styleUrls: ['../../monitor.component.scss', './abnormal-members.component.scss'],
  providers: [DestroyService],
})
export class AbnormalMembersComponent implements OnInit {
  constructor(
    private destroy$: DestroyService,
    private appService: AppService,
    public service: MonitorService,
    private subHeaderService: SubHeaderService,
    private api: MonitorApi,
    private riskApi: RiskApi,
    private drawer: DrawerService,
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

  protected readonly StatusEnum = AbnormalMemberStatusObjEnum;
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
  list: AbnormalMemberItem[] = [];

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
      category: AbnormalMemberCategoryObjEnum.AbnormalMember, // 负面清零 固定分类参数
    };
    return this.api.getAbnormalMember(sendData);
  }

  /**
   * 触发审核详情
   */
  onDetail(item: AbnormalMemberItem) {
    this.loading = true;
    this.api
      .getReviewDetail({ orderId: item.orderId })
      .pipe(finalize(() => (this.loading = false)))
      .subscribe((data) => {
        if (!data || !data.status)
          return this.appService.showToastSubject.next({ msgLang: 'risk.failToGet', successed: false });
        this.openDetail(data);
      });
  }

  /**
   * 异常会员 - 审核/详情弹窗
   */
  openDetail(data: AbnormalMemberItem) {
    const modal = this.drawer.open(AbnormalMembersDetailComponent, { width: '950px' });
    modal.componentInstance['uid'] = data.uid;
    modal.componentInstance['memberId'] = data.mid;
    modal.componentInstance['tenantId'] = this.subHeaderService.merchantCurrentId;
    modal.componentInstance['tab'] = this.service.curTab;
    modal.componentInstance['status'] = data.status;
    modal.componentInstance['data'] = data || {};
    modal.componentInstance.auditSuccess.subscribe(() =>
      setTimeout(() => {
        this.loadData();
      }, 100)
    );
  }

  /**
   * 判断游戏icon是否存在
   */
  isGameIcon(arr: number[], item: any[]) {
    if (!item) return false;
    return item.some((res) => arr.includes(res.gameCategory));
  }

  /**
   * 判断显示厂商
   */
  showGameMaker(arr: number[], item: any[]): string {
    let gameMaker = [];
    item.forEach((res) => {
      if (arr.includes(res.gameCategory)) gameMaker = gameMaker.concat(res.gameProviders);
    });
    return gameMaker.join(', ');
  }

  /**
   * 导出绑定
   * @private
   */
  exportLoading = false;
  private async exportBind() {
    const type = await this.lang.getOne('common.type');
    const typeValue = await this.lang.getOne('risk.unnormal');
    const amount = await this.lang.getOne('common.amount'); // 金额
    const currency = await this.lang.getOne('common.currency'); // 币种
    const IPAddress = await this.lang.getOne('risk.address'); // IP地址
    const reviewReason = await this.lang.getOne('risk.auditReason'); // 审核原因
    const betContent = await this.lang.getOne('member.table.betContent'); // 投注分类
    const NGRCurrency = this.lang.isLocal ? 'NGR币种' : 'NGR Currency'; // NGR币种
    const activeDay = await this.lang.getOne('member.table.activeDay'); // 活跃天数
    const creditPoints = await this.lang.getOne('member.table.creditPoints'); // 信用积分
    const createTime = await this.lang.getOne('risk.auto.applyTime');
    const status = await this.lang.getOne('common.status');
    const reviewer = await this.lang.getOne('risk.viewr'); // 审核人
    const reviewedTime = await this.lang.getOne('risk.checkTime'); // 审核时间

    this.service.exportExcel$.pipe(takeUntil(this.destroy$)).subscribe(({ isAll, exportExcel }) => {
      this.exportLoading = true;
      this.loadData$(false, isAll ? { page: 1, pageSize: 9e4 } : undefined)
        .pipe(finalize(() => (this.exportLoading = false)))
        .subscribe((res) => {
          exportExcel.AbnormalMember(
            res.list.map((e) => ({
              [type]: typeValue,
              UID: e.uid,
              [amount]: e.detail?.balance,
              [currency]: 'USDT',
              [IPAddress]: e.detail?.ipAddress ? `${e.detail?.ipAddress || ''}(${e.detail?.ipLocation || ''})` : '-', // IP地址
              [reviewReason]: e.detail?.reason || '-', // 审核原因
              [betContent]: [...new Set(e.detail?.playedGameInfo?.map((e) => e.gameProviders))].join(', '), // 投注分类
              NGR: e.detail?.ngr, // NGR
              [NGRCurrency]: 'USDT', // NGR币种
              [activeDay]: e.detail?.activeDays || '-', // 活跃天数
              [creditPoints]: e.detail?.creditScore || '-', // 信用积分
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
