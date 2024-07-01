import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { NgbPopover } from '@ng-bootstrap/ng-bootstrap';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { cloneDeep } from 'lodash';
import moment from 'moment';
import { finalize, lastValueFrom, takeUntil } from 'rxjs';
import { SubHeaderService } from 'src/app/_metronic/partials/layout/subheader/subheader1/sub-header.service';
import { PageSizes, PaginatorState } from 'src/app/_metronic/shared/crud-table';
import { PaginatorComponent } from 'src/app/_metronic/shared/crud-table/components/paginator/paginator.component';
import { AppService } from 'src/app/app.service';
import { OwlDateTimeModule } from 'src/app/components/datetime-picker';
import { StatApi } from 'src/app/shared/api/stat.api';
import { EmptyComponent } from 'src/app/shared/components/empty/empty.component';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { FormWrapComponent } from 'src/app/shared/components/form-row/form-wrap.component';
import { CurrencyIconDirective, IconSrcDirective } from 'src/app/shared/components/icon/icon.directive';
import { LabelComponent } from 'src/app/shared/components/label/label.component';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { TableSortComponent } from 'src/app/shared/components/table-sort/table-sort.component';
import { SelectChildrenDirective, SelectGroupDirective } from 'src/app/shared/directive/select.directive';
import { Tabs } from 'src/app/shared/interfaces/base.interface';
import { ReportViewerItem } from 'src/app/shared/interfaces/stat';
import {
  DestroyService,
  ExcelFormat,
  JSONToExcelDownload,
  timeFormat,
  toDateStamp,
} from 'src/app/shared/models/tools.model';
import { FormatMoneyPipe } from 'src/app/shared/pipes/big-number.pipe';
import { VipNamePipe } from 'src/app/shared/pipes/common.pipe';
import { CurrencyValuePipe } from 'src/app/shared/pipes/currency-value.pipe';
import { TimeFormatPipe } from 'src/app/shared/pipes/time.pipe';

@Component({
  selector: 'report-viewer',
  templateUrl: './report-viewer.component.html',
  styleUrls: ['./report-viewer.component.scss'],
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
    FormatMoneyPipe,
    LangPipe,
    OwlDateTimeModule,
    EmptyComponent,
    AngularSvgIconModule,
    LabelComponent,
    IconSrcDirective,
    TableSortComponent,
    TimeFormatPipe,
    FormWrapComponent,
    SelectChildrenDirective,
    SelectGroupDirective,
    CurrencyIconDirective,
    CurrencyValuePipe,
    VipNamePipe,
    NgbPopover,
  ],
})
export class ReportViewerComponent implements OnInit {
  constructor(
    public subHeaderService: SubHeaderService,
    private destroy$: DestroyService,
    public appService: AppService,
    private api: StatApi,
    public lang: LangService
  ) {}

  /** 页大小 */
  pageSizes: number[] = PageSizes;

  /** 分页 */
  paginator: PaginatorState = new PaginatorState();

