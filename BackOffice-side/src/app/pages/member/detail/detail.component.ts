import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  QueryList,
  TemplateRef,
  ViewChildren,
} from '@angular/core';
import { finalize, fromEvent, mergeWith, Subject, zip } from 'rxjs';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { AdjustmentAmountComponent } from 'src/app/pages/member/detail/adjustment-amount/adjustment-amount.component';
import { AppService } from 'src/app/app.service';
import { MemberApi } from 'src/app/shared/api/member.api';
import { MemberService } from '../member.service';
import { DrawerService, MatModal } from 'src/app/shared/components/dialogs/modal';
import { BalanceDetailComponent } from 'src/app/pages/member/detail/balance-detail/balance-detail.component';
import { SelectApi } from 'src/app/shared/api/select.api';
import { Currency } from 'src/app/shared/interfaces/currency';
import { skipUntil, takeUntil } from 'rxjs/operators';
import { VipApi } from 'src/app/shared/api/vip.api';
import { Clipboard } from '@angular/cdk/clipboard';
import { CurrencyService } from 'src/app/shared/service/currency.service';
import { ResetComponent } from 'src/app/pages/member/detail/member-modal/reset/reset.component';
import { TotalDepositComponent } from 'src/app/pages/member/detail/total-deposit/total-deposit.component';
import { CreditComponent } from 'src/app/pages/member/detail/credit/credit.component';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { BankApi } from 'src/app/shared/api/bank.api';
import { SubHeaderService } from 'src/app/_metronic/partials/layout/subheader/subheader1/sub-header.service';
import { ConfirmModalService } from 'src/app/shared/components/dialogs/confirm-modal/confirm-modal.service';
import { MemberDetailAuthenticationEuropeComponent } from './authentication-europe/authentication-europe.component';
import { AccountDisabledComponent } from './account-disabled/account-disabled.component';
import { MemberBindSocialMedia, MemberOverview, MemberStatistics } from 'src/app/shared/interfaces/member.interface';
import { DetailService } from './detail.service';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { CurrencyValuePipe } from 'src/app/shared/pipes/currency-value.pipe';
import { FormatMoneyPipe, FormatNumberDecimalPipe } from 'src/app/shared/pipes/big-number.pipe';
import { TimeFormatPipe } from 'src/app/shared/pipes/time.pipe';
import { ProgressComponent } from 'src/app/shared/components/progress/progress.component';
import { FormsModule } from '@angular/forms';
import { NgbPopover, NgbTooltip } from '@ng-bootstrap/ng-bootstrap';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { FormWrapComponent } from 'src/app/shared/components/form-row/form-wrap.component';
import { CurrencyIconDirective, IconSrcDirective } from 'src/app/shared/components/icon/icon.directive';
import { NgFor, NgIf, NgSwitch, NgSwitchCase, NgTemplateOutlet } from '@angular/common';
import { VipNamePipe } from 'src/app/shared/pipes/common.pipe';
import { CampaignDetailPopupComponent } from './campaign-detail-popup/campaign-detail-popup.component';
import { UserExportComponent } from 'src/app/pages/member/detail/user-export/user-export.component';
import { CommentsBoxComponent } from './comments-box/comments-box.component';
import { AddBadDataComponent } from 'src/app/pages/member/detail/add-bad-data/add-bad-data.component';
import { ModalFooterComponent } from 'src/app/shared/components/dialogs/modal/modal-footer.component';
import { ModalTitleComponent } from 'src/app/shared/components/dialogs/modal/modal-title.component';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss'],
  standalone: true,
  imports: [
    NgFor,
    IconSrcDirective,
    NgIf,
    CurrencyIconDirective,
    FormWrapComponent,
    NgTemplateOutlet,
    AngularSvgIconModule,
    NgSwitch,
    NgSwitchCase,
    NgbTooltip,
    NgbPopover,
    FormsModule,
    ProgressComponent,
    RouterOutlet,
    TimeFormatPipe,
    FormatMoneyPipe,
    FormatNumberDecimalPipe,
    CurrencyValuePipe,
    LangPipe,
    VipNamePipe,
    ModalFooterComponent,
    ModalTitleComponent,
  ],
})
export class DetailComponent implements OnInit, AfterViewInit, OnDestroy {
  isLoading = false;
  memberId!: number;
  userDetailsInfo: Partial<MemberStatistics & MemberOverview> = {};
  uid!: string;
  tenantId: any = 1;
  isTestAccount = false;

