import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  ValidationErrors,
  ValidatorFn,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AppService } from 'src/app/app.service';
import { finalize, of, switchMap, zip } from 'rxjs';
import { MerchantsApi } from 'src/app/shared/api/merchants.api';
import { AuthorityRoleApi } from 'src/app/shared/api/authority-role.api';
import { UserApi } from 'src/app/shared/api/user.api';
// import { toUTCStamp } from 'src/app/shared/models/tools.model';
// import moment from 'moment';
import {
  CurrencyType,
  MerchantGoMoneyPaymentMethodConfig,
  MerchantGoMoneyRate,
  MerchantRateCurrency,
  MerchantRateCurrencyCustom,
  MerchantRateCurrencyItem,
  MerchantRateCurrencyItemDataCustom,
  MerchantRateCurrencyType,
  MerchantStaticConfig,
  UpdateMerchantsParams,
} from 'src/app/shared/interfaces/merchants-interface';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { catchError, map, tap } from 'rxjs/operators';
import { SelectApi } from 'src/app/shared/api/select.api';
import { cloneDeep } from 'lodash';
import BigNumber from 'bignumber.js';
import { UploadApi } from 'src/app/shared/api/upload.api';
import { PaymentType } from 'src/app/shared/interfaces/transaction';
import { TurntableTypeEnum } from 'src/app/shared/interfaces/activity';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { ModalFooterComponent } from 'src/app/shared/components/dialogs/modal/modal-footer.component';
import { ModalTitleComponent } from 'src/app/shared/components/dialogs/modal/modal-title.component';
import { OwlDateTimeComponent } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker.component';
import { OwlDateTimeTriggerDirective } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker-trigger.directive';
import { OwlDateTimeInputDirective } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker-input.directive';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { UploadComponent } from 'src/app/shared/components/upload/upload.component';
import { MatTabsModule } from '@angular/material/tabs';
import {
  InputPercentageDirective,
  InputNumberDirective,
  InputTrimDirective,
  CheckboxArrayControlDirective,
} from 'src/app/shared/directive/input.directive';
import { FormWrapComponent, FormFullDirective } from 'src/app/shared/components/form-row/form-wrap.component';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { NgIf, NgFor, NgTemplateOutlet, AsyncPipe } from '@angular/common';
import { ZoneApi } from 'src/app/shared/api/zone.api';
import { Language } from 'src/app/shared/interfaces/zone';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss'],
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    NgIf,
    FormRowComponent,
    NgFor,
    FormWrapComponent,
    InputPercentageDirective,
    FormFullDirective,
    InputNumberDirective,
    InputTrimDirective,
    MatTabsModule,
    UploadComponent,
    AngularSvgIconModule,
    NgTemplateOutlet,
    OwlDateTimeInputDirective,
    OwlDateTimeTriggerDirective,
    OwlDateTimeComponent,
    ModalTitleComponent,
    ModalFooterComponent,
    AsyncPipe,
    LangPipe,
    CheckboxArrayControlDirective,
    MatSelectModule,
  ],
})
export class EditComponent implements OnInit {
  constructor(
    private router: Router,
    private ngbModal: NgbModal,
    private merchantsApi: MerchantsApi,
    public appService: AppService,
    private fb: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private roleApi: AuthorityRoleApi,
    private userApi: UserApi,
    private selectApi: SelectApi,
    public lang: LangService,
    private uploadApi: UploadApi,
    private zoneApi: ZoneApi
  ) {
    const { id } = activatedRoute.snapshot.params; // 快照里的params参数
    this.id = id;
  }

  formGroup = this.fb.group({
    merchantsName: ['', Validators.compose([Validators.required])],
    email: ['', Validators.compose([Validators.email, Validators.required])],
    siteUrl: ['', Validators.compose([Validators.required])],
    serviceFee: [''],

    /********************************************************************
     * 提款审核配置                                                       *
     *******************************************************************/
    withdrawSingleThreshold: [null as null | number], // 提款单笔金额 超过多少进入二次审核
    withdraw24hThreshold: [null as null | number], // 提款总金额（24小时内） 超过多少进入二次审核

    /********************************************************************
     * 活动                                                              *
     *******************************************************************/
    // 活动转盘格子数量类型
    luckGridType: [TurntableTypeEnum.Grid12],

    requiredFreeWithdrawFeeMultiples: [0, Validators.required],
    googleVerifyName: [''],

    ledLockRatio: [''], // LED设置 - 解锁金额百分比
    ledMinAmount: [''], // LED设置 - 可领取的最低金额

    isLimitAmount: [false], // 限额金额设置 - 是否开启/关闭限制
    limitAmount: [0], // 限额金额设置 - 金额

    riskControlNoAudit: [false], // 更改风控级别 - 是否开启/关闭限制

    supportLangList: [[] as string[]], // 支持的语系
    notDivision: ['Nil'], // NOTO服务  默认Nil

    /** goMoney配置 */
    merchantsId: ['', Validators.compose([Validators.required])],
    merchantsKey: [''],
    systemId: [''],
    // callBackUrl: [''],
    // whiteList: [''],
    // negativeLading: [true],
    // rateCategory: ['FixedScale'],
    // isFiatMoneyEnable: [true],
    // isVirtualMoneyEnable: [true],
    // isVirtualToFiatMoneyEnable: [true],
  });

