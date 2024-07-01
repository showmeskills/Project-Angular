import { NgFor, NgSwitch, NgSwitchCase, NgSwitchDefault, NgIf, AsyncPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { ActivatedRoute, Router } from '@angular/router';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { lastValueFrom } from 'rxjs';
import { AppService } from 'src/app/app.service';
import { MemberApi } from 'src/app/shared/api/member.api';
import { EmptyComponent } from 'src/app/shared/components/empty/empty.component';
import { IconSrcDirective, CurrencyIconDirective } from 'src/app/shared/components/icon/icon.directive';
import { LabelComponent } from 'src/app/shared/components/label/label.component';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { FreeSpinStat } from 'src/app/shared/interfaces/member.interface';
import { FormatMoneyPipe } from 'src/app/shared/pipes/big-number.pipe';
import { CurrencyValuePipe } from 'src/app/shared/pipes/currency-value.pipe';
import { TimeFormatPipe } from 'src/app/shared/pipes/time.pipe';
import { BreadcrumbsService } from 'src/app/_metronic/partials/layout/subheader/subheader1/breadcrumbs.service';
import { PageSizes, PaginatorState } from 'src/app/_metronic/shared/crud-table';
import { PaginatorComponent } from 'src/app/_metronic/shared/crud-table/components/paginator/paginator.component';
import { finalize } from 'rxjs/operators';
import { ExcelFormat, JSONToExcelDownload, timeFormat } from 'src/app/shared/models/tools.model';
import { FreeSpinBonusDetailPopupComponent } from './bonus-detail-popup/bonus-detail-popup.component';
import { MatModal } from 'src/app/shared/components/dialogs/modal';
import { CurrencyService } from 'src/app/shared/service/currency.service';

@Component({
  selector: 'free-spin-detail',
  templateUrl: './free-spin-detail.component.html',
  styleUrls: ['./free-spin-detail.component.scss'],
  standalone: true,
  imports: [
    NgFor,
    NgSwitch,
    NgSwitchCase,
    IconSrcDirective,
    NgSwitchDefault,
    CurrencyIconDirective,
    NgIf,
    AngularSvgIconModule,
    MatFormFieldModule,
    MatSelectModule,
    FormsModule,
    MatOptionModule,
    PaginatorComponent,
    AsyncPipe,
    FormatMoneyPipe,
    CurrencyValuePipe,
    LangPipe,
    EmptyComponent,
    TimeFormatPipe,
    LabelComponent,
  ],
})
export class FreeSpinDetailComponent implements OnInit {
  constructor(
    public appService: AppService,
    public activatedRoute: ActivatedRoute,
    public router: Router,
    public lang: LangService,
    private breadcrumbsService: BreadcrumbsService,
    private api: MemberApi,
    private modalService: MatModal,
    private currencyService: CurrencyService
  ) {
    const { uid, id, tenantId } = activatedRoute.snapshot.queryParams; // params参数;
    this.mid = id;
    this.uid = uid;
    this.tenantId = tenantId;
  }

  mid: string;
  uid: string;
  tenantId: string;

  /** 页大小 */
  pageSizes: number[] = PageSizes;

  /** 分页 */
  paginator: PaginatorState = new PaginatorState();

  /** 当前tab */
  curTabValue = 0;
  /** tab列表 */
  tabList = [
    {
      name: '进行中以及已完成',
      lang: 'member.detail.freeSpin.activeCompleted',
      value: 0,
    },
    { name: '已过期', lang: 'member.coupon.expired', value: 1 },
  ];

  /** 统计数据 */
  stat: FreeSpinStat;

  /** 列表数据 */
  list = [];

  ngOnInit() {
    this.breadcrumbsService.setBefore([
      {
        name: '会员详情',
        lang: 'nav.memberDetail',
        click: () =>
          this.router.navigate(['/member/list/detail/overview'], {
            queryParams: { id: this.mid, uid: this.uid, tenantId: this.tenantId },
          }),
      },
    ]);

    this.getMemberFreeSpinBonusStat();
    this.loadData(true);
  }

  /** 统计数据 */
  getMemberFreeSpinBonusStat() {
    this.appService.isContentLoadingSubject.next(true);
    this.api.getmemberfreespinbonusstat(this.uid).subscribe((res) => {
      this.appService.isContentLoadingSubject.next(false);

      this.stat = res || {};
    });
  }

  /** 列表数据 */
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
      uid: this.uid,
      status: this.curTabValue,
      PageIndex: this.paginator.page,
      PageSize: this.paginator.pageSize,
      ...sendData,
    };

    return this.api.getmemberfreespinlist(parmas);
  }

  /** tab - 选择 */
  onSelectTab(value: number) {
    this.curTabValue = value;
    this.loadData(true);
  }

  /** 获取状态类型 */
  getLabelType(status: string) {
    const typeList = new Map([
      ['Pending', 'default'], // 待使用
      ['Using', 'primary'], // 使用中
      ['Completed', 'success'], // 已完成
      ['Expired', 'danger'], // 已过期
    ]);
    return typeList.get(status) || 'default';
  }

  /** 查看奖金详情 */
  onView(item) {
    const modalRef = this.modalService.open(FreeSpinBonusDetailPopupComponent, { width: '775px', autoFocus: false });
    modalRef.componentInstance['id'] = item.id;
    modalRef.result.then(() => {}).catch(() => {});
  }

  /**
   * 导出
   */
  async onExport(isAll: boolean) {
    let list = this.list;

    if (isAll) {
      try {
        this.appService.isContentLoadingSubject.next(true);
        const res = await lastValueFrom(this.loadData$(true, { pageSize: 9e5 }));
        this.appService.isContentLoadingSubject.next(false);
        list = Array.isArray(res?.list) ? res.list : [];
      } finally {
        this.appService.isContentLoadingSubject.next(false);
      }
    }

    if (!list.length) return this.appService.showToastSubject.next({ msgLang: 'common.emptyText' });

    const prizeName = await this.lang.getOne('member.detail.freeSpin.prizeName'); // 奖品名称
    const uid = 'UID'; // UID
    const prizeType = await this.lang.getOne('luckRoulette.drawRecord.prizeType'); // 奖品类型
    const activityTitle = await this.lang.getOne('member.detail.freeSpin.activityName'); // 活动名称
    const supportGames = await this.lang.getOne('member.detail.freeSpin.supportGames'); // 支持游戏
    const numberOfIssuances = await this.lang.getOne('member.detail.freeSpin.numberOfIssuances'); // 发放次数
    const usageCount = await this.lang.getOne('member.detail.freeSpin.usageCount'); // 使用次数
    const spinBonus = await this.lang.getOne('member.detail.freeSpin.spinBonus'); // 旋转奖金
    const disburseBonus = await this.lang.getOne('member.detail.freeSpin.disburseBonus'); // 发放奖金
    const issuanceTime = await this.lang.getOne('member.giveOut.IssuanceTime'); // 发放时间
    const status = await this.lang.getOne('common.status'); // 状态
    const currency = await this.lang.getOne('common.currency'); // 币种

    JSONToExcelDownload(
      list.map((e: any) => ({
        [prizeName]: e.prizeName || '',
        [uid]: ExcelFormat.str(e.uid),
        [prizeType]: 'Free Spin',
        [activityTitle]: e.activityName || '-',
        [supportGames]: e.providerName + '/' + e.gameName || '-',
        [numberOfIssuances]: e.maxSpinNum,
        [status]: e.statusDesc || '-',
        [issuanceTime]: timeFormat(e.createdTime) || '-',
        [usageCount]: e.currentSpinNum,
        [currency]: e.currency,
        [spinBonus]: e.balance,
        [spinBonus + '（USDT）']: this.currencyService.getUsdtRateAmount(e?.currency, e?.balance),
        [disburseBonus]: e.bonusAmount,
        [disburseBonus + '（USDT）']: this.currencyService.getUsdtRateAmount(e?.currency, e?.bonusAmount),
      })),
      'free-spin-detail ' + Date.now()
    );
  }
}
