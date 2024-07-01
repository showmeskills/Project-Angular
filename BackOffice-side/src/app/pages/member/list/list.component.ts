import { LangService } from 'src/app/shared/components/lang/lang.service';
import {
  Component,
  Directive,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { PageSizes, PaginatorState } from 'src/app/_metronic/shared/crud-table';
import { NavigationEnd, Router } from '@angular/router';
import { AppService } from 'src/app/app.service';
import { filter, finalize, forkJoin, lastValueFrom, Subject, switchMap } from 'rxjs';
import { ExcelFormat, JSONToExcelDownload, toDateStamp, toFormatMoney } from 'src/app/shared/models/tools.model';
import { PermissionApi } from 'src/app/shared/api/permission.api';
import { MemberApi } from 'src/app/shared/api/member.api';
import moment from 'moment';
import { InviteVipComponent } from 'src/app/pages/member/invite-vip/invite-vip.component';
import { VipApi } from 'src/app/shared/api/vip.api';
import { take, takeUntil, tap } from 'rxjs/operators';
import { DrawerService, MatModal } from 'src/app/shared/components/dialogs/modal';
import { SubHeaderService } from 'src/app/_metronic/partials/layout/subheader/subheader1/sub-header.service';
import { MatOption, MatOptionModule } from '@angular/material/core';
import { cloneDeep } from 'lodash';
import { DetailService } from 'src/app/pages/member/detail/detail.service';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { CurrencyValuePipe } from 'src/app/shared/pipes/currency-value.pipe';
import { BigNumberPipe, FormatMoneyPipe } from 'src/app/shared/pipes/big-number.pipe';
import { TimeFormatPipe } from 'src/app/shared/pipes/time.pipe';
import { PaginatorComponent } from 'src/app/_metronic/shared/crud-table/components/paginator/paginator.component';
import { NgbPopover } from '@ng-bootstrap/ng-bootstrap';
import { CurrencyIconDirective } from 'src/app/shared/components/icon/icon.directive';
import { SelectChildrenDirective, SelectGroupDirective } from 'src/app/shared/directive/select.directive';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { OwlDateTimeComponent } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker.component';
import { OwlDateTimeTriggerDirective } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker-trigger.directive';
import { OwlDateTimeInputDirective } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker-input.directive';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgFor, NgIf, NgSwitch, NgSwitchCase, NgTemplateOutlet } from '@angular/common';
import { MemberListTableComponent } from 'src/app/pages/member/list/list-table/list-table.component';
import { VipNamePipe } from 'src/app/shared/pipes/common.pipe';
import { SubServiceBaseResponse } from 'src/app/shared/interfaces/base.interface';
import {
  CheckSvipItem,
  CheckSVIPTipTpl,
  ClientSourceEnum,
  ClientSourceSelect,
  MemberItem,
  MemberListParams,
  MemberListSeniorQueryTypeEnum,
  MemberStatusEnum,
  MemberStatusKeyEnum,
  MemberStatusSelect,
  MemberTypeEnum,
} from 'src/app/shared/interfaces/member.interface';
import { InputTrimDirective } from 'src/app/shared/directive/input.directive';
import { AttrDisabledDirective } from 'src/app/shared/directive/d-disabled.directive';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { EmptyModule } from 'src/app/shared/components/empty/empty.module';

/**
 * 设置VIP模态框回传数据
 */
@Directive({
  selector: 'ng-template[svipTipsTpl]',
  standalone: true,
})
export class SVIPTplDirective {
  constructor(
    public tplRef: TemplateRef<CheckSVIPTipTpl>,
    public viewContainer: ViewContainerRef
  ) {}

  static ngTemplateContextGuard(dir: SVIPTplDirective, ctx: unknown): ctx is CheckSVIPTipTpl {
    return true;
  }
}

@Component({
  selector: 'member-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  standalone: true,
  imports: [
    NgIf,
    FormsModule,
    FormRowComponent,
    OwlDateTimeInputDirective,
    OwlDateTimeTriggerDirective,
    OwlDateTimeComponent,
    MatFormFieldModule,
    MatSelectModule,
    NgFor,
    MatOptionModule,
    AngularSvgIconModule,
    SelectChildrenDirective,
    SelectGroupDirective,
    NgTemplateOutlet,
    CurrencyIconDirective,
    NgbPopover,
    NgSwitch,
    NgSwitchCase,
    PaginatorComponent,
    TimeFormatPipe,
    BigNumberPipe,
    FormatMoneyPipe,
    CurrencyValuePipe,
    LangPipe,
    MemberListTableComponent,
    VipNamePipe,
    SVIPTplDirective,
    InputTrimDirective,
    AttrDisabledDirective,
    ReactiveFormsModule,
    EmptyModule,
  ],
  animations: [
    trigger('slideInOut', [
      state(
        'in',
        style({
          height: '*',
          width: '*',
        })
      ),
      state(
        'out',
        style({
          opacity: '0',
          overflow: 'hidden',
          height: '0px',
          width: '0px',
        })
      ),
      transition('in => out', animate('300ms ease-in-out')),
      transition('out => in', animate('300ms ease-in-out')),
    ]),
  ],
})
export class ListComponent implements OnInit, OnDestroy {
  private _destroyed = new Subject<void>();

  constructor(
    public router: Router,
    private api: MemberApi,
    private fb: FormBuilder,
    private permissionApi: PermissionApi,
    private appService: AppService,
    private modal: MatModal,
    private vipApi: VipApi,
    private lang: LangService,
    public subHeaderService: SubHeaderService,
    private detailSerivce: DetailService,
    private drawer: DrawerService
  ) {}

  pageSizes: number[] = PageSizes; // 页大小
  paginator: PaginatorState = new PaginatorState(); // 分页

  _list: MemberItem[] = []; // 表格列表数据
  statusList: MemberStatusSelect[] = []; // 用户状态下拉列表
  sourceList: ClientSourceSelect[] = []; // 来源下拉列表

  // VIP等级下拉列表 - 默认VIPA
  vipLevelList: { name: string; value: number }[] = [];

  /**
   * 最近存款下拉列表
   */
  depositTimeList = [
    { name: '7D', value: 7 },
    { name: '15D', value: 15 },
    { name: '30D', value: 30 },
    { name: '90D', value: 90 },
    { name: '180D', value: 180 },
  ];

  /**
   * 最近登录下拉列表
   */
  loginTimeList = [
    { name: '7D', value: 7 },
    { name: '15D', value: 15 },
    { name: '30D', value: 30 },
    { name: '90D', value: 90 },
    { name: '180D', value: 180 },
  ];

  /**
   * 风控等级列表
   */
  riskControlList = ['R1', 'R2', 'R3', 'R4', 'R5'];

  isLoading = false; // 是否处于加载
  DATA_EMPTY = {
    content: '',
    superiorId: '', // 代理ID
    vipLevel: ['', ...[...new Array(11)].map((e, i) => i)] as any[], // 默认VIPA等级的值数组
    source: '' as '' | ClientSourceEnum,
    status: '' as '' | MemberStatusEnum,
    memberType: '' as '' | MemberTypeEnum, // 会员类型：测试会员、正式会员
    orderField: 'LastLoginTime' as 'registerTime' | 'lastLoginTime' | 'Balance' | '',
    isAsc: false,
    registryTime: [] as Date[],
    // 最近存款时间
    depositDays: '',
    // 最近登录时间
    loginDays: '',
    // 风控等级
    riskControl: '',
    /** 经理账号id */
    accountId: '',
  };

  data = cloneDeep(this.DATA_EMPTY); // 表单搜索数据

  vipCheckList: CheckSvipItem[] = [];

  statusListCopy: MemberStatusSelect[] = []; //群发站内信弹窗下拉列表
  sourceListCopy: ClientSourceSelect[] = [];

  /** 如果单独列表展示传入 */
  @Input() propList: undefined | MemberItem[] = undefined;

  /** 账户经理下拉 */
  accuntManagerList: Array<{ id: string; name: string }> = [];

  /** 设置会员经理的id */
  accountId = '';

  /** getters */
  // 是否精简显示
  get isSimple() {
    return this.propList !== undefined;
  }

  // 表格列表
  get list(): MemberItem[] {
    return this.isSimple ? (this.propList as MemberItem[]) : this._list;
  }

  // 获取已勾选的用户
  get checkedList() {
    return this.list.filter((e) => e['checked']);
  }

  // 区分VIPA/VIPC，获取不同的VIP等级的值数组
  get dataVipLevel() {
    return this.subHeaderService.isFiveMerchant
      ? (['', ...[...new Array(125)].map((e, i) => i), 999999] as any[])
      : (['', ...[...new Array(11)].map((e, i) => i)] as any[]);
  }

  /** lifeCycle */
  async ngOnInit() {
    forkJoin([this.api.getMemberStatusSelect(), this.api.getMemberSourceSelect()]).subscribe(
      ([statusList, sourceList]) => {
        this.statusList = [...statusList];
        this.sourceList = [...sourceList];
        this.statusListCopy = statusList;
        this.sourceListCopy = sourceList;
        // this.toggleAllVip();
      }
    );

    // 商户流订阅
    this.subHeaderService.merchantRegion$.pipe(takeUntil(this._destroyed)).subscribe((v) => {
      this.getVipLevelList().subscribe(() => this.loadData());
      this.api.getAccountManagerList({ tenantId: v[0] }).subscribe((list) => (this.accuntManagerList = list));
    });

    /**
     * 页面被释放缓存后，ngOnInit不会被执行
     * 1. 在路由器事件中完成列表数据的更新。
     * 2. 必须是匹配‘编辑’路由返回才进行列表的初始化，避免在未缓存时切换路由造成二次请求。
     */
    this.router.events
      .pipe(
        filter((e) => e instanceof NavigationEnd),
        takeUntil(this._destroyed)
      )
      .subscribe(() => {
        if (this.router.routeReuseStrategy['curr'] === 'list/detail') this.loadData();
      });
  }

  ngOnDestroy(): void {
    this._destroyed.next();
    this._destroyed.complete();
  }

  /** methods */
  /** 获取VIPA/VIPC的等级 */
  getVipLevelList() {
    this.data.vipLevel = this.dataVipLevel;
    return this.vipApi.vip_manage_level_simple_list(+this.subHeaderService.merchantCurrentId).pipe(
      tap((res) => {
        if (res?.code === '0000' && Array.isArray(res?.data)) {
          this.vipLevelList = res.data.map((v) => ({ name: v?.vipName, value: v?.vipLevel }));
        }
      })
    );
  }

  // 排序
  onSort(field: 'registerTime' | 'lastLoginTime' | 'Balance'): void {
    if (this.data.isAsc === false && this.data.orderField === field) {
      this.data.orderField = '';
      this.data.isAsc = true;
      this.loadData(true);
      return;
    }

    if (!this.data.orderField || this.data.orderField !== field) {
      this.data.orderField = field;
      this.data.isAsc = false;
    }

    this.data.isAsc = !this.data.isAsc;
    this.loadData(true);
  }

  /**
   * 获取请求参数
   * @param data
   */
  getParams(data?: Partial<MemberListParams>) {
    const advanceType =
      Object.keys(this.advancedSearchGroup.value).find((k) => !!this.advancedSearchGroup.value[k]) || 'None';
    const seniorQueryContent = this.advancedSearchGroup.value[advanceType] || undefined;
    const searchContent = seniorQueryContent ? undefined : this.data.content || undefined;

    return Object.assign(
      {
        region: this.subHeaderService.regionCurrent || undefined,
        // 商户ID
        tenantId: +this.subHeaderService.merchantCurrentId,
        // 搜尋字串
        searchContent,
        // 代理ID
        superiorId: this.data.superiorId || undefined,
        // 会员账号类型
        memberType: this.data.memberType || undefined,
        // 来源
        source: this.data.source || undefined,
        // VIP等级
        vipGrade: this.data.vipLevel?.length >= this.vipLevelList.length ? undefined : this.data.vipLevel,
        // 状态
        status: this.data.status || undefined,
        // 按注册时间筛选
        startTime: toDateStamp(this.data.registryTime[0]),
        // 按注册时间筛选
        endTime: toDateStamp(this.data.registryTime[1], true),
        // 高级查询类型
        seniorQueryType: MemberListSeniorQueryTypeEnum[advanceType],
        // 高级查询值
        seniorQueryContent,
        // 最近存款(天)
        depositDays: +this.data.depositDays || undefined,
        // 最近登录(天)
        loginDays: +this.data.loginDays || undefined,
        // 风控等级
        riskControl: this.data.riskControl,
        ...(this.data.orderField
          ? {
              orderType: this.data.orderField,
              isAsc: this.data.isAsc,
            }
          : {}),
        page: this.paginator.page,
        pageSize: this.paginator.pageSize,
        accountId: this.data.accountId,
      },
      data
    );
  }

  // 获取数据 UI页面修改(信息搜索)，需要后端一起更改后端接口的参数
  loadData(resetPage = false) {
    if (this.isLoading) return;

    resetPage && (this.paginator.page = 1);

    this.loading(true);
    this.api.getMemberList(this.getParams()).subscribe((res) => {
      this.loading(false);
      this._list = res?.list || [];
      this.paginator.total = res?.total || 0;
    });
  }

  // 重置
  reset(): void {
    this.data = cloneDeep(this.DATA_EMPTY);
    this.advancedSearchGroup.reset({
      ip: '',
      uid: '',
      name: '',
    });
    this.onCheckAdvance();
    this.data.vipLevel = this.dataVipLevel;
    this.loadData(true);
  }

  // 导出
  async onExport(): Promise<void> {
    const userName = await this.lang.getOne('member.table.userName');
    const fullName = await this.lang.getOne('member.table.fullName');
    const birthday = await this.lang.getOne('member.table.birthday');
    const email = await this.lang.getOne('auManage.sys.email'); // 邮箱
    const registerIP = await this.lang.getOne('member.table.registerIP');
    const lastLoginIP = await this.lang.getOne('member.table.lastLoginIP');
    const totalDeposit = await this.lang.getOne('member.table.totalDeposit');
    const totalWithdraw = await this.lang.getOne('member.table.totalWithdraw');
    const registryTime = await this.lang.getOne('member.table.regDate');
    const lastLoginTime = await this.lang.getOne('member.table.recently');
    // const country = await this.lang.getOne('common.country');
    const recommendPeople = await this.lang.getOne('member.table.maReferrerId'); // MA推荐人ID
    const userBalance = await this.lang.getOne('member.table.balance');
    const currency = await this.lang.getOne('member.table.currency');
    // const alliance = await this.lang.getOne('member.table.alliance');
    // const allianceYes = await this.lang.getOne('member.list.yes');
    // const allianceNo = await this.lang.getOne('member.list.no');
    const creditPoints = await this.lang.getOne('member.table.creditPoints');
    const baseInfo = await this.lang.getOne('member.table.baseInfo');
    const vipLevel = await this.lang.getOne('common.vipLevel');
    // const kycStatus = await this.lang.getOne('member.table.kycStatus');
    const activeDay = await this.lang.getOne('member.table.activeDay');
    // const source = await this.lang.getOne('member.table.ly');
    const betContent = await this.lang.getOne('member.table.betContent');
    const riskLevel = await this.lang.getOne('common.riskLevel');
    const status = await this.lang.getOne('member.table.status');
    const accountManager = await this.lang.getOne('auManage.sys.accountManager');
    const statusList: { name: string; value: MemberStatusKeyEnum; langText: string; className: string }[] = [
      {
        name: '正常',
        value: 'Normal',
        langText: (await this.lang.getOne('member.list.normal')) || '',
        className: 'status_normal',
      },
      {
        name: '账户锁定',
        value: 'Freezing',
        langText: (await this.lang.getOne('member.list.accountLock')) || '',
        className: 'status_lock',
      },
      {
        name: '账户禁用',
        value: 'Disable',
        langText: (await this.lang.getOne('member.list.accountDisabled')) || '',
        className: 'status_stop',
      },
      {
        name: '部分禁用',
        value: 'DisablePart',
        langText: (await this.lang.getOne('member.list.partiallyDisabled')) || '',
        className: 'status_stop',
      },
      {
        name: '未激活',
        value: 'NotActive',
        langText: (await this.lang.getOne('member.list.inactivated')) || '',
        className: 'status_noactive',
      },
      {
        name: '账户删除',
        value: 'Deleted',
        langText: (await this.lang.getOne('member.list.accountDeletion')) || '',
        className: 'status_stop',
      },
    ];

    const curCheckedArr = this.list
      .filter((e) => e['checked'])
      .map((e) => ({
        uid: ExcelFormat.str(e.uid),
        [userName]: e.name,
        [fullName]: e.fullName,
        [birthday]: e.birthday,
        [email]: e.email,
        [registerIP]: e.registerIP,
        [lastLoginIP]: e.lastLoginIP,
        [totalDeposit]: e.totalDeposit,
        [totalWithdraw]: e.totalWithdraw,
        [registryTime]: moment(e.registerTime).format('YYYY-MM-DD HH:mm:ss'), // WPS显示为：2022/1/6 6:06
        [lastLoginTime]: moment(e.lastLoginTime).format('YYYY-MM-DD HH:mm:ss'), // WPS显示为：2022/1/6 6:06
        // [country]: e.kycCountry,
        [recommendPeople]: e.superiorUId,
        [userBalance]: toFormatMoney(e.balance),
        [currency]: e.currencies?.join(','),
        // [alliance]: e.isAlliance ? allianceYes : allianceNo,
        [creditPoints]: Number.parseInt(String(e.creditPoints)) || 0,
        [baseInfo]: '',
        [vipLevel]: e.vipGrade,
        // [kycStatus]: e.kycGrade,
        [activeDay]: e.activeDays,
        [betContent]: this.getBetContent(e),
        [riskLevel]: e.riskControl,
        [accountManager]: e?.accountName || '',
        // [source]: e.source,
        [status]: statusList.find((j) => j.value === e.status)?.langText || '',
      }));

    if (!curCheckedArr.length) {
      const msg: any = await lastValueFrom(this.lang.get('common.checkEmptyExportTip').pipe(take(1)));
      return this.appService.showToastSubject.next({
        msg,
        successed: false,
      });
    }

    this.list.forEach((e) => delete e['checked']);
    JSONToExcelDownload(curCheckedArr, 'member-list ' + Date.now());
  }

  // 加载状态
  loading(v: boolean): void {
    this.isLoading = v;
    this.appService.isContentLoadingSubject.next(v);
  }

  /**
   * 设置vip
   * @param isInvite {Boolean} true=邀请SVIP false=移除SVIP
   */
  async onSetVip(isInvite: boolean): Promise<void> {
    if (!this.checkedList.length)
      return this.appService.showToastSubject.next({ msgLang: 'member.list.setVipEmptyTips' });

    this.loading(true);

    // 检查是否有可操作的SVIP的会员
    this.vipApi[this.subHeaderService.isFiveMerchant ? 'checkVIPCSVip' : 'checkVIPASVip'](
      this.subHeaderService.merchantCurrentId,
      this.checkedList.map((e) => e.uid)
    )
      .pipe(
        finalize(() => this.loading(false)),
        switchMap((res) => this.checkedSVIPResult(res, isInvite)), // 处理设定SVIP结果
        filter((e) => !!(Array.isArray(e) && e.length)),
        switchMap((check) => this.inviteSVIPResult(check, isInvite)), // 处理邀请SVIP浮层结果
        filter((e) => e)
      )
      .subscribe(() => {
        this.loadData();
      });
  }

  @ViewChild('svipWarning') private svipWarningTpl: TemplateRef<any>;
  /**
   * 处理设定SVIP结果
   * @param res
   * @param isInvite 是否邀请SVIP、true：是、false：否（移除）
   */
  async checkedSVIPResult(res: SubServiceBaseResponse<CheckSvipItem[]>, isInvite: boolean): Promise<any> {
    this.vipCheckList = Array.isArray(res.data) ? res.data : [];

    if (!res?.data?.length && res?.code !== '0000') {
      // 没有获取到检查数据：检查失败
      this.appService.showToastSubject.next({ msgLang: 'common.fail' });
      return Promise.reject(null);
    }

    // 插入不是SVIP
    const notVip = this.checkedList.filter(
      (e) =>
        !this.vipCheckList
          .filter((k) => ['alreadIsSvip', 'notExist'].includes(k.typeName))
          .some((j) => j?.uids?.includes(e.uid))
    );
    const uids = notVip.map((e) => e.uid);
    !isInvite && uids.length && this.vipCheckList.push({ typeName: 'notSvip', uids });

    // 过滤空
    this.vipCheckList = this.vipCheckList.filter((e) => e.uids?.length);

    // 判断需要弹窗提示
    if (
      (isInvite && this.vipCheckList.length) || // 邀请:判断存在需要弹窗提示
      (!isInvite && this.vipCheckList.some((e) => ['notExist', 'notSvip'].includes(e.typeName))) // 移除:判断需要弹窗提示(已经是SVIP之外还有的话就需要弹出提示)
    ) {
      const modal = this.modal.open(this.svipWarningTpl, { width: '500px', data: isInvite });
      if (!(await modal.result)) return Promise.reject(null); // 用户取消
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    // 邀请：可邀请的会员
    const inviteUserList = this.checkedList.filter((e) => !this.vipCheckList.some((j) => j.uids?.includes(e.uid)));
    // 移除：可移除的会员
    const removeUserList = this.checkedList.filter((e) =>
      this.vipCheckList.find((j) => j.typeName === 'alreadIsSvip')?.uids?.includes(e.uid)
    );

    const resUserList = cloneDeep(isInvite ? inviteUserList : removeUserList);
    // 所勾选中，没有可操作的会员
    if (!resUserList.length) {
      this.appService.showToastSubject.next({ msgLang: 'member.list.setVipEmptyTips2' });
      return Promise.reject(null);
    }

    this.list.forEach((e) => (e['checked'] = false)); // 清空外部选择的会员
    return Promise.resolve(resUserList);
  }

  /**
   * 预览待操作SVIP的会员
   * @param operaUserList
   * @param isInvite {Boolean} 是否邀请SVIP、true：是、false：否（移除）
   */
  inviteSVIPResult(operaUserList: any[], isInvite: boolean): Promise<any> {
    const modal = this.modal.open(InviteVipComponent, { width: '960px' });
    modal.componentInstance.list = operaUserList;
    modal.componentInstance.isInvite = isInvite;
    return modal.result;
  }

  // 群发站内信
  async ontMessage(): Promise<void> {
    const dataList = { statusList: this.statusListCopy, sourceList: this.sourceListCopy, isNowUser: false };
    this.detailSerivce.dataList = dataList;
    this.detailSerivce.userIdListInfo = this.checkedList;
    this.router.navigate(['/member/list/detail/message-send'], {
      queryParams: { tenantId: this.subHeaderService.merchantCurrentId },
    });
  }

  @ViewChild('allVipSelected') private allVipSelected: MatOption;
  toggleAllVip() {
    if (this.allVipSelected.selected) {
      this.data.vipLevel = [...this.vipLevelList.map((item) => item.value), ''];
    } else {
      this.data.vipLevel = [];
    }
  }

  toggleVip() {
    if (this.allVipSelected.selected) {
      return this.allVipSelected.deselect();
    }

    if (this.data.vipLevel.length == this.vipLevelList.length) this.allVipSelected.select();
  }

  /**
   * 会员等级下拉筛选
   * @param isOpen
   */
  openVipCache: any[] = [];
  onVip(isOpen: boolean) {
    if (isOpen) {
      this.openVipCache = [...this.data.vipLevel];
      return;
    } else {
      if (this.openVipCache.length === this.data.vipLevel.length) return;

      this.loadData(true);
    }
  }

  /**
   * 判断游戏icon是否存在
   */
  isGameIcon(arr: number[], item: any) {
    if (!Array.isArray(item)) {
      return false;
    }
    return item.some((res) => arr.includes(res.gameCategory));
  }

  /**
   * 判断显示厂商
   */
  showGameMaker(arr: number[], item: any): string {
    if (!Array.isArray(item)) {
      return '';
    }
    let gameMaker = [];
    item.forEach((res) => {
      if (arr.includes(res.gameCategory)) {
        gameMaker = gameMaker.concat(res.gameProviders);
      }
    });
    return gameMaker.join(', ');
  }

  /**
   * 返回所有游戏厂商
   */
  getBetContent(e) {
    const list = [[1, 2], [3], [4], [5], [6]];
    const str = list
      .map((item) => this.showGameMaker(item, e.playedGameInfo))
      .filter((gameMaker) => gameMaker !== '')
      .join(',');
    return str;
  }

  protected readonly MemberTypeEnum = MemberTypeEnum;

  /**
   * 高级搜索数据
   */
  expandAdvancedSearch = false; // 是否展开高级搜索
  advancedSearchGroup = this.fb.group({
    ip: [{ value: '', disabled: false }],
    uid: [{ value: '', disabled: false }],
    name: [{ value: '', disabled: false }],
  });

  /**
   * 高级搜索
   */
  onAdvancedSearch() {
    this.expandAdvancedSearch = !this.expandAdvancedSearch;
  }

  /**
   * 高级搜索 - 检测并设置禁用或开启
   */
  onCheckAdvance() {
    const advanceData = this.advancedSearchGroup.getRawValue();
    const keyList = Object.keys(advanceData);
    const isEmpty = keyList.every((key) => !advanceData[key]?.trim());
    const firstHasValueKey = keyList.find((key) => advanceData[key]?.trim());

    // 全空解开
    if (isEmpty) {
      keyList.forEach((key) => {
        this.advancedSearchGroup.get(key)?.enable({
          onlySelf: true,
          emitEvent: true,
        });
      });
    } else {
      keyList.forEach((key) => {
        if (key !== firstHasValueKey) {
          this.advancedSearchGroup.get(key)?.patchValue('', {
            onlySelf: true,
            emitEvent: false,
          });
          this.advancedSearchGroup.get(key)?.disable();
        }
      });
    }
  }

  @ViewChild('amTmpPopup') amTmpPopup: TemplateRef<ElementRef>;
  closeAmTmpPopup: any;
  /** 设置  AM label 弹窗 */
  async onSetAMLabel() {
    const uids: string[] = this.list.filter((e) => e['checked'])?.map((v) => v.uid) || [];
    if (!uids.length) {
      const msg: any = await this.lang.getOne('member.list.tips');
      return this.appService.showToastSubject.next({
        msg,
        successed: false,
      });
    }
    this.closeAmTmpPopup = this.modal.open(this.amTmpPopup, { width: '500px' });
    this.accountId = '';
  }

  onCloseAmTmpPopup() {
    this.closeAmTmpPopup.close();
    this.accountId = '';
  }

  /** 提交 设置会员经理 */
  async onSubmitAM() {
    const uids: string[] = this.list.filter((e) => e['checked'])?.map((v) => v.uid) || [];
    if (!this.accountId) {
      const msg: any = await this.lang.getOne('member.list.tipsTwo');
      return this.appService.showToastSubject.next({
        msg,
        successed: false,
      });
    }

    this.loading(true);
    this.api
      .onSetAccountManager({
        tenantId: this.subHeaderService.merchantCurrentId,
        uid: uids,
        accountId: this.accountId || '',
      })
      .subscribe(async (data) => {
        this.loading(false);
        this.accountId = '';
        if (data) {
          this.loadData(true);
        }
        const msg: any = await this.lang.getOne(data ? 'member.list.success' : 'member.list.failed');
        this.appService.showToastSubject.next({
          msg,
          successed: data,
        });
        this.onCloseAmTmpPopup();
      });
  }

  /** 跳转 在线消息禁用名单 */
  toBanList() {
    this.router.navigate(['/member/list/message-ban-list']);
  }

  /** 跳转 在线消息白名单 */
  toWhiteList() {
    this.router.navigate(['/member/list/message-white-list']);
  }
}