  /**
   * 活动转盘格子数量类型
   */
  luckGridTypeList = [
    { desc: '12', value: TurntableTypeEnum.Grid12, lang: 'luckRoulette.luckRank' },
    { desc: '16', value: TurntableTypeEnum.Grid16, lang: 'luckRoulette.luckRank' },
  ];

  /** 自定义配置 */
  configFormGroup = this.fb.group({
    merchantsLogo1: [''],
    merchantsLogo2: [''],
    merchantsLogo3: [''],
    merchantsLogo4: [''],
    // pc默认头像

    // ['', '', '', '', '', '']
    defaultAvatarPc: this.fb.array(new Array(6).fill('')),
    // app默认头像
    defaultAvatarApp: this.fb.array(new Array(6).fill('')),
    merchantsAppLogo1: [''],
    merchantsAppLogo2: [''],
    merchantsAppLogo3: [''],
    merchantsAppLogo4: [''],

    webColorScheme: ['sun'], // web默认色系
    appColorScheme: ['sun'], // app默认色系
    appMaintenance: ['enable'], //app维护默认开启
    maintainTimeEnd: [''],
    loadingImg: [''], // 加载的占位图片

    app1: [''],
    app2: [''],
    app3: [''],
    app4: [''],

    /**配置数组web */
    webConfig: this.fb.array([] as any, this.configExistFieldValidator()),

    /**配置数组app */
    appConfig: this.fb.array([] as any, this.configExistFieldValidator()),
  });

  /**默认pc头像 */
  get defaultAvatarPc() {
    return this.configFormGroup.get('defaultAvatarPc') as FormArray;
  }

  /**默认wap头像 */
  get defaultAvatarApp() {
    return this.configFormGroup.get('defaultAvatarApp') as FormArray;
  }

  /** goMoney费率配置 */
  /** 费率币种 */
  supportPayList: MerchantRateCurrencyCustom[] = []; // 支持的支付方式
  paymentList: any[] = []; // 支付方式列表
  goMoneyConfigCurTab = 0; // 费率币种Tab索引
  curPaymentTabDeposit = 0; // 费率下的支付方式索引
  curPaymentTabWithdraw = 0; // 费率下的支付方式索引
  curPaymentTabCurrency: CurrencyType = MerchantRateCurrencyType[MerchantRateCurrencyType.FiatMoney] as CurrencyType; // 费率下的币种类型
  currencyTypeList: Array<{ key: CurrencyType; value: number }> = Object.keys(MerchantRateCurrencyType)
    .filter((e) => isNaN(e as any))
    .filter((e) => e !== 'Unknown') // 过滤掉0 第一条
    .map<{ key: CurrencyType; value: number }>((key) => ({
      key: key as CurrencyType,
      value: MerchantRateCurrencyType[key] as number,
    })); // 费率币种类型

  merchants!: any;

  /**
   * ！！！以下的key值为上传json文件的key值，value为formGroup的字段
   */
  merchantsLogo: Array<any> = [
    { name: 'Web日间版', lang: 'system.merchants.dayVersion', value: 'merchantsLogo1', key: 'webLogoSun' },
    { name: 'Web夜间版', lang: 'system.merchants.nightVersion', value: 'merchantsLogo2', key: 'webLogoMoon' },
    { name: 'H5日', lang: 'system.merchants.hFiveday', value: 'merchantsLogo3', key: 'h5LogoSun' },
    { name: 'H5夜', lang: 'system.merchants.hFiveNight', value: 'merchantsLogo4', key: 'h5LogoMoon' },
  ];

  merchantsAppLogo: Array<any> = [
    { name: 'app登陆后日间版', lang: 'system.merchants.afterSun', value: 'merchantsAppLogo1', key: 'appLogoSun' },
    {
      name: 'app登陆后夜间版',
      lang: 'system.merchants.afterMoon',
      value: 'merchantsAppLogo2',
      key: 'appLogoMoon',
    },
    {
      name: 'app登陆前日间版',
      lang: 'system.merchants.beforeSun',
      value: 'merchantsAppLogo3',
      key: 'appBeforeLogoSun',
    },
    {
      name: 'app登陆前夜间版',
      lang: 'system.merchants.beforeMoon',
      value: 'merchantsAppLogo4',
      key: 'appBeforeLogoMoon',
    },
  ];