  /** 列表栏目 */
  thList = [
    { name: 'UID', lang: 'system.reportViewer.uid', value: 'uid', checked: true },
    { name: '用户名', lang: 'system.reportViewer.username', value: 'userName', checked: true },
    { name: '姓名', lang: 'system.reportViewer.fullName', value: 'fullName', checked: true },
    { name: '生日', lang: 'system.reportViewer.dob', value: 'birthDay', checked: true },
    { name: '手机号', lang: 'system.reportViewer.phoneNumber', value: 'mobile' },
    { name: '邮箱地址', lang: 'system.reportViewer.emailAddress', value: 'email' },
    { name: '域名邮箱', lang: 'system.reportViewer.emailDomain', value: 'emailDomain' },
    { name: '注册日期', lang: 'system.reportViewer.createdDate', value: 'registeredTime' },
    { name: '注册IP', lang: 'system.reportViewer.registeredIP', value: 'registeredIp' },
    { name: '最近登录IP', lang: 'system.reportViewer.lastLoginIP', value: 'lastLoginIp' },
    { name: '最近登录日期', lang: 'system.reportViewer.lastLoginDate', value: 'lastLoginTime' },
    { name: '币种', lang: 'common.currency', value: 'currencies' },
    { name: '用户余额(USDT)', lang: 'system.reportViewer.userBalance', value: 'userBalance', checked: true },
    { name: '总存款(USDT)', lang: 'system.reportViewer.totalDeposit', value: 'totalDeposit' },
    { name: '总提款(USDT)', lang: 'system.reportViewer.totalWithdrawal', value: 'totalWithdrawal' },
    { name: '第一次存款日期', lang: 'system.reportViewer.firstDepositDate', value: 'firstDepositTime' },
    {
      name: '第一次存款成功金额(USDT)',
      lang: 'system.reportViewer.firstApprovalDepositAmount',
      value: 'firstDepositAmount',
    },
    {
      name: '用户总投注金额',
      lang: 'system.reportViewer.totalBetsWagering',
      value: 'totalBet',
    },
    { name: '投注产品', lang: 'system.reportViewer.bettingProducts', value: 'bettingProducts' },
    { name: 'VIP等级', lang: 'system.reportViewer.vipLevel', value: 'vipLevel' },
    { name: '风控等级', lang: 'system.reportViewer.riskLevel', value: 'riskControl' },
    { name: 'KYC等级', lang: 'system.reportViewer.kycLevel', value: 'kycLevel' },
    { name: '账号状态', lang: 'system.reportViewer.accountStatus', value: 'status' },
    { name: '红利限制', lang: 'system.reportViewer.withBonusRestrictions', value: 'withBonusRestrictions' },
    { name: '存款限制', lang: 'system.reportViewer.depositRestrictions', value: 'depositRestrictions' },
    { name: '提款限制', lang: 'system.reportViewer.wdRestrictions', value: 'withdrawalRestrictions' },
    { name: 'MA会员用户名', lang: 'system.reportViewer.maAffliateUsername', value: 'superiorUId' },
    { name: '第一次存款IP', lang: 'system.reportViewer.firstDepositIp', value: 'firstDepositIp' },
    { name: '第一次提款IP', lang: 'system.reportViewer.firstWithdrawalIp', value: 'firstWithdrawalIp' },
    { name: '第一次提款日期', lang: 'system.reportViewer.firstWithdrawalDate', value: 'firstWithdrawalDate' },
    {
      name: '第一次提款失败金额(USDT)',
      lang: 'system.reportViewer.firstDeclinedWithdrawalAmount',
      value: 'firstDeclinedWithdrawalAmount',
    },
    { name: '最后一次存款日期', lang: 'system.reportViewer.lastDepositDate', value: 'lastDepositDate' },
    { name: '最后一笔游戏日期', lang: 'system.reportViewer.lastGameDate', value: 'lastGameDate' },
    { name: '是否使用红利', lang: 'system.reportViewer.bonusUsed', value: 'bonusUsed' },
  ];

  /** 列表拓展 - 显示/隐藏 */
  expandFlag = false;

  /** 筛选 - 存款状态列表 */
  depositStatusList: Tabs[] = [
    { name: '成功', lang: 'system.reportViewer.success', value: 'Success' },
    { name: '失败 ', lang: 'system.reportViewer.failed', value: 'Failed' },
    { name: '待确认 ', lang: 'system.reportViewer.pending', value: 'Pending' },
  ];

  /** 筛选 - 存款尝试状态列表 */
  depositAttemptStatusList = [
    { name: '是', lang: 'bonus.activity.yes', value: true },
    { name: '否', lang: 'bonus.activity.no', value: false },
  ];

  dataEmpty = {
    uid: '', // UID
    depositStatus: '', // 存款状态
    depositAttemptStatus: '', // 存款尝试状态s
    balanceGreater: '', // 用户余额等于超过 x USDT
    balanceLess: '', // 用户余额少于等于 x USDT
    time: [moment().subtract(1, 'months').toDate(), new Date()] as Date[], // 用户创建时间（默认搜索一个月）

    order: '', // 排序字段
    isAsc: false, // 是否为升序排序
  };

  data = cloneDeep(this.dataEmpty);

  /** 列表数据 */
  list: ReportViewerItem[] = [];