  constructor(
    public router: Router,
    private route: ActivatedRoute,
    private modal: MatModal,
    private appService: AppService,
    private api: MemberApi,
    private bankApi: BankApi,
    private vipApi: VipApi,
    private selectApi: SelectApi,
    private memberService: MemberService,
    private clipboard: Clipboard,
    public currencyService: CurrencyService,
    private drawer: DrawerService,
    public subHeader: SubHeaderService,
    private lang: LangService,
    private confirmService: ConfirmModalService,
    private detailSerivce: DetailService,
    private modalService: MatModal
  ) {
    const { id, uid, tenantId } = this.route.snapshot.queryParams;

    this.tenantId = tenantId;
    this.memberId = id;
    this.uid = uid;
  }

  activeTabW = 0;
  activeTabLeft = 0;
  activeTabIndex = 0;
  memberSpecialLink = '---';
  @ViewChildren('targetTab') nav!: QueryList<ElementRef<HTMLDivElement>>;
  list = []; // 表格列表数据
  statusListCopy: any[] = []; //群发站内信弹窗下拉列表
  sourceListCopy: any[] = [];
  setTabTimer = 0;
  tabs = [
    { name: '总览', path: 'overview', lang: 'overview' },
    { name: '体育', path: 'trade/sport', lang: 'sport' },
    { name: '游戏城', path: 'trade/casino', lang: 'gameCity' },
    { name: '真人娱乐城', path: 'trade/real', lang: 'liveGame' },
    { name: '彩票', path: 'trade/lottery', lang: 'lottery' },
    { name: '棋牌', path: 'trade/chess', lang: 'chessCard' },
    { name: '代理訊息', path: 'trade/proxy', lang: 'proxy' },
    { name: '游戏余额', path: 'trade/balance', lang: 'gameBalance' },
    { name: '手续费', path: 'trade/fee', lang: 'fee' },
  ];

  currencyList: Currency[] = [];
  vipUserInfo: any = {};
  balanceList = [
    { lang: 0, name: '总存款', valueKey: 'depositTotal', detailKey: 'totalDeposit' },
    { lang: 1, name: '总提款', valueKey: 'withdrawTotal', detailKey: 'totalWithdraw' },
    { lang: 2, name: '余额', valueKey: 'balance', detailKey: 'balances' },
    { lang: 3, name: '子钱包余额', valueKey: 'gameBalance', detailKey: 'gameWallet' },
    { lang: 4, name: '抵用金', valueKey: 'bonus', detailKey: 'creditDetail' },
    { lang: 7, name: '非粘性奖金', valueKey: 'cashableBonus', detailKey: 'nonSticky' },
    { lang: 8, name: 'Free Spin', valueKey: 'freeSpinBonusValidCount', detailKey: 'freeSpinDetail' },
    { lang: 5, name: '提款流水要求', valueKey: 'limitAmount', detailKey: 'limitAmounts' },
    { lang: 6, name: 'NGR', valueKey: 'nrgTotal', detailKey: 'xxx' },
  ];

  bankList: any[] = []; // 会员所绑定的银行卡列表
  userWallet: any[] = []; // 用户钱包
  bindWallet: any[] = []; // 绑定钱包
  stat: any = {}; // 用户数据统计
  socialList: MemberBindSocialMedia[] = []; // 会员所绑定的社交媒体列表
  isWatchlist = false; // 是否监视列表

  providerList: any[] = [];

  private _destroy$: any = new Subject<void>();
  private _init$: any = new Subject<void>();

  /** 是否商户5 - SIT：'28'; PROD: '20' */
  get isFiveMerchant() {
    return ['20', '28'].includes(this.tenantId);
  }

  /** getters */
  get isSvip(): boolean {
    return this.isFiveMerchant
      ? this.vipUserInfo?.isSvip
      : this.vipUserInfo?.currentVipLevel === 10 || this.vipUserInfo?.isSvip;
  }

  get currentTab() {
    return this._currentTab;
  }

  set currentTab(val: HTMLDivElement | null) {
    this._currentTab = val;
    this.activeTabLeft = (val?.offsetLeft || 0) + 15;
  }