  appImg: Array<any> = [
    { name: '图片1', lang: 'system.merchants.img1', value: 'app1' },
    { name: '图片2', lang: 'system.merchants.img2', value: 'app2' },
    { name: '图片3', lang: 'system.merchants.img3', value: 'app3' },
    { name: '图片4', lang: 'system.merchants.img4', value: 'app4' },
  ];

  /**
   * 服务配置费
   */
  serviceConfigFee = [
    { name: '固定', value: 'FixedScale', lang: 'system.merchants.fixed' },
    { name: '浮动', value: 'FloatScale', lang: 'system.merchants.float' },
  ];

  /**
   * 负值提单
   */
  negativeLading = [
    { name: '允许', value: true, lang: 'common.allow' },
    { name: '不允许', value: false, lang: 'common.allowNot' },
  ];

  day_color1 = '#f1f4f7';
  day_color_toggle1 = false;
  day_color2 = '#f1f4f7';
  day_color_toggle2 = false;
  day_color3 = '#f1f4f7';
  day_color_toggle3 = false;
  night_color1 = '#f1f4f7';
  night_color_toggle1 = false;
  night_color2 = '#f1f4f7';
  night_color_toggle2 = false;
  night_color3 = '#f1f4f7';
  night_color_toggle3 = false;

  selectColorValidate = false; //配色设定验证

  serviceConfigList: Array<any> = []; //服务权限配置
  serviceConfigChecked: Array<string> = []; //已选中服务权限配置
  serviceConfigValidate = false; //服务权限配置验证不通过时提示
  serviceAdminValidate = false; // 商户管理员验证
  detail: any = {};
  private id!: string;
  imgDomain = ''; // 图片域名地址

  isLoginConfigEqual: boolean; // 编辑时，判断社交媒体登陆配置是否发生改变
  socialLoginConfigChecked: Array<string> = []; //已选中社交媒体登陆
  socialLoginConfigList: any[] = [
    // 社交媒体登陆
    { name: 'Google', value: false },
    { name: 'Telegram', value: false },
    { name: 'MetaMask', value: false },
    { name: 'Line', value: false },
  ];

  /** 详情数据是否加载失败 */
  isDetailLoadError = false;

  /** 所有的语系数据 */
  langList: Language[] = [];

  /** NOTO */
  notoList: string[] = [];

  /** 新增配置内容数组(web) */
  get webConfig(): any {
    return this.configFormGroup.get('webConfig')!;
  }

  /** 新增配置内容数组(app) */
  get appConfig(): any {
    return this.configFormGroup.get('appConfig')!;
  }

  /** 是否新增 */
  get isAdd(): any {
    return !this.id;
  }

  /** 是否编辑 */
  get isEdit(): any {
    return !!this.id;
  }

  /** 获取当前币种下的存款方式 */
  get currencyValue(): MerchantRateCurrencyItem {
    return this.currencyType[this.goMoneyConfigCurTab] || ({} as any);
  }

  /**
   * 当前币种所支持的支付方式
   */
  get curSupport(): MerchantRateCurrencyItemDataCustom | undefined {
    return this.supportPayList
      .find((e) => e.chargeCategory === this.curPaymentTabCurrency)
      ?.data?.find((e) => e.currency === this.currencyValue.currency);
  }

  /**
   * 当前币种的列表
   */
  get currencyType() {
    return (
      this.supportPayList.find((e) => e.chargeCategory === this.curPaymentTabCurrency)?.currencies ||
      ([] as MerchantRateCurrencyItem[])
    );
  }

  ngOnInit(): void {
    this.loading(true);
    zip([this.zoneApi.getLanguages(), this.merchantsApi.getNotodDivision(), this.getmerchantServiceConfig$()])
      .pipe(finalize(() => this.loading(false)))
      .subscribe(([lang, notoList]) => {
        this.curPaymentTabDeposit = 0;
        this.curPaymentTabWithdraw = 0;
        this.goMoneyConfigCurTab = 0;

        this.langList = lang || [];
        this.notoList = notoList;
      });
  }

