import { takeUntil } from 'rxjs';
import { MemberService } from 'src/app/pages/member/member.service';
import { Component, ElementRef, OnInit, signal, TemplateRef, ViewChild, WritableSignal } from '@angular/core';
import { AppService } from 'src/app/app.service';
import { MemberApi } from 'src/app/shared/api/member.api';
import { PaginatorState } from 'src/app/_metronic/shared/crud-table';
import { MatModal } from 'src/app/shared/components/dialogs/modal';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormValidator } from 'src/app/shared/form-validator';
import {
  ActionGreen,
  Actiontype,
  ActionYellow,
  EDDStatusEnum,
  kycDocContent,
  NonStickyTypeEnum,
  QueryListItem,
  QueryTypeBase,
  UserInfoStatusEnum,
} from 'src/app/shared/interfaces/member.interface';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { DestroyService, JSONToExcelDownload } from 'src/app/shared/models/tools.model';
import moment from 'moment';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { CurrencyValuePipe } from 'src/app/shared/pipes/currency-value.pipe';
import { WalletTypePipe } from 'src/app/shared/pipes/gameProvider.pipe';
import { FormatMoneyPipe } from 'src/app/shared/pipes/big-number.pipe';
import { TimeFormatPipe } from 'src/app/shared/pipes/time.pipe';
import { ImgViewerComponent } from 'src/app/shared/components/img-viewer/img-viewer.component';
import { UploadComponent } from 'src/app/shared/components/upload/upload.component';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { PaginatorComponent } from 'src/app/_metronic/shared/crud-table/components/paginator/paginator.component';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ModalTitleComponent } from 'src/app/shared/components/dialogs/modal/modal-title.component';
import { WinColorDirective, WinDirective } from 'src/app/shared/directive/common.directive';
import { CurrencyIconDirective } from 'src/app/shared/components/icon/icon.directive';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { KeyValuePipe, NgFor, NgIf, NgTemplateOutlet } from '@angular/common';
import { EmptyComponent } from 'src/app/shared/components/empty/empty.component';
import { DetailService } from '../../detail.service';

@Component({
  selector: 'app-user-activity',
  templateUrl: './user-activity.component.html',
  styleUrls: ['./user-activity.component.scss'],
  providers: [DestroyService],
  standalone: true,
  imports: [
    NgFor,
    NgIf,
    NgTemplateOutlet,
    AngularSvgIconModule,
    CurrencyIconDirective,
    WinDirective,
    WinColorDirective,
    ModalTitleComponent,
    MatFormFieldModule,
    MatSelectModule,
    FormsModule,
    MatOptionModule,
    PaginatorComponent,
    ReactiveFormsModule,
    FormRowComponent,
    UploadComponent,
    ImgViewerComponent,
    KeyValuePipe,
    TimeFormatPipe,
    FormatMoneyPipe,
    WalletTypePipe,
    CurrencyValuePipe,
    LangPipe,
    EmptyComponent,
  ],
})
export class UserActivityComponent implements OnInit {
  constructor(
    private formBuilder: FormBuilder,
    private modalService: MatModal,
    private appService: AppService,
    private api: MemberApi,
    private route: ActivatedRoute,
    public lang: LangService,
    private memberService: MemberService,
    private destroy$: DestroyService,
    private detailService: DetailService
  ) {}

  /** 支付方式 */
  payList = [
    { name: '法币', en: 'Fiat', lang: 'member.overview.fiatCurrency', type: 'Legal' },
    { name: '信用卡买币', en: 'Credit card to buy coins', lang: 'member.overview.cradBuyCoins', type: 'BankCard' },
    { name: '加密货币', en: 'Cryptocurrency', lang: 'member.overview.cryptocurrency', type: 'Encryption' },
  ];

  /** 提款，存款*/
  payType: any = [
    { name: '提款', type: 'Withdraw', lang: 'member.overview.withdrawal' },

    { name: '存款', type: 'Deposit', lang: 'member.overview.deposit' },
    // 兼容
    { name: '存款', type: 'isDeposit', lang: 'member.overview.deposit' },
  ];

  userActive = 0;

  pageSizes = [50, 200, 1000]; // 页大小
  // pageSize: number | string = 50;
  paginator: PaginatorState = new PaginatorState(); // 分页

  userBehaviors: any[] = [];

  list: any[] = [];
  /** 备注 */
  remark = '';
  total = 0;

  isLoading = false;
  kycDocLangList: string[] = [];

  /** 会员活动弹窗tab - 列表 */
  queryList: QueryListItem[] = [];

  /** 查询类型 默认为空 */
  queryType: QueryTypeBase | Array<QueryTypeBase> = '';