  private _currentTab: HTMLDivElement | null = null;

  /** lifeCycle */
  ngOnInit(): void {
    this.subHeader.timeCurrent$
      .pipe(mergeWith(this.memberService.updateMember)) // merge更新会员信息流
      .pipe(skipUntil(this._init$)) // 如果没有初始化不执行
      .pipe(takeUntil(this._destroy$)) // 销毁时取消订阅
      .subscribe(() => this.loadData());

    /** URL 这里会优先执行一次进行初始化 */
    this.route.url.pipe(takeUntil(this._destroy$)).subscribe(() => {
      const index = this.getTabIndex();
      this.activeTabIndex = index;

      clearTimeout(this.setTabTimer);
      this.setTabTimer = window.setTimeout(() => {
        this.setTab(this.nav?.get(index)?.nativeElement!);
      }, 300);
    });

    this.route.queryParams.pipe(takeUntil(this._destroy$)).subscribe((v: any) => {
      if (!v.tenantId) return;

      this.tenantId = v.tenantId;
      this.memberId = v.id;
      this.uid = v.uid;

      this.loadData();
    });
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  ngAfterViewInit(): void {
    const initIndex = this.getTabIndex();
    const initDom = this.nav.get(initIndex)?.nativeElement;

    if (!initDom) return;
    this.activeTabIndex = initIndex;
    this.setTab(initDom);

    // 监听窗口大小变化
    fromEvent(window, 'resize')
      .pipe(takeUntil(this._destroy$))
      .subscribe(() => {
        const dom = this.nav.get(this.activeTabIndex)?.nativeElement;

        if (!dom) return;
        this.setTab(dom);
      });
  }

  /** methods */
  loadData() {
    this.loading(true);

    const shTime = this.subHeader.curTime;

    zip([
      this.api.getMemberOverView({ memberId: +this.memberId }),
      this.api.getMemberStatusSelect(),
      this.api.getMemberSourceSelect(),
      this.bankApi.getMemberBankList(this.uid),
      this.api.getVirtualAddress({ uid: this.uid, page: 1, pageSize: 999 }),
      this.api.getVirtualAddressUse({ uid: this.uid, page: 1, pageSize: 999 }),
      this.api.getStat({ uid: this.uid, beginTime: shTime[0], endTime: shTime[1] }),
    ])
      .pipe(
        finalize(() => {
          this._init$.next();
          this._init$.complete();
        })
      )
      .subscribe(([userDetailsInfo, statusList, sourceList, bankList, virtual, useVirtual, stat]) => {
        this.loading(false);
        this.statusListCopy = statusList;
        this.sourceListCopy = sourceList;
        this.bankList = bankList || [];
        this.bindWallet = Array.isArray(virtual?.list) ? virtual.list : [];
        this.userWallet = Array.isArray(useVirtual?.list) ? useVirtual.list : [];
        this.stat = stat;
        this.userDetailsInfo = { ...(userDetailsInfo || {}), ...(stat || {}) };
        this.isTestAccount = this.userDetailsInfo?.isTest || false;
        this.isWatchlist = this.userDetailsInfo?.isWatch || false;
        this.socialList = userDetailsInfo?.bindSocialInfo;
        this.memberService.userDetailsInfo.next(this.userDetailsInfo);
      });

    // 获取用户当前VIP信息
    this.getVipUserInfo();
  }

  /** 
    获取用户当前VIP信息（VIPA/VIPC）
    TODO: liz - VIPC权限会影响页面其他数据展示，需要进行单独拆分处理
  */
  getVipUserInfo() {
    this.loading(true);
    this.vipApi[this.isFiveMerchant ? 'getVipUserInfoVIPC' : 'getVipUserInfoVIPA']({
      tenantId: this.tenantId,
      uid: this.uid,
    }).subscribe((vipInfo) => {
      this.loading(false);
      this.vipUserInfo = vipInfo || {};
      this.memberService.processKeep.next(vipInfo?.processKeep);
    });
  }

  setTab(tabItem: HTMLDivElement): void {
    if (!tabItem) return;

    const first = tabItem.querySelector('a');

    if (first) {
      this.currentTab = tabItem;
      this.activeTabW = first.offsetWidth;
    }
  }

  getTabIndex(path?: string) {
    const { url } = this.router;
    return this.tabs.findIndex((e) => url.includes(path || e.path));
  }

  onNav(dom: HTMLDivElement, i: number, path: string) {
    this.activeTabIndex = i;
    this.setTab(dom);

    const queryParams = this.route.snapshot.queryParams;
    const id = queryParams['id'];
    const uid = queryParams['uid'];
    const tenantId = queryParams['tenantId'];

    this.router.navigate(['/member/list/detail/' + path], {
      queryParams: { id: id, uid: uid, tenantId: tenantId },
    });
  }

  // 打开调账浮层
  async openBill(): Promise<void> {
    if (!this.uid)
      return this.appService.showToastSubject.next({
        msgLang: 'member.overview.noMember',
      });

    const modal = this.modal.open(AdjustmentAmountComponent, {
      width: '750px',
    });
    if (!(await modal.result)) return;
    //刷新界面
    this.loadData();
  }

  // 打开身份认证浮层
  openAuthenticationModal() {
    const modal = this.modal.open(MemberDetailAuthenticationEuropeComponent, {
      width: '800px',
    });
    modal.componentInstance['tenantId'] = this.tenantId;
    modal.componentInstance['uid'] = this.uid;
    modal.componentInstance['userDetailsInfo'] = this.userDetailsInfo;
    modal.result.then(() => {}).catch(() => {});
  }

  // 活体验证
  memberSpecial(tpl: TemplateRef<any>): Promise<any> {
    return new Promise((resolve) => {
      const uid = this.userDetailsInfo.uid;
      const tenantId = String(this.userDetailsInfo.tenantId);
      if (!uid)
        return this.appService.showToastSubject.next({
          msgLang: 'member.kyc.noMemberTips',
        });
      if (this.userDetailsInfo['kycGradeCdoe'] === 'KycPrimary' || this.userDetailsInfo['kycGradeCdoe'] == '')
        return this.appService.showToastSubject.next({
          msgLang: 'member.kyc.verifyTips',
          successed: false,
        });
      //暂时写死语言，等待后端接口调整
      const memberSpecialObj: any = {
        locale: 'zh-CN',
      };
      this.api.postMemberSpecial(memberSpecialObj, uid, tenantId).subscribe((res) => {
        resolve(res);
        if (res.result) {
          //获取地址
          this.memberSpecialLink = res.result.redirectUrl;
          //打开活体验证弹窗
          this.onView(tpl);
          return;
        }
        this.appService.showToastSubject.next({ msgLang: 'common.operationFailed' });
      });
    });
  }

  /** 跳转到群发站内信 */
  async ontMessage() {
    const dataList = { statusList: this.statusListCopy, sourceList: this.sourceListCopy, isNowUser: true };
    const userIdListInfo = { id: this.memberId, uid: this.uid, tenantId: this.tenantId };
    this.detailSerivce.dataList = dataList;
    this.detailSerivce.userIdListInfo = userIdListInfo;
    this.router.navigate(['/member/list/detail/message-send'], {
      queryParams: {
        uid: this.route.snapshot.queryParams['uid'],
        id: this.route.snapshot.queryParams['id'],
        tenantId: this.route.snapshot.queryParams['tenantId'],
      },
    });
  }

  /** 跳转非粘性奖金 */
  toNonsticky() {
    this.router.navigate(['/member/list/detail/non-sticky'], {
      queryParams: {
        uid: this.uid,
        id: this.route.snapshot.queryParams['id'],
        tenantId: this.route.snapshot.queryParams['tenantId'],
      },
    });
  }

  /** 跳转FreeSpin详情 */
  toFreeSpinDetail() {
    this.router.navigate(['/member/list/detail/free-spin-detail'], {
      queryParams: {
        uid: this.uid,
        id: this.route.snapshot.queryParams['id'],
        tenantId: this.route.snapshot.queryParams['tenantId'],
      },
    });
  }

  async onView(tpl: TemplateRef<any>) {
    this.modal.open(tpl, { width: '440px' });
  }

  //复制
  async onCopy(text: string) {
    if (!text) return;
    const successed = this.clipboard.copy(text);
    const msg = successed ? await this.lang.getOne('common.copySuccess') : await this.lang.getOne('common.copyaFiled');
    this.appService.showToastSubject.next({ msg, successed });
  }

  // 获取头像
  getAvatar() {
    if (this.userDetailsInfo.avatar && this.userDetailsInfo.avatar.slice(0, 6) === 'avatar') {
      return `./assets/images/avatar/${this.userDetailsInfo.avatar}.png`;
    }
    return this.userDetailsInfo.avatar || 'https://via.placeholder.com/160x160';
  }

  /** 打开余额详情 */
  async openBalanceDetail(key: string, title: any) {
    const msg = await this.lang.getOne('member.detail.balanceType.' + title);
    const details = await this.lang.getOne('common.details');
    title = msg + details;

    switch (key) {
      case 'creditDetail': // 抵用金
        this.openCreditDetail();
        break;
      case 'totalDeposit': // 总存款
        this.openTotalDepositModal(key);
        break;
      case 'totalWithdraw': // 总提款
        this.openTotalDepositModal(key);
        break;
      case 'nonSticky': // 非粘性奖金
        this.toNonsticky();
        break;
      case 'freeSpinDetail': // Free Spin
        this.toFreeSpinDetail();
        break;
      default: // 信用等，冻结金额，剩余手续费，余额，子钱包余额，提款流水要求，NGR
        this.openBalanceDetailModal(key, title);
        break;
    }
  }

  /** 总存/取款弹窗 */
  async openTotalDepositModal(type: any) {
    const modal = this.drawer.open(TotalDepositComponent, { width: '60%', maxWidth: '800px' });
    modal.componentInstance['type'] = type;
    modal.componentInstance['uid'] = this.uid;
  }

  /** 抵用金弹窗 */
  async openCreditDetail() {
    const modal = this.modal.open(CreditComponent, { width: '600px' });
    modal.componentInstance['uid'] = this.uid;
  }

  /** 余额详情弹窗 - 信用等，冻结金额，剩余手续费，余额，子钱包余额，提款流水要求，NGR */
  async openBalanceDetailModal(key: string, title: string) {
    const balance = this.userDetailsInfo?.[key];
    const {
      ledLockedAmount = 0,
      ledReceiveAmount = 0,
      ledUnlockableAmount = 0,
    } = {
      ...this.userDetailsInfo,
    };
    const currencyArr = balance ? Object.keys(balance) : [];
    if (!balance || !currencyArr.length) return this.appService.showToastSubject.next({ msgLang: `common.emptyText` });

    const modal = this.modal.open(BalanceDetailComponent, { width: key === 'freezeAmount' ? '600px' : '500px' });
    modal.componentInstance['uid'] = this.route.snapshot.queryParams['uid'];
    modal.componentInstance['type'] = key;
    modal.componentInstance['title'] = title;
    modal.componentInstance.data = this.userDetailsInfo;
    modal.componentInstance['ledData'] = { ledLockedAmount, ledReceiveAmount, ledUnlockableAmount };

    // 子钱包余额
    if (key === 'gameWallet') {
      modal.componentInstance['list'] = currencyArr.map((key) => ({
        walletName: key,
        code: Object.keys(balance[key]),
        value: balance[key],
      }));
    }
    // 信用等，冻结金额，剩余手续费，余额，提款流水要求，NGR
    else {
      modal.componentInstance['list'] = currencyArr.map((key) => ({
        code: key,
        value: balance[key],
      }));
    }

    // 剩余手续费 - 清零手续费成功
    modal.componentInstance.clearFeeSuccess.subscribe(() => this.loadData());
  }

  /** 竞赛活动详情弹窗 */
  openCampaignDetail() {
    const modal = this.modal.open(CampaignDetailPopupComponent, { width: '500px' });
    modal.componentInstance['tenantId'] = this.tenantId;
    modal.componentInstance['uid'] = this.uid;
  }

  /** 意见箱详情弹窗 */
  openCommentsDetail() {
    const modal = this.drawer.open(CommentsBoxComponent, { width: '60%', maxWidth: '800px' });
    modal.componentInstance['tenantId'] = this.tenantId;
    modal.componentInstance['uid'] = this.uid;

    modal.result.then(() => {}).catch(() => {});
  }

  /** 跳转IP监控页面 */
  openIpSessionsDetail() {
    window.open(
      this.router.serializeUrl(
        this.router.createUrlTree(['/member/list/detail/ip-sessions'], {
          queryParams: { id: this.memberId, uid: this.uid, tenantId: this.tenantId },
        })
      )
    );
  }

  /** 跳转代客充值 */
  toValet() {
    this.router.navigate(['/finance/valet-recharge'], {
      queryParams: {
        uid: this.uid,
        actualName: this.userDetailsInfo['actualName'],
      },
    });
  }

  /** 打开重置 */
  openReset() {
    this.modal.open(ResetComponent, { width: '540px' });
  }

  /** 打开禁用弹窗 */
  onAllowUser(isAllow: boolean) {
    const info = this.memberService.userDetailsInfo.value || {};
    const modal = this.modal.open(AccountDisabledComponent, {
      width: '750px',
    });
    modal.componentInstance['tenantId'] = this.tenantId;
    modal.componentInstance['uid'] = this.uid;
    modal.componentInstance['isAllow'] = isAllow;
    modal.componentInstance['userDetailsInfo'] = info;
    modal.result.then(() => {}).catch(() => {});
  }

  async onIsTestAccount() {
    if (this.isTestAccount) return;
    if ((await this.confirmService.open('member.overview.setTestConfirm').result) !== true) return;

    this.appService.isContentLoadingSubject.next(true);
    this.api.setMemberTest(this.memberId, 1).subscribe((successed) => {
      this.appService.isContentLoadingSubject.next(false);

      if (successed === true) {
        this.appService.showToastSubject.next({ msgLang: 'common.operationSuccess', successed });
        return this.loadData();
      }

      this.appService.showToastSubject.next({ msgLang: 'common.operationFailed', successed });
    });
  }

  /** 监视列表 */
  onIsWatchlistChange(value) {
    this.appService.isContentLoadingSubject.next(true);
    this.api.setWatch(this.uid, value).subscribe((successed) => {
      this.appService.isContentLoadingSubject.next(false);

      this.appService.toastOpera(successed);
      this.loadData();
    });
  }

  /** 跳转通讯记录 */
  toCorrespondence() {
    window.open(
      this.router.serializeUrl(
        this.router.createUrlTree(['/member/list/detail/correspondence-note'], {
          queryParams: { id: this.memberId, uid: this.uid, tenantId: this.tenantId },
        })
      )
    );
  }

  /**
   * 导出
   */
  async openExport() {
    const modal = this.modal.open(UserExportComponent, { width: '540px' });
    modal.componentInstance.uid = this.uid;
    modal.componentInstance.tenantId = this.tenantId;
  }

  // 加载状态
  loading(v: boolean): void {
    this.isLoading = v;
    this.appService.isContentLoadingSubject.next(v);
  }

  /** 移除经理 */
  onRemoveManager() {
    this.loading(true);
    this.api
      .onRemoveAccountManager({
        tenantId: this.tenantId,
        uid: this.uid,
        accountId: this.userDetailsInfo.accountId || '',
      })
      .subscribe(async (data) => {
        this.loading(false);
        if (data) {
          this.memberService.updateMember.next();
          this.loadData();
        }
        const msg = data
          ? await this.lang.getOne('auManage.sys.removeSuccess')
          : await this.lang.getOne('auManage.sys.removeFailed');
        this.appService.showToastSubject.next({ msg, successed: data });
      });
  }

  // 打开添加不良数据浮层
  async addBadData(): Promise<void> {
    // if (!this.uid)
    //   return this.appService.showToastSubject.next({
    //     msgLang: 'member.overview.noMember',
    //   });
    const info = this.memberService.userDetailsInfo.value || {};
    const modal = this.modal.open(AddBadDataComponent, {
      width: '750px',
    });
    modal.componentInstance['tenantId'] = this.tenantId;
    modal.componentInstance['uid'] = this.uid;
    modal.componentInstance['userDetailsInfo'] = info;
    if (!(await modal.result)) return;
    //刷新界面
    this.loadData();
  }

  removeBadData(badDataId: number, tpl: any) {
    this.modalService.open(tpl, { width: '540px' }).result.then(({ value }) => {
      if (value) {
        this.api.deletememberbaddata({ badDataId: badDataId, tenantId: this.tenantId }).subscribe((res) => {
          this.appService.toastOpera(res === true);
          //刷新界面
          this.loadData();
        });
      }
    });
  }
}