  /**
   * 查询当前商户（回传数据）
   */
  querymerchant$() {
    return this.merchantsApi.querymerchant(this.id).pipe(
      tap((res) => {
        this.detail = res;
        this.serviceConfigChecked = res.openedService;
        for (let index = 0; index < this.serviceConfigList.length; index++) {
          if (this.serviceConfigChecked.indexOf(this.serviceConfigList[index].name) > -1) {
            this.serviceConfigList[index].value = true;
          }
        }

        this.socialLoginConfigChecked = [...(res?.gogamingConfig?.openedSocialLogin || [])];
        for (let index = 0; index < this.socialLoginConfigList.length; index++) {
          if (this.socialLoginConfigChecked.indexOf(this.socialLoginConfigList[index].name) > -1) {
            this.socialLoginConfigList[index].value = true;
          }
        }

        this.imgDomain = res.iconAddress;

        // this.day_color1 = res.gogamingConfig.dayColor?.m;
        // this.day_color2 = res.gogamingConfig.dayColor?.a;
        // this.day_color3 = res.gogamingConfig.dayColor?.s;
        // this.night_color1 = res.gogamingConfig.nightColor?.m;
        // this.night_color2 = res.gogamingConfig.nightColor?.a;
        // this.night_color3 = res.gogamingConfig.nightColor?.s;
        this.formGroup.patchValue({
          merchantsName: res.name,
          email: res.email,
          siteUrl: res.url,
          serviceFee: String(res.serviceFee),
          withdrawSingleThreshold: res.gogamingConfig?.withdrawSingleThreshold,
          withdraw24hThreshold: res.gogamingConfig?.withdraw24hThreshold,
          googleVerifyName: res.googleVerifyName,
          merchantsId: res.gogamingConfig.gameHubID,
          requiredFreeWithdrawFeeMultiples: res.gogamingConfig?.requiredFreeWithdrawFeeMultiples || 0,
          ledLockRatio: String(res.gogamingConfig.ledLockRatio),
          ledMinAmount: String(res.gogamingConfig.ledMinAmount),

          // 活动
          luckGridType: res.gogamingConfig.turntableType || (TurntableTypeEnum.Grid12 as any),

          // 限额金额设置
          isLimitAmount: res?.gogamingConfig?.limitAmount ? true : false,
          limitAmount: res?.gogamingConfig?.limitAmount ? res?.gogamingConfig?.limitAmount : 0,

          // 更改风控级别
          riskControlNoAudit: res?.gogamingConfig?.riskControlNoAudit,

          // 支持的语系
          supportLangList: res?.gogamingConfig?.supportLangList || [],

          // NOTO服务
          notDivision: res?.gogamingConfig?.notDivision || 'Nil',

          // GoMoney
          merchantsKey: res.gomoneyConfig?.securityKey,
          systemId: res.gomoneyConfig?.systemID,
          // callBackUrl: res.gomoneyConfig?.callBackUrl,
          // whiteList: res.gomoneyConfig?.whitelist?.join(',') || '0.0.0.0',
          // negativeLading: !!+res.gomoneyConfig?.isNegative,
          // rateCategory: res.gomoneyConfig?.rateCategory || 'FixedScale',
          // isFiatMoneyEnable: !!+res.gomoneyConfig?.isFiatMoneyEnable,
          // isVirtualMoneyEnable: !!+res.gomoneyConfig?.isVirtualMoneyEnable,
          // isVirtualToFiatMoneyEnable: !!+res.gomoneyConfig?.isVirtualToFiatMoneyEnable,
        });
      }),
      catchError((err) => {
        console.error(err);
        this.isDetailLoadError = true;
        return of(null);
      }),
      switchMap(() =>
        this.uploadApi.getMerchantStaticConfig(this.id).pipe(
          tap((res) => {
            if (!(res && res.web && res.app)) return;
            const { web, app } = res;
            /*******************************
             * web配置回显                  *
             ******************************/
            this.configFormGroup.patchValue({
              webColorScheme: web.colorScheme || 'sun',
              loadingImg: web.loadingImg,
              ...this.merchantsLogo.reduce((acc, cur) => {
                acc[cur.value] = web?.[cur.key] || '';
                return acc;
              }, {}),
            });
            //设置PC默认头像
            if (web?.defaultAvatarPc) {
              this.configFormGroup.setControl('defaultAvatarPc', this.fb.array(web?.defaultAvatarPc));
            }
            this.configFormGroup.setControl(
              'webConfig',
              this.fb.array(
                Object.keys(web?.config || {}).map((key) =>
                  this.generateConfigField({ key, value: web?.config?.[key] })
                ),
                this.configExistFieldValidator()
              ) as any
            );

            /*******************************
             * app配置回显                  *
             ******************************/
            this.configFormGroup.patchValue({
              appColorScheme: app.colorScheme || 'sun',
              appMaintenance: app.maintain ? 'enable' : 'close',
              maintainTimeEnd: app.maintain ? new Date(app.maintainTimeEnd) : '',
              ...this.appImg.reduce((acc, cur, i) => {
                acc[cur.value] = app.startupImg?.[i] || '';
                return acc;
              }, {}),
              ...this.merchantsAppLogo.reduce((acc, cur) => {
                acc[cur.value] = app[cur.key];
                return acc;
              }, {}),
            });
            //设置App默认头像
            if (app?.defaultAvatarApp) {
              this.configFormGroup.setControl('defaultAvatarApp', this.fb.array(app?.defaultAvatarApp));
            }

            this.configFormGroup.setControl(
              'appConfig',
              this.fb.array(
                Object.keys(app?.config || {}).map((key) =>
                  this.generateConfigField({ key, value: app?.config?.[key] })
                ),
                this.configExistFieldValidator()
              ) as any
            );
          })
        )
      )
    );
  }