  /** 沟通附件 fullUrl */
  communicateAttachmentFullUrl = '';

  /** 沟通弹窗 */
  formGroup!: FormGroup;

  validator!: FormValidator;

  /** 清零类型 */
  clearList = [
    { text: '负值清零', key: 'NegativeClear', lang: 'risk.auto.zeroNeg' },
    { text: '抵用金清零', key: 'CreditClear', lang: 'risk.auto.creditClear' },
    { text: '提款流水要求清零', key: 'WithdrawalLimitClear', lang: 'risk.auto.withdrawLimitClear' },
    { text: '抵用金过期', key: 'CreditExpired', lang: 'risk.auto.creditExpired' },
  ];

  /** 备注 - 当前类型 Normal:普通 RC:风控*/
  remarkType = 'RC';
  /** 备注 - 删除标识符 */
  isDelRemarkFlag = false;

  get clearObj() {
    return this.clearList.reduce((acc, cur) => ({ ...acc, [cur.key]: cur }), {});
  }

  forbidActivityCodes: WritableSignal<Array<{ activityCode: string; displayName: string }>> = signal([]);

  /** tab - 当前是否只选择备注 */
  get isOnlySelectRemark() {
    const isIncludeRemark = this.queryList.filter((v) => v.checked).some((v) => v.categoryCode === 'Remark');
    const isOnlyOne = this.queryList.filter((v) => v.checked).length === 1;

    return isIncludeRemark && isOnlyOne;
  }