  ngOnInit() {
    this.subHeaderService.merchantId$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.onReset();
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

  loadData$(resetPage = false, isExport = false) {
    resetPage && (this.paginator.page = 1);

    const parmas = {
      tenantId: this.subHeaderService.merchantCurrentId,
      uids: this.data.uid,
      depositType: this.data.depositStatus,
      depositAttempt: this.data.depositAttemptStatus,
      minBalance: this.data.balanceGreater,
      maxBalance: this.data.balanceLess,
      ...(this.data.time[0]
        ? {
            createStartTime: moment(Number(toDateStamp(this.data.time[0]))).format('YYYY-MM-DD HH:mm:ss'),
          }
        : {}),
      ...(this.data.time[1]
        ? {
            createEndTime: moment(Number(toDateStamp(this.data.time[1], true))).format('YYYY-MM-DD HH:mm:ss'),
          }
        : {}),
      page: this.paginator.page,
      pageSize: this.paginator.pageSize,
      ...(this.data.order
        ? {
            // orderBy: this.data.order,
            isAsc: this.data.isAsc,
          }
        : {}),
    };

    return this.api[isExport ? 'getmemberviewexport' : 'getmemberview'](parmas);
  }

  /**
   * 判断游戏icon是否存在
   * @Author FrankLin
   */
  isGameIcon(arr: number[], item: { gameCategory: number; gameProviders: string[] }[]) {
    if (!Array.isArray(item)) {
      return false;
    }
    return item.some((res) => arr.includes(res.gameCategory));
  }

  /**
   * 判断显示厂商
   * @Author FrankLin
   */
  showGameMaker(arr: number[], item: { gameCategory: number; gameProviders: string[] }[]): string {
    if (!Array.isArray(item)) {
      return '';
    }
    let gameMaker: string[] = [];
    item.forEach((res) => {
      if (arr.includes(res.gameCategory)) {
        gameMaker = gameMaker.concat(res.gameProviders);
      }
    });
    return gameMaker.join(', ');
  }

  /**
   * 返回所有游戏厂商
   * @Author FrankLin
   */
  getBetContent(e) {
    const list = [[1, 2], [3], [4], [5], [6]];
    const str = list
      .map((item) => this.showGameMaker(item, e.bettingProducts))
      .filter((gameMaker) => gameMaker !== '')
      .join(',');
    return str;
  }

  /** 获取币种 */
  getCurrencyList(currency: string) {
    if (!currency) return [];
    return Array.from(new Set(currency.split(',')));
  }

  /** 筛选 - 重置 */
  onReset() {
    this.data = cloneDeep(this.dataEmpty);
    this.loadData(true);
  }

  /**
   * 导出
   */
  async onExport() {
    let list: ReportViewerItem[] = [];

    try {
      this.appService.isContentLoadingSubject.next(true);
      const res = await lastValueFrom(this.loadData$(false, true));
      this.appService.isContentLoadingSubject.next(false);
      list = Array.isArray(res?.list) ? res.list : []; // success === false会自动抛出
    } finally {
      this.appService.isContentLoadingSubject.next(false);
    }

    if (!list.length) return this.appService.showToastSubject.next({ msgLang: 'common.emptyText' });

    const username = await this.lang.getOne('system.reportViewer.username'); // 用户名
    const fullName = await this.lang.getOne('system.reportViewer.fullName'); // 姓名
    const dob = await this.lang.getOne('system.reportViewer.dob'); // 生日
    const phoneNumber = await this.lang.getOne('system.reportViewer.phoneNumber'); // 手机号
    const emailAddress = await this.lang.getOne('system.reportViewer.emailAddress'); // 邮箱地址
    const emailDomain = await this.lang.getOne('system.reportViewer.emailDomain'); // 域名邮箱
    const createdDate = await this.lang.getOne('system.reportViewer.createdDate'); // 注册日期
    const registeredIP = await this.lang.getOne('system.reportViewer.registeredIP'); // 注册IP
    const lastLoginIP = await this.lang.getOne('system.reportViewer.lastLoginIP'); // 最近登录IP
    const lastLoginDate = await this.lang.getOne('system.reportViewer.lastLoginDate'); // 最近登录日期
    const userBalance = await this.lang.getOne('system.reportViewer.userBalance'); // 用户余额
    const currency = await this.lang.getOne('common.currency'); // 币种
    const totalDeposit = await this.lang.getOne('system.reportViewer.totalDeposit'); // 总存款
    const totalWithdrawal = await this.lang.getOne('system.reportViewer.totalWithdrawal'); // 总提款
    const firstDepositDate = await this.lang.getOne('system.reportViewer.firstDepositDate'); // 第一次存款日期
    const firstApprovalDepositAmount = await this.lang.getOne('system.reportViewer.firstApprovalDepositAmount'); // 第一次存款成功金额
    const totalBetsWagering = await this.lang.getOne('system.reportViewer.totalBetsWagering'); // 用户总投注金额
    const bettingProducts = await this.lang.getOne('system.reportViewer.bettingProducts'); // 投注产品
    const vipLevel = await this.lang.getOne('system.reportViewer.vipLevel'); // VIP等级
    const riskLevel = await this.lang.getOne('system.reportViewer.riskLevel'); // 风控等级
    const kycLevel = await this.lang.getOne('system.reportViewer.kycLevel'); // KYC等级
    const accountStatus = await this.lang.getOne('system.reportViewer.accountStatus'); // 状态
    const withBonusRestrictions = await this.lang.getOne('system.reportViewer.withBonusRestrictions'); // 红利限制
    const depositRestrictions = await this.lang.getOne('system.reportViewer.depositRestrictions'); // 存款限制
    const wdRestrictions = await this.lang.getOne('system.reportViewer.wdRestrictions'); // 提款限制
    const maAffliateUsername = await this.lang.getOne('system.reportViewer.maAffliateUsername'); // MA会员用户名
    const firstDepositIp = await this.lang.getOne('system.reportViewer.firstDepositIp'); // 第一次存款IP
    const firstWithdrawalIp = await this.lang.getOne('system.reportViewer.firstWithdrawalIp'); // 第一次提款IP
    const firstWithdrawalDate = await this.lang.getOne('system.reportViewer.firstWithdrawalDate'); // 第一次提款日期
    const firstDeclinedWithdrawalAmount = await this.lang.getOne('system.reportViewer.firstDeclinedWithdrawalAmount'); // 第一次提款失败金额(USDT)
    const lastDepositDate = await this.lang.getOne('system.reportViewer.lastDepositDate'); // 最后一次存款日期
    const lastGameDate = await this.lang.getOne('system.reportViewer.lastGameDate'); // 最后一笔游戏日期
    const bonusUsed = await this.lang.getOne('system.reportViewer.bonusUsed'); // 是否使用红利

    const status = {
      ['Normal']: await this.lang.getOne('member.list.normal'),
      ['Freezing']: await this.lang.getOne('member.list.accountLock'),
      ['Disable']: await this.lang.getOne('member.list.accountDisabled'),
      ['DisablePart']: await this.lang.getOne('member.list.partiallyDisabled'),
      ['NotActive']: await this.lang.getOne('member.list.inactivated'),
      ['Deleted']: await this.lang.getOne('member.list.accountDeletion'),
    };

    const booleanStatus = {
      ['true']: await this.lang.getOne('bonus.activity.yes'),
      ['false']: await this.lang.getOne('bonus.activity.no'),
    };

    JSONToExcelDownload(
      list.map((e) => ({
        ['UID']: ExcelFormat.str(e.uid),
        [username]: e.userName || '-',
        [fullName]: e.fullName || '-',
        [dob]: timeFormat(e.birthDay, 'YYYY-MM-DD'),
        [phoneNumber]: e.mobile || '-',
        [emailAddress]: e.email || '-',
        [emailDomain]: e.emailDomain || '-',
        [createdDate]: timeFormat(e.registeredTime),
        [registeredIP]: e.registeredIp || '-',
        [lastLoginIP]: e.lastLoginIp || '-',
        [lastLoginDate]: timeFormat(e.lastLoginTime),
        [userBalance]: e.userBalance,
        [currency]: e.currencies || '-',
        [totalDeposit]: e.totalDeposit,
        [totalWithdrawal]: e.totalWithdrawal,
        [firstDepositDate]: timeFormat(e.firstDepositTime),
        [firstApprovalDepositAmount]: e.firstDepositAmount,
        [totalBetsWagering]: e.totalBet,
        [bettingProducts]: this.getBetContent(e),
        [vipLevel]: 'VIP' + e.vipLevel,
        [riskLevel]: e.riskControl,
        [kycLevel]: e.kycLevel,
        [accountStatus]: status[e.status],
        [withBonusRestrictions]: booleanStatus[String(e.withBonusRestrictions)],
        [depositRestrictions]: booleanStatus[String(e.depositRestrictions)],
        [wdRestrictions]: booleanStatus[String(e.withdrawalRestrictions)],
        [maAffliateUsername]: e.superiorUId || '-',
        [firstDepositIp]: e.firstDepositIp || '-',
        [firstWithdrawalIp]: e.firstWithdrawalIp || '-',
        [firstWithdrawalDate]: timeFormat(e.firstWithdrawalDate),
        [firstDeclinedWithdrawalAmount]: e.firstDeclinedWithdrawalAmount,
        [lastDepositDate]: timeFormat(e.lastDepositDate),
        [lastGameDate]: timeFormat(e.lastGameDate, 'YYYY-MM-DD'),
        [bonusUsed]: booleanStatus[String(e.bonusUsed)],
      })),

      'report-viewer-list ' + Date.now()
    );
  }
}