  /**
   * 服务配置复选框选中
   * @param item 复选框选中项
   */
  onItemCheck(item): void {
    const index = this.serviceConfigChecked.indexOf(item);
    this.serviceConfigChecked.splice(index >>> 0, 1, index < 0 ? item : '');
    this.serviceConfigChecked = this.serviceConfigChecked.filter((e) => !!e);
    this.checkServiceAuth();
  }

  /** 验证 服务配置权限 */
  checkServiceAuth(): void {
    this.serviceConfigValidate = !this.serviceConfigChecked.length;
  }

  /**
   * 社交媒体登陆 复选框选中
   * @param item 复选框选中项
   */
  onLoginItemCheck(item): void {
    const index = this.socialLoginConfigChecked.indexOf(item);
    this.socialLoginConfigChecked.splice(index >>> 0, 1, index < 0 ? item : '');
    this.socialLoginConfigChecked = this.socialLoginConfigChecked.filter((e) => !!e);
  }

  /** 检验颜色 */
  checkColor(): void {
    // this.selectColorValidate = [
    //   'day_color1',
    //   'day_color2',
    //   'day_color3',
    //   'night_color1',
    //   'night_color2',
    //   'night_color3',
    // ].some((key) => this[key] === '#f1f4f7');
  }

  /**
   * 提交表单
   */
  submit(): void {
    this.checkServiceAuth();
    this.checkColor();
    // this.checkAdmin();

    this.formGroup.markAllAsTouched(); // 手动执行验证

    if (
      this.formGroup.invalid ||
      this.selectColorValidate ||
      this.serviceConfigValidate ||
      this.serviceAdminValidate ||
      (Array.isArray(this.formGroup.value.supportLangList) && !this.formGroup.value.supportLangList.length)
    )
      return;
    const param: UpdateMerchantsParams = {
      id: this.id,
      name: this.formGroup.value.merchantsName as string,
      email: this.formGroup.value.email as string,
      url: this.formGroup.value.siteUrl as string,
      managerIds: [], // 商户管理
      serviceFee: Number(this.formGroup.value.serviceFee) || 0,
      googleVerifyName: this.formGroup.value.googleVerifyName as string,
      gogamingConfig: {
        withdrawSingleThreshold: this.formGroup.getRawValue().withdrawSingleThreshold,
        withdraw24hThreshold: this.formGroup.getRawValue().withdraw24hThreshold,
        gameHubID: this.formGroup.value.merchantsId as string,
        gameHubKey: this.detail.gogamingConfig?.gameHubKey || '11',
        requiredFreeWithdrawFeeMultiples: +this.formGroup.value.requiredFreeWithdrawFeeMultiples! || 0,
        openedSocialLogin: this.socialLoginConfigChecked || [],
        ledLockRatio: this.formGroup.value.ledLockRatio ? +this.formGroup.value.ledLockRatio : null,
        ledMinAmount: this.formGroup.value.ledMinAmount ? +this.formGroup.value.ledMinAmount : null,
        turntableType: this.formGroup.value.luckGridType!,
        limitAmount: this.formGroup.value.isLimitAmount ? this.formGroup.value.limitAmount : 0, // 限额金额，关闭限制 金额默认为0
        riskControlNoAudit: this.formGroup.value.riskControlNoAudit, // 更改风控级别
        supportLangList: this.formGroup.value.supportLangList, // 支持的语系
        notDivision: this.formGroup.value.notDivision || '', // NOTO
        // dayColor: {
        //   m: this.day_color1,
        //   a: this.day_color2,
        //   s: this.day_color3,
        // },
        // nightColor: {
        //   m: this.night_color1,
        //   a: this.night_color2,
        //   s: this.night_color3,
        // },
        // appUrl: [
        //   { url: this.formGroup.value.APP1 as string, index: 0 },
        //   { url: this.formGroup.value.APP2 as string, index: 1 },
        //   { url: this.formGroup.value.APP3 as string, index: 2 },
        // ],
      },
      // managerIds: this.curAdminList,
      gomoneyConfig: {
        securityKey: this.formGroup.value.merchantsKey as string,
        systemID: this.formGroup.value.systemId || '', // Ring:系统ID应该是自动获取
        // interfaceUrl: this.formGroup.value.interfaceAdress,
        // callBackUrl: this.formGroup.value.callBackUrl || '',
        // whitelist:
        //   this.formGroup.value.whiteList
        //     ?.split(',')
        //     .map((e) => e.trim())
        //     .filter((e) => e) || [],
        // isNegative: !!this.formGroup.value.negativeLading,
        // rateCategory: this.formGroup.value.rateCategory || 'FixedScale',
        // isFiatMoneyEnable: this.formGroup.value.isFiatMoneyEnable ?? false,
        // isVirtualMoneyEnable: this.formGroup.value.isVirtualMoneyEnable ?? false,
        // isVirtualToFiatMoneyEnable: this.formGroup.value.isVirtualToFiatMoneyEnable ?? false,
        // rates: this.getFeeConfigParam(),
      },
      gosportsConfig: '',
      golotteryConfig: '',
      openedService: this.serviceConfigChecked,
    };

    if (this.isEdit) {
      const openedSocialLogin = [...(this.detail?.gogamingConfig?.openedSocialLogin || [])];
      this.isLoginConfigEqual =
        openedSocialLogin.length === this.socialLoginConfigChecked.length &&
        openedSocialLogin.sort().toString() === this.socialLoginConfigChecked.sort().toString();
    }

    this.loading(true);
    this.merchantsApi[this.isEdit ? 'updateMerchant' : 'creatMerchant']({ ...param })
      .pipe(
        switchMap((res) =>
          // 如果新增，只有一个提交按钮，需要带上自定义配置提交
          // 如果编辑，社交登陆配置有改变，也需要带上自定义配置提交
          this.isAdd || (this.isEdit && !this.isLoginConfigEqual)
            ? this.uploadConfig(this.isEdit ? this.id : +res || undefined).pipe(map(() => res))
            : of(res)
        ),
        finalize(() => this.loading(false))
      )
      .subscribe((res: any) => {
        const successMsg = this.isEdit ? 'system.merchants.updateSuc' : 'common.addSuccess';
        const failMsg = 'common.operationFailed';
        const successed = res === true || !!+res;

        this.appService.showToastSubject.next({
          msgLang: successed ? successMsg : failMsg,
          successed,
        });

        this.isAdd && successed && this.back();
        this.isEdit && successed && !this.isLoginConfigEqual && this.back();
      });
  }