  async ngOnInit() {
    /**  kyc文档翻译*/
    const payment = await this.lang.getOne('member.overview.newKyc.payment'); /** 付款方式 */
    const wealthSource = await this.lang.getOne('member.overview.newKyc.wealthSource'); /** 财富来源证明 */
    const personalId = await this.lang.getOne('member.overview.newKyc.personalId'); /** 身份证明 */
    this.kycDocLangList = [personalId, wealthSource, payment];

    /** 结束 */
    this.api.getForbidActivityCodes().subscribe((data) => {
      this.forbidActivityCodes.set(data || []);
      this.getQueryTypeList();
    });
    this.memberService.updateMember.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.getQueryTypeList();
    });
  }

  /** 用户uid */
  get uid(): string {
    return this.route.snapshot.queryParams['uid'] || 0;
  }

  /** 会员活动-EDD状态 */
  get getEDDStatusEnum() {
    return EDDStatusEnum;
  }

  /** 会员活动-kyc用户信息状态 */
  get getUserInfoStatusEnum() {
    return UserInfoStatusEnum;
  }

  /** 非粘性奖金-类型 */
  get getNonStickyTypeEnum() {
    return NonStickyTypeEnum;
  }

  /** 用户行为 */
  get getAction() {
    return Actiontype;
  }

  /** 黄色行为 */
  get getActionYellow() {
    return ActionYellow;
  }

  /** 绿色行为 */
  get getActionGreen() {
    return ActionGreen;
  }

  /** 获取当前语言 */
  get langeCode(): string {
    return this.lang.currentLang.toLowerCase();
  }

  // 加载状态
  loading(v: boolean): void {
    this.isLoading = v;
    this.appService.isContentLoadingSubject.next(v);
  }

  /** 更新活动列表数量*/
  onRenewActivityList() {
    this.paginator.page = 1;
    this.paginator.total = 0;
    this.getActivityAllList();
  }

  /** 默认加载活动数量*/
  defaultLoadActivityList() {
    this.paginator.page = 1;
    this.paginator.pageSize = 10;
    this.getActivityAllList();
  }

  /**
   *
   * @param 获取导航蓝牛
   */
  async getQueryTypeList() {
    this.loading(true);
    const all = await this.lang.getOne('common.all');
    this.api.getQueryTypeList().subscribe((data) => {
      this.loading(false);
      this.queryList = [
        { categoryCode: '', categoryDescription: all, checked: true },
        ...data.map((item) => ({ ...item, checked: false })),
      ];
      this.queryType = this.queryList[0].categoryCode;
      this.getActivityAllList();
    });
  }

  /**
   *  切换按钮
   * @isReLoadMainWindow 是否重新加载主页
   * @param categoryCode query string;
   * @param isReLoadMainWindow 是否重新加载主页
   */
  onQueryUserBehavior(item: QueryListItem) {
    const all = this.queryList.find((value) => value.categoryCode === '');
    if (item.categoryCode === '') {
      // 点击 "全部" 按钮时，取消其他按钮的选中状态
      // 将 "全部" 按钮的状态设置为选中
      this.queryList.forEach((value) => {
        value.checked = false;
      });
      item.checked = true;
    } else {
      // 点击其他按钮时，进行反选
      item.checked = !item.checked;
      // 如果没有按钮被选中，自动选择 "全部" 按钮
      const hasCheckedButton = this.queryList.some((value) => value.checked === true);
      if (!hasCheckedButton) {
        all && (all.checked = true);
      } else {
        // 如果有按钮被选中，取消 "全部" 按钮的选中状态
        all && (all.checked = false);
      }
    }
    this.getActivityAllList();
  }

  /**
   * 获取50条信息
   * @param defaultPageSize 默认为50条数据
   */
  getActivityAllList() {
    this.queryType = this.queryList.filter((item) => item.checked).map((item) => item.categoryCode);
    const params = {
      uid: this.uid,
      queryType: this.queryType,
      ...(this.isOnlySelectRemark ? { commentType: this.remarkType } : {}),
      pageIndex: this.paginator.page,
      pageSize: this.paginator.pageSize,
    };

    this.loading(true);
    this.api.getMemberBehavior(params).subscribe((res) => {
      this.loading(false);
      this.userBehaviors = res.list || [];
      this.paginator.total = res.total || 0;
      this.total = res.total || [];
      this.list = res?.list || [];
    });
  }

  /** 打开活动备注窗口 */
  @ViewChild('activityRemarkPopup') activityRemarkPopup: TemplateRef<any>;
  @ViewChild('myContent') myContentRef!: ElementRef;
  closeActivityRemarkDialog: any;
  /**
   * 打开活动窗口函数
   * @param content 活动内容
   */
  openActivityRemarkPopup(content?: any) {
    if (content) {
      this.formGroup = this.formBuilder.group({
        attachment: [content?.fileUrl || ''],
        remark: [content?.remark || ''],
      });
      this.formGroup.disable();
    } else {
      this.formGroup = this.formBuilder.group({
        attachment: ['', Validators.required],
        remark: ['', Validators.required],
      });
    }
    this.closeActivityRemarkDialog = this.modalService.open(this.activityRemarkPopup, {
      width: '586px',
      autoFocus: false,
    });
  }

  /**导出 */
  export() {
    let a = [...this.myContentRef.nativeElement.querySelectorAll('dd')];
    let textContents = a.map((dd) => dd.innerText);
    this.loading(true);
    const excel = async (list) => {
      const act = await this.lang.getOne('allPop.act');
      const category = await this.lang.getOne('allPop.category');
      const time = await this.lang.getOne('allPop.time');
      const content = await this.lang.getOne('allPop.content');
      const currency = await this.lang.getOne('allPop.currency');
      const amount = await this.lang.getOne('allPop.amount');
      const ip = await this.lang.getOne('allPop.ip');
      const scope = await this.lang.getOne('allPop.scope');

      const excelData = list.map((e, i) => ({
        [act]: e?.actionDesc ? e.actionDesc : '',
        [category]: e?.contentDesc ? e.contentDesc : '',
        [time]: moment(e?.createTime).format('YYYY-MM-DD hh:mm:ss'),
        [content]: textContents[i],
        [currency]: e?.content?.currency ? e?.content?.currency : '',
        [amount]: e?.content?.amount ? e?.content?.amount : '',
        [ip]: e?.ip,
        [scope]: e?.zone ? e?.zone : '', //区域
      }));
      JSONToExcelDownload(excelData, 'member-record_' + Date.now());
      this.loading(false);
    };
    this.api
      .getMemberBehavior({
        uid: this.uid,
        queryType: this.queryType,
        pageIndex: this.paginator.page,
        pageSize: this.paginator.pageSize,
      })
      .subscribe((data) => {
        if (data?.list) {
          excel(data.list);
        } else {
          this.loading(false);
        }
      });
  }

  /**
   * 上传附件
   * @param data 需要上传数据
   */
  updateAttachment(data: any) {
    if (data.upload?.state === 'DONE') {
      this.communicateAttachmentFullUrl = data.uploadURL.fullUrl;
    }
  }

  /** 备注 */
  onSend() {
    /** 没有信息不执行任何操作 */
    if (!this.remark) return;
    const params = {
      uid: this.uid,
      remark: this.remark,
      commentType: this.remarkType,
    };

    this.loading(true);
    this.api.onAddCommunicate(params).subscribe((data) => {
      this.loading(false);
      if (data) {
        this.remark = '';
        setTimeout(() => this.onRenewActivityList(), 800);

        /** antha说上传成功不需要提示暂时隐藏 */
        // return this.appService.showToastSubject.next({
        //   msgLang: 'member.overview.offBan',
        //   successed: false,
        // });
      }
    });
  }

  /** 备注 - 点击删除 */
  onDelRemark() {
    this.userBehaviors.forEach((v) => (v.checked = false));
    this.isDelRemarkFlag = true;
  }

  /** 备注 - 删除确认 */
  onDelRemarkConfirm() {
    const selectListIds = this.userBehaviors.filter((v) => v.checked).map((v) => v.id);
    if (!selectListIds.length)
      return this.appService.showToastSubject.next({
        msgLang: 'member.list.pleaseCheck',
      });

    const params = {
      uid: this.uid,
      tenantId: this.route.snapshot.queryParams['tenantId'],
      ids: selectListIds,
    };

    this.appService.isContentLoadingSubject.next(true);
    this.api.deletecomment(params).subscribe((res) => {
      this.appService.isContentLoadingSubject.next(false);

      if (!res)
        return this.appService.showToastSubject.next(
          res?.message ? { msg: res?.message } : { msgLang: 'common.operationFailed' }
        );

      this.appService.showToastSubject.next({ msgLang: 'common.operationSuccess', successed: true });
      this.isDelRemarkFlag = false;
      setTimeout(() => this.onRenewActivityList(), 800);
    });
  }

  /** 提交沟通备注 */
  onSubmit() {
    this.formGroup.markAllAsTouched();
    if (this.formGroup.invalid || this.formGroup.disabled) return;
    this.loading(true);
    const params = {
      uid: this.uid,
      remark: this.formGroup.value['remark'],
      fileUrl: this.formGroup.value['attachment'],
    };
    this.api.onAddCommunicate(params).subscribe((data) => {
      this.loading(false);
      if (data) {
        this.closeActivityRemarkDialog.close();
        this.onRenewActivityList();
      }
    });
  }

  /**支付方式名称转换翻译字段 */
  payLang(type) {
    const typeList = type.split(',') || [];
    return this.payList.filter((v) => typeList.includes(v.type)).map((v) => (this.lang.isLocal ? v.name : v.en)) || '-';
  }

  /**支付方式类型中英文转换 */
  payTypeLang(type) {
    return this.payType.find((obj) => obj.type === type)?.lang;
  }

  /**
   * 做一个 json转换
   * @param content 内容
   * @returns json
   */
  toJson(content: string) {
    return JSON.parse(content);
  }

  // 调账类型
  getAdjustType(value: any) {
    const typeList: any = new Map([
      ['Deposit', { name: '存款', lang: 'game.proxy.deposit' }],
      ['Withdraw', { name: '提款', lang: 'game.proxy.withdraw' }],
      ['Bonus', { name: '红利', lang: 'game.proxy.bonus' }],
      ['Payout', { name: '输赢', lang: 'dashboard.info.winLose' }],
      ['Other', { name: '其他', lang: 'system.merchants.other' }],
    ]);
    return typeList.get(value)?.lang;
  }

  verification(type) {
    let lang = '';
    switch (type) {
      case 1:
        lang = 'member.overview.newKyc.primary';
        break;
      case 2:
        lang = 'member.overview.newKyc.intermediate';
        break;
      case 3:
        lang = 'member.overview.newKyc.advanced';
        break;
      /** 财富来源证明 */
      case 'WealthSource':
        lang = 'member.overview.newKyc.wealthSource';
        break;
      case 'ID':
        lang = 'member.overview.newKyc.id';
        break;
      case 'POA':
        lang = 'member.overview.newKyc.poa';
        break;
      /** 支付方式 */
      case 'PaymentMethod':
        lang = 'member.overview.newKyc.paymentMethod';
        break;
      /** 自定义 */
      case 'Customize':
        lang = 'member.overview.newKyc.customize';
        break;
      default:
        break;
    }
    return lang;
  }

  kycDocLang(data: kycDocContent) {
    if (!data) return [];
    const keyList = {
      isVerificationIdentity: this.kycDocLangList[0], // 是否身份证明
      isVerificationAddress: 'POA', // 地址证明POA
      isVerificationWallet: this.kycDocLangList[1], // 是否财富证明
      isVerificationPaymentMethod: this.kycDocLangList[2] + '-' + data.paymentMethodName, // 支付方式证明
      otherVerification: data?.otherVerification, // 其他证明，不为空说明有其他证明
    };

    return Object.keys(data)
      .filter((key) => !!data[key])
      .map((key) => keyList[key])
      .filter((e) => !!e);
  }

  getActivities(activities: string) {
    const returnDisplayNames: string[] = [];
    const activitiesCodes = activities.split(',');
    this.forbidActivityCodes().forEach((code) => {
      if (activitiesCodes.find((list) => list === code.activityCode)) {
        returnDisplayNames.push(code.displayName);
      }
    });
    return returnDisplayNames.join(', ');
  }
}