  /**
   * 提交配置表单
   */
  submitConfig() {
    // 新增商户：会将数据和自定义配置一起提交
    if (this.isAdd) return this.submit();

    this.appService.isContentLoadingSubject.next(true);
    this.uploadConfig(this.id || undefined).subscribe((res) => {
      this.appService.isContentLoadingSubject.next(false);
      res && this.appService.showToastSubject.next({ msgLang: 'system.merchants.uploadConfigSuc', successed: true });
    });
  }

  uploadConfig(id) {
    if (!id) return of(null); // 不要直接赋值this.id变量避免后续操作以及维护会出错
    const maintainTimeEnd = this.configFormGroup.value.maintainTimeEnd
      ? new Date(this.configFormGroup.value.maintainTimeEnd).getTime()
      : '';
    const content = {
      web: {
        ...this.merchantsLogo.reduce((acc, cur) => {
          acc[cur.key] = this.configFormGroup.value[cur.value] || '';
          return acc;
        }, {}),
        colorScheme: this.configFormGroup.value.webColorScheme || 'sun',
        loadingImg: this.configFormGroup.value.loadingImg || '',
        openedSocialLogin: this.socialLoginConfigChecked || [], // 同步社交媒体登陆配置
        defaultAvatarPc: this.defaultAvatarPc.value.some((res) => res)
          ? this.defaultAvatarPc.value.map((res) => (res ? res : ''))
          : null,
        config: this.getConfig('web'),
      },

      app: {
        ...this.merchantsAppLogo.reduce((acc, cur) => {
          acc[cur.key] = this.configFormGroup.value[cur.value] || '';
          return acc;
        }, {}),
        colorScheme: this.configFormGroup.value.appColorScheme || 'sun',
        maintain: this.configFormGroup.value.appMaintenance === 'enable' ? true : false,
        maintainTimeEnd: this.configFormGroup.value.appMaintenance === 'enable' ? maintainTimeEnd : '',
        //app默认头像
        defaultAvatarApp: this.defaultAvatarPc.value.some((res) => res)
          ? this.defaultAvatarPc.value.map((res) => (res ? res : ''))
          : null,
        startupImg: this.appImg.map((e) => this.configFormGroup.value[e.value] || ''),
        openedSocialLogin: this.socialLoginConfigChecked || [], // 同步社交媒体登陆配置
        config: this.getConfig('app'),
      },
    };

    return this.uploadApi.uploadMerchantStaticConfig(id, content).pipe(
      catchError(() => of(null)),
      map((res) => {
        if (!res) this.appService.showToastSubject.next({ msgLang: 'system.merchants.uploadConfigFail' });

        return res;
      })
    );
  }

  back(): void {
    this.router.navigate(['/system/merchants']);
  }

  // loading处理
  loading = (v: boolean) => {
    this.appService.isContentLoadingSubject.next(v);
  };

  /**
   * 获取服务权限配置信息
   */
  getmerchantServiceConfig$() {
    return this.merchantsApi.getmerchantServiceConfig().pipe(
      tap((list) => {
        if (!Array.isArray(list)) return;

        list.forEach((element) => {
          this.serviceConfigList.push({ name: element, value: false });
        });
      }),
      switchMap(() => (this.isEdit ? this.querymerchant$() : of(null)))
      // switchMap(() => this.getPaymentAndCurrency$())
    );
  }

  /** 删除对应数据 */
  async openDelTagTpl(tpl, i, type) {
    const modal = this.ngbModal.open(tpl, { centered: true });
    if ((await modal.result) !== true) return;

    const configList = type === 'web' ? this.webConfig : this.appConfig;
    configList.removeAt(i);
  }

  /** 新增对应配置字段 */
  addConfig(type) {
    const configList = type === 'web' ? this.webConfig : this.appConfig;

    configList.push(this.generateConfigField());
  }

  /** 生成配置字段 */
  generateConfigField(data?: any) {
    return this.fb.group({
      key: [data?.key || '', Validators.compose([Validators.pattern(/^[a-zA-Z_][a-zA-Z0-9_]*$/), Validators.required])],
      value: [data?.value || ''],
    });
  }

  /** 删除空字段的配置 */
  delEmptyFieldConfig(type) {
    const configList = type === 'web' ? this.webConfig : this.appConfig;

    for (let i = configList.length; i-- > 0; ) {
      !(configList.value[i].key.trim() || configList.value[i].value.trim()) && configList.removeAt(i);
    }
  }

  /** 获取配置 */
  getConfig(type) {
    const configList = type === 'web' ? this.webConfig : this.appConfig;
    const config = {};

    configList.value.forEach((element) => {
      config[element.key] = element.value;
    });

    return config;
  }

  /** 设置费率配置 */
  setFeeConfig(rateList: MerchantRateCurrency[]): void {
    if (!rateList || !Array.isArray(rateList)) return;

    // 这里一定要深拷贝，否则做处理可能会影响原数据，再重置的时候，需要重新从原始数据赋值
    this.supportPayList = rateList.map((j) => ({
      ...j,
      data: cloneDeep(j.currencies).map((e) => {
        const temp = { ...e } as any;
        delete temp?.payments;

        return {
          ...temp,
          currency: temp.currency,
          deposit:
            e.payments
              ?.filter((j) => j.paymentCategory === 'Deposit')
              ?.map((method) => ({
                ...method,
                name: this.getPaymentName(method.paymentMethodId),
                ...this.generateFeeConfig(e.currency, method.paymentCategory, method.paymentMethodId, j.chargeCategory),
              })) || [],
          withdrawal:
            e.payments
              ?.filter((j) => j.paymentCategory === 'Withdraw')
              ?.map((method) => ({
                ...method,
                name: this.getPaymentName(method.paymentMethodId),
                ...this.generateFeeConfig(e.currency, method.paymentCategory, method.paymentMethodId, j.chargeCategory),
              })) || [],
        };
      }),
    }));
  }

  /** 生成费率配置 */
  generateFeeConfig(currency: string, paymentType: PaymentType, paymentCode: string, category: CurrencyType) {
    let { smallRate, largeRate, feeMin, feeMax } =
      this.detail?.gomoneyConfig?.rates
        ?.find((e) => e.currencyType === currency)
        ?.paymentMethodConfigs?.find(
          (e) => e.paymentCategory === paymentType && e.paymentMethodId === paymentCode && e.chargeCategory === category
        ) || {}; // 找到对应支付方式下的大小额费率

    smallRate = smallRate ? new BigNumber(smallRate).multipliedBy(100).toNumber() : 0;
    largeRate = largeRate ? new BigNumber(largeRate).multipliedBy(100).toNumber() : 0;

    return {
      smallRate: smallRate || 0,
      largeRate: largeRate || 0,
      feeControl: this.fb.group(
        {
          feeMin: [feeMin || 0],
          feeMax: [feeMax || 0],
        },
        {
          validators: [this.withdrawalFeeValidator()],
        }
      ),
    };
  }

  /** 出款费率验证 */
  withdrawalFeeValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const { value } = control;

      if ((+value.feeMin || 0) > (+value.feeMax || 0)) {
        return { gtFeeMax: true };
      }

      return null;
    };
  }

  /** 提交的费率配置参数 */
  getFeeConfigParam(): MerchantGoMoneyRate[] {
    // rate提交范围0 ~ 1
    return this.supportPayList.reduce((t, c) => {
      c.data.forEach((e) => {
        let item = t.find((j) => j.currencyType === e.currency);

        if (!item) {
          item = { currencyType: e.currency, paymentMethodConfigs: [] };
          t.push(item);
        }

        item.paymentMethodConfigs.push(
          ...e.deposit.map(
            (j): MerchantGoMoneyPaymentMethodConfig => ({
              paymentCategory: 'Deposit',
              paymentMethodId: j.paymentMethodId,
              chargeCategory: c.chargeCategory as keyof typeof MerchantRateCurrencyType,
              smallRate: j.smallRate ? new BigNumber(j.smallRate).div(100).toNumber() : 0,
              largeRate: j.largeRate ? new BigNumber(j.largeRate).div(100).toNumber() : 0,
              feeMin: +j.feeControl.get('feeMin')?.value || 0,
              feeMax: +j.feeControl.get('feeMax')?.value || 0,
            })
          ),
          ...e.withdrawal.map((j): MerchantGoMoneyPaymentMethodConfig => {
            if (j.feeControl.invalid && j.feeControl.errors?.['gtFeeMax']) {
              const errorArg = { currency: e.currency, payment: j.name };
              this.appService.showToastSubject.next({
                msgLang: 'system.merchants.feeWithdrawErrorTip',
                msgArgs: errorArg,
              });
              throw new Error(
                `[提款费率配置错误]${errorArg.currency} - ${errorArg.payment} : Please enter the correct withdrawal fee`
              );
            }

            return {
              paymentCategory: 'Withdraw',
              paymentMethodId: j.paymentMethodId,
              chargeCategory: c.chargeCategory as keyof typeof MerchantRateCurrencyType,
              smallRate: j.smallRate ? new BigNumber(j.smallRate).div(100).toNumber() : 0,
              largeRate: j.largeRate ? new BigNumber(j.largeRate).div(100).toNumber() : 0,
              feeMin: +j.feeControl.get('feeMin')?.value || 0,
              feeMax: +j.feeControl.get('feeMax')?.value || 0,
            };
          })
        );
      });

      return t;
    }, [] as MerchantGoMoneyRate[]);
  }

  /** 获取支付方式的名称 */
  getPaymentName(paymentCode: string): string {
    return this.paymentList.find((e) => e.code === paymentCode)?.[this.lang.isLocal ? 'localName' : 'enName'];
  }

  /** goMoney配置币种切换 */
  onMoneyTab(i: number) {
    this.goMoneyConfigCurTab = i;
    this.curPaymentTabDeposit = 0;
    this.curPaymentTabWithdraw = 0;
  }

  /** 配置文件存在相同字段校验 */
  configExistFieldValidator(): any {
    return (control: FormArray<FormControl<MerchantStaticConfig>>): ValidationErrors | null => {
      const controls = control.controls;
      const keyList = control.value.map((e) => e.key);

      controls.forEach((e) => {
        const keyControl = e.get('key')!;
        const valueControl = keyControl?.value.trim();
        const isExist = valueControl && keyList.filter((j) => j === valueControl).length > 1;

        // 还原错误信息
        if (isExist) {
          keyControl.setErrors({ hasField: true });
        } else if (keyControl.getError('required')) {
          keyControl.setErrors({ required: true });
        } else if (keyControl.getError('pattern')) {
          keyControl.setErrors({ pattern: true });
        } else {
          keyControl.setErrors(null);
        }
      });

      return null;
    };
  }

  onFeeCurrencyType(key: CurrencyType, navBar) {
    this.curPaymentTabCurrency = key;
    this.goMoneyConfigCurTab = 0;
    this.curPaymentTabDeposit = 0;
    this.curPaymentTabWithdraw = 0;
    setTimeout(() => {
      navBar.scrollDistance = 0;
    });
  }

  /**新增pc默认头像 */
  addDefaultAvatarPc() {
    this.defaultAvatarPc.push(this.fb.control(''));
  }

  /**删除pc默认头像 */
  deleteDefaultAvatarPc(i) {
    this.defaultAvatarPc.removeAt(i);
  }

  /**新增app默认头像 */
  addDefaultAvatarApp() {
    this.defaultAvatarApp.push(this.fb.control(''));
  }

  /**删除默认头像 */
  deleteDefaultAvatarApp(i) {
    this.defaultAvatarApp.removeAt(i);
  }
}
