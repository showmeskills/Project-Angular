import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatModal } from 'src/app/shared/components/dialogs/modal';
import { AddPopupComponent } from 'src/app/pages/Bonus/activity-template/add-popup/add-popup.component';
import { zip } from 'rxjs';
import { SelectApi } from 'src/app/shared/api/select.api';
import { AppService } from 'src/app/app.service';
import { BonusService } from 'src/app/pages/Bonus/bonus.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ActivityAPI } from 'src/app/shared/api/activity.api';
import {
  ActivityQualificationsStep2,
  ActivityQualificationsStep2Category,
  ActivityQualificationsStep2ChannelPersonalUser,
  ActivityStep2ActiveUser,
  ActivityStep2Channel,
  ActivityStep2ChannelType,
  ActivityStep2DepositType,
  ActivityStep2IsCheckEnum,
  ActivityStep2KYC,
  ActivityStep2TransactionConditionEnum,
  ActivityStep2TransactionTime,
} from 'src/app/shared/interfaces/activity';
import { validatorArrayRequired } from 'src/app/shared/models/validator';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { timeFormat } from 'src/app/shared/models/tools.model';
import { VipApi } from 'src/app/shared/api/vip.api';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { TimeFormatPipe } from 'src/app/shared/pipes/time.pipe';
import { FormWrapComponent } from 'src/app/shared/components/form-row/form-wrap.component';
import { OwlDateTimeComponent } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker.component';
import { OwlDateTimeTriggerDirective } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker-trigger.directive';
import { OwlDateTimeInputDirective } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker-input.directive';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { CurrencyIconDirective, IconCountryComponent } from 'src/app/shared/components/icon/icon.directive';
import {
  SelectChildrenDirective,
  SelectDirective,
  SelectGroupDirective,
} from 'src/app/shared/directive/select.directive';
import {
  CheckboxArrayControlDirective,
  InputFloatDirective,
  InputNumberDirective,
  InputTrimDirective,
} from 'src/app/shared/directive/input.directive';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { AsyncPipe, JsonPipe, NgFor, NgIf, NgSwitch, NgSwitchCase, NgTemplateOutlet } from '@angular/common';
import { AttrDisabledDirective } from 'src/app/shared/directive/d-disabled.directive';
import { MatTabsModule } from '@angular/material/tabs';
import { UploadComponent } from 'src/app/shared/components/upload/upload.component';
import { SelectMemberComponent } from 'src/app/pages/Bonus/coupon-manage/send-coupon/select-member/select-member.component';
import { SelectParentComponent } from 'src/app/pages/Bonus/activity-template/step/quality/select-proxy/select-parent.component';

@Component({
  selector: 'quality',
  templateUrl: './quality.component.html',
  styleUrls: ['./quality.component.scss'],
  standalone: true,
  imports: [
    NgIf,
    FormRowComponent,
    NgFor,
    FormsModule,
    ReactiveFormsModule,
    InputTrimDirective,
    SelectChildrenDirective,
    SelectGroupDirective,
    SelectDirective,
    IconCountryComponent,
    AngularSvgIconModule,
    CurrencyIconDirective,
    InputNumberDirective,
    OwlDateTimeInputDirective,
    OwlDateTimeTriggerDirective,
    OwlDateTimeComponent,
    FormWrapComponent,
    InputFloatDirective,
    NgTemplateOutlet,
    AsyncPipe,
    TimeFormatPipe,
    LangPipe,
    AttrDisabledDirective,
    CheckboxArrayControlDirective,
    MatTabsModule,
    NgSwitchCase,
    UploadComponent,
    NgSwitch,
    JsonPipe,
  ],
  hostDirectives: [
    {
      directive: AttrDisabledDirective,
      inputs: ['attrDisabled: isView'],
    },
  ],
})
export class QualityComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    private modalService: MatModal,
    private selectApi: SelectApi,
    public appService: AppService,
    private bonusService: BonusService,
    private api: ActivityAPI,
    public router: Router,
    private activatedRoute: ActivatedRoute,
    public lang: LangService,
    private vipApi: VipApi
  ) {
    const { id, code } = activatedRoute.snapshot.params; // 快照里的params参数
    const { tenantId } = activatedRoute.snapshot.queryParams; // 快照里的params参数
    const { activityCode } = activatedRoute.snapshot.queryParams; // 快照里的params参数

    this.id = +id || 0;
    this.code = code || '';
    this.activityCode = activityCode || '';
    this.tenantId = +tenantId || 0;
  }

  id = 0;
  code = '';
  activityCode = '';
  emptyId = false;
  loadFinish = false;
  tenantId = 0;

  /** VIP等级 */
  levelList: { name: string; value: string }[] = [];

  /** 渠道状况 */
  channel = [
    { name: '全部渠道', value: ActivityStep2Channel.AllChannel, lang: 'luckRoulette.allChannel' },
    { name: '推荐好友', value: ActivityStep2Channel.InviteFriend, lang: 'luckRoulette.referFriend' },
    { name: '联盟渠道', value: ActivityStep2Channel.AffiliateChannel, lang: 'luckRoulette.affChannel' },
  ];

  /**
   * 渠道状况 - 新
   */
  channelType = [
    { name: '未指定渠道', value: ActivityStep2ChannelType.All, lang: 'luckRoulette.unchannel' },
    { name: '直客', value: ActivityStep2ChannelType.Direct, lang: 'luckRoulette.direct' },
    { name: '代理用户', value: ActivityStep2ChannelType.Proxy, lang: 'luckRoulette.proxyUser' },
    { name: '推荐好友', value: ActivityStep2ChannelType.Refer, lang: 'luckRoulette.referFriend' },
    { name: '指定用户', value: ActivityStep2ChannelType.Specify, lang: 'luckRoulette.specifyUser' },
  ];

  /**
   * 指定用户类型
   * @description 0-白名单 1-黑名单
   */
  specifyUserType = [
    { name: '白名单', value: 0, lang: 'member.activity.sencli12.whitelistPlayer' },
    { name: '黑名单', value: 1, lang: 'member.activity.sencli12.blacklistPlayer' },
  ];

  /**
   * 指定用户输入类型
   */
  specifyUserInputType = [
    { name: '选择会员', value: 0, lang: 'member.coupon.model.chooseMember' },
    { name: '手动输入', value: 1, lang: 'member.coupon.model.manualEntry' },
    { name: '上传名单', value: 2, lang: 'member.coupon.model.uploadList' },
  ];

  /**
   * 上级代理类型
   */
  superiorProxyType = [
    { name: '全部代理', value: 0, lang: 'luckRoulette.proxyAll' },
    { name: '选择代理', value: 1, lang: 'luckRoulette.proxySelect.title' },
  ];

  /**
   * 上级推荐好友类型
   */
  superiorFriendType = [
    { name: '全部推荐好友', value: 0, lang: 'luckRoulette.friendAll' },
    { name: '选择推荐好友', value: 1, lang: 'luckRoulette.friendSelect.title' },
  ];

  /** 币种状态 */
  currency = 0;

  /** 认证状态 */
  kycList = [
    { name: '未认证', value: ActivityStep2KYC.NotCertified, lang: 'luckRoulette.notVer' },
    { name: '初级认证', value: ActivityStep2KYC.BasicCertification, lang: 'luckRoulette.basicVer' },
    { name: '中级认证', value: ActivityStep2KYC.IntermediateCertification, lang: 'luckRoulette.intermediate' },
    { name: '高级认证', value: ActivityStep2KYC.AdvancedCertification, lang: 'luckRoulette.adVer' },
  ];

  countryList: any[] = [];
  currencyList: any[] = [];
  providerList: any[] = [];

  /** 已选的国家 */
  selectCountryList: any[] = [];

  /** 已选的币种 */
  selectCurrencyList: any[] = [];
  formGroup = this.fb.group({
    // TODO 以下有用勿删，待功能实现之后，放开以及html里状况渠道
    // channel: [ActivityStep2Channel.AllChannel, Validators.required],
    channel: [ActivityStep2Channel.AllChannel],
    channelTypes: [[ActivityStep2ChannelType.All] as ActivityStep2ChannelType[]], // 渠道状况 - 新
    channelPersonal: this.fb.group({
      inputType: [0], // 0-选择会员 1-手动输入 2-上传名单
      type: [0], // 0-白名单 1-黑名单
    }),
    // 代理白名单
    channelAgentWhite: this.fb.group({
      type: [0], // 0-全部 1-具体uids
      uids: [[] as string[]], // uid合集
    }),
    // 代理黑名单
    channelAgentBlack: this.fb.group({
      type: [1], // 0-全部 1-具体uids
      uids: [[] as string[]], // uid合集
    }),
    // 推荐好友白名单
    channelRecommenderWhite: this.fb.group({
      type: [0], // 0-全部 1-具体uids
      uids: [[] as string[]], // uid合集
    }),
    // 推荐好友黑名单
    channelRecommenderBlack: this.fb.group({
      type: [1], // 0-全部 1-具体uids
      uids: [[] as string[]], // uid合集
    }),
    channelCustomArr: [''],
    kyc: this.fb.array<FormControl<boolean>>([], validatorArrayRequired),
    countryType: [1], // 国家类型
    userLevel: this.fb.array<FormControl<boolean>>([], validatorArrayRequired),
    isActiveUser: [ActivityStep2ActiveUser.NoLimit], // 是否为活跃用户,
    isNewUser: [false, Validators.required], // 是否注册时间勾选
    createDay: [30], // 注册天数
    depositChoose: [false], // 存款勾选
    depositType: [ActivityStep2DepositType.Undeposited],
    depositTime: [[] as Array<Date | null>],
    depositTimeUSDT: ['0'], // 时间内存款总和USDT
    lastDepositTotalUsdt: ['0'], // 前一天存款总和USDT depositType 为 4 必填
    currentDepositTotalUsdt: ['0'], // 当天存款总和USDT depositType 为 5 必填
    depositLatestDay: [1], // 距离上次存款天数
    isTransactionStatus: [false], // 是否交易勾选
    transactionTime: [[] as Array<Date | null>],
    transactionTimeType: [ActivityStep2TransactionTime.all],
    transactionType: [ActivityStep2TransactionConditionEnum.NotBet],
    transactionLatestDay: [0], // 距离上次交易天数
    transactionCount: [0], // 笔数
    transactionMinEveryTime: [0], // 单笔最低
    transactionTotal: [0], // 累计交易
  });

  /** 发送对象 - 手动选择会员UID */
  memberSelectedList: any[] = [];

  /** 发送对象 - 手动输入会员UID */
  memberManualRemark = '';

  /** 发送对象 - 上传会员UID */
  memberManualUploadList: ActivityQualificationsStep2ChannelPersonalUser[] = [];

  protected readonly ActivityStep2Channel = ActivityStep2Channel;
  protected readonly ActivityStep2ChannelType = ActivityStep2ChannelType;
  protected readonly ActivityStep2ActiveUser = ActivityStep2ActiveUser;
  protected readonly ActivityStep2DepositType = ActivityStep2DepositType;
  protected readonly ActivityStep2TransactionTime = ActivityStep2TransactionTime;
  protected readonly ActivityStep2TransactionConditionEnum = ActivityStep2TransactionConditionEnum;

  get hasSuperior() {
    return [ActivityStep2ChannelType.Refer, ActivityStep2ChannelType.Proxy].some((e) =>
      this.formGroup.getRawValue().channelTypes!.includes(e)
    );
  }

  ngOnInit() {
    if (this.isReadonly) this.formGroup.disable();

    this.appService.isContentLoadingSubject.next(true);
    zip(
      this.selectApi.getCountry(),
      this.selectApi.getCurrencyListByMerchant(this.tenantId),
      this.selectApi.getCategorySelect(this.tenantId, ['Online', 'Maintenance']), // Fitch: 2023-04-06 只显示上架和维护的厂商
      this.vipApi.vip_manage_level_simple_list(this.tenantId)
    ).subscribe(([countryList, currencyList, provider, levelList]) => {
      this.appService.isContentLoadingSubject.next(false);

      this.countryList = countryList;
      this.currencyList = currencyList.map((e) => ({ ...e, code: e.currency }));
      this.providerList = provider;
      // .map((e) => ({
      //   ...e,
      //   providers: e.providers.filter((e) => e.status === ProviderStatusEnum[ProviderStatusEnum.Online]),
      // }))
      // .filter((e) => e.providers.length);

      // 获取VIP等级
      if (levelList?.code === '0000' && Array.isArray(levelList?.data)) {
        this.levelList = levelList?.data.map((v) => ({ name: v.vipName, value: String(v.vipLevel) }));
      }

      this.id && this.detail();

      if (!this.id) {
        this.emptyId = true;
      }
    });
  }

  detail() {
    this.appService.isContentLoadingSubject.next(true);
    this.api.qualifications_getsteptwo(this.code, this.tenantId).subscribe((res) => {
      this.appService.isContentLoadingSubject.next(false);

      if (!res || res.code !== '0000') {
        this.appService.showToastSubject.next(res?.message ? { msg: res.message } : { msgLang: 'common.fail' });
      }

      const config: Partial<ActivityQualificationsStep2> = res?.data || {};
      this.processKYC(config.kycTypes || []);
      this.processLevel(config);
      this.processDeposit(config);
      this.processProvider(config.categorys || []);
      this.processTransaction(config);
      this.processChannel(config);

      this.selectCountryList = this.countryList
        .map((e) =>
          e.countries.filter((j) => !config.countrys?.includes('all') && config.countrys?.includes(j.countryIso3))
        )
        .flat(Infinity);

      this.selectCurrencyList = this.currencyList
        .filter((e) => !config?.currencys?.includes('all') && config?.currencys?.includes(e.currency))
        .map((e) => e.currency);

      this.formGroup.patchValue({
        channel: config.channelType || ActivityStep2Channel.AllChannel,
        channelCustomArr: config.channelCodes?.join(',') || '',
        channelTypes: config.channelTypes?.length ? config.channelTypes : [ActivityStep2ChannelType.All],
        channelPersonal: {
          inputType: config.channelPersonal?.inputType || 0, // 0-选择会员 1-手动输入 2-上传名单
          type: config.channelPersonal?.type || 0, // 0-白名单 1-黑名单
        },
        // 代理白名单
        channelAgentWhite: {
          type: config.channelAgentWhite?.type || 0, // 0-全部 1-具体uids
          uids: config.channelAgentWhite?.uids || [], // uid合集
        },
        // 代理黑名单
        channelAgentBlack: {
          type: 1, // 0-全部 1-具体uids
          uids: config.channelAgentBlack?.uids || [], // uid合集
        },
        // 推荐好友白名单
        channelRecommenderWhite: {
          type: config.channelRecommenderWhite?.type || 0, // 0-全部 1-具体uids
          uids: config.channelRecommenderWhite?.uids || [], // uid合集
        },
        // 推荐好友黑名单
        channelRecommenderBlack: {
          type: 1, // 0-全部 1-具体uids
          uids: config.channelRecommenderBlack?.uids || [], // uid合集
        },
        countryType: config.countryType || 1,
        isActiveUser: config?.isActiveUser || ActivityStep2ActiveUser.NoLimit,
        isNewUser: config?.isNewUser === ActivityStep2IsCheckEnum.true,
        createDay: config?.createDay || 30,
      });

      this.loadFinish = true; // 加载完成
      this.onChannel();
    });
  }

  /**
   * 初始化KYC验证
   * @param kyc
   */
  processKYC(kyc: string[]) {
    const hasAll = kyc.includes(ActivityStep2KYC.All);
    const kycControls = this.kycList.map(
      (e) => new FormControl(hasAll || kyc.includes(e.value))
    ) as FormControl<boolean>[];
    this.formGroup.setControl('kyc', this.fb.array(kycControls, validatorArrayRequired));
  }

  /**
   * 初始化VIP等级
   * @param detail
   */
  processLevel(detail: Partial<ActivityQualificationsStep2>) {
    const level = detail?.vipLevels || [];
    const hasAll = level.includes('all');
    const levelControls = this.levelList.map(
      (e) => new FormControl(hasAll || level.includes(e.value))
    ) as FormControl<boolean>[];

    this.formGroup.setControl('userLevel', this.fb.array(levelControls, validatorArrayRequired));
  }

  /**
   * 初始化存款
   * @param detail
   */
  processDeposit(detail: Partial<ActivityQualificationsStep2>) {
    this.formGroup.patchValue({
      depositChoose: detail?.depositChoose === ActivityStep2IsCheckEnum.true,
      depositType: Number(detail.depositType) || ActivityStep2DepositType.Undeposited,
      depositLatestDay: detail.lastDepositDays || 1,
      depositTime: [
        detail?.depositStartTime ? new Date(detail.depositStartTime) : null,
        detail?.depositEndTime ? new Date(detail.depositEndTime) : null,
      ],
      depositTimeUSDT: detail.depositTotalUsdt || '0',
      lastDepositTotalUsdt: detail.lastDepositTotalUsdt || '0',
      currentDepositTotalUsdt: detail.currentDepositTotalUsdt || '0',
    });
  }

  /**
   * 初始化厂商选择
   * @param selList
   */
  processProvider(selList: ActivityQualificationsStep2Category[]) {
    this.providerList.forEach((e) => {
      const cur = selList.find((j) => j.code === e.code) || {
        providers: [] as { providerId: string }[],
      };

      e.providers.forEach((j) => {
        j.checked = cur.providers.some((c) => c.providerId === j.providerId);
      });
    });
  }

  /**
   * 初始化渠道
   */
  processChannel(detail: Partial<ActivityQualificationsStep2>) {
    detail.channelTypes?.forEach((e) => {
      if (ActivityStep2ChannelType.Specify === e) {
        // config.channelPersonal?.inputType || 0, // 0-选择会员 1-手动输入 2-上传名单
        switch (detail.channelPersonal?.inputType) {
          case 0: // 发送对象 - 手动选择会员UID
            this.memberSelectedList = detail.channelPersonal?.users || [];
            break;
          case 1: // 发送对象 - 手动输入会员UID
            this.memberManualRemark = detail.channelPersonal?.users?.map((e) => e.uid).join(';') || '';
            break;
          case 2: // 发送对象 - 上传会员UID
            this.memberManualUploadList = detail.channelPersonal?.users || [];
            break;
        }
      }
    });
  }

  /**
   * 初始化交易
   * @param detail
   */
  processTransaction(detail: Partial<ActivityQualificationsStep2>) {
    this.formGroup.patchValue({
      isTransactionStatus: detail?.betChoose === ActivityStep2IsCheckEnum.true,
      transactionTimeType:
        ActivityStep2TransactionConditionEnum.BetLast === detail.betType
          ? ActivityStep2TransactionTime.BetLast
          : ActivityStep2TransactionTime[ActivityStep2TransactionTime[detail.betTimeType as any]] ??
            ActivityStep2TransactionTime.all,
      transactionType:
        ActivityStep2TransactionConditionEnum[ActivityStep2TransactionConditionEnum[detail.betType as any]] ??
        ActivityStep2TransactionConditionEnum.NotBet,
      transactionTime: [
        detail.betTimeStart ? new Date(detail.betTimeStart) : null,
        detail.betTimeEnd ? new Date(detail.betTimeEnd) : null,
      ],
      transactionCount: detail.betCount || 0,
      transactionMinEveryTime: detail.betSingleUsdt || 0,
      transactionTotal: detail.betTotalUsdt || 0,
      transactionLatestDay: detail.lastBetDays || 1,
    });
  }

  async onSubmit() {
    if (this.isReadonly) return this.jump('activity');
    this.formGroup.markAllAsTouched();

    if (this.formGroup.invalid) return this.appService.showToastSubject.next({ msgLang: 'form.formInvalid' });
    // 交易状态勾选后判断厂商是否有勾选
    // if (
    //   this.formGroup.value.isTransactionStatus &&
    //   !this.providerList.some((e) => e.providers.some((j) => j.checked))
    // ) {
    //   return this.appService.showToastSubject.next({
    //     msgLang: 'form.multiRequiredOverlay',
    //     msgArgs: { label: `${await this.lang.getOne('game.men')}` },
    //   });
    // }

    this.appService.isContentLoadingSubject.next(true);

    let kycTypes = this.kycList
      .map((e, i) => ({ ...e, checked: !!this.formGroup.value.kyc?.[i] }))
      .filter((e) => e.checked)
      .map((e) => e.value);

    kycTypes = kycTypes.length >= this.kycList.length ? [ActivityStep2KYC.All] : kycTypes;

    let vipLevels = this.levelList
      .map((e, i) => ({ ...e, checked: !!this.formGroup.value.userLevel?.[i] }))
      .filter((e) => e.checked)
      .map((e) => e.value);

    vipLevels = vipLevels.length >= this.levelList.length ? ['all'] : vipLevels;

    const betType =
      this.formGroup.value.transactionTimeType === ActivityStep2TransactionTime.BetLast
        ? ActivityStep2TransactionConditionEnum.BetLast
        : this.formGroup.value.transactionType!;

    this.api
      .qualifications_updatesteptwo({
        kycTypes,
        vipLevels,
        tenantId: this.tenantId,
        tmpCode: this.code,
        createDay: this.formGroup.value.createDay!,
        isActiveUser: this.formGroup.value.isActiveUser! || ActivityStep2ActiveUser.NoLimit,
        isNewUser: ActivityStep2IsCheckEnum[this.formGroup.value.isNewUser! as any],
        channelType: this.formGroup.value.channel!,
        channelTypes: this.formGroup.value.channelTypes!,
        channelPersonal: {
          inputType: this.formGroup.value!.channelPersonal!.inputType!,
          type: this.formGroup.value!.channelPersonal!.type!,
          users: this.getChannelPersonalUids(),
        },
        // 代理白名单
        channelAgentWhite: {
          type: this.formGroup.value.channelAgentWhite?.type || 0, // 0-全部 1-具体uids
          uids: this.formGroup.value.channelAgentWhite?.uids || [], // uid合集
        },
        // 代理黑名单
        channelAgentBlack: {
          type: 1, // 0-全部 1-具体uids
          uids: this.formGroup.value.channelAgentBlack?.uids || [], // uid合集
        },
        // 推荐好友白名单
        channelRecommenderWhite: {
          type: this.formGroup.value.channelRecommenderWhite?.type || 0, // 0-全部 1-具体uids
          uids: this.formGroup.value.channelRecommenderWhite?.uids || [], // uid合集
        },
        // 推荐好友黑名单
        channelRecommenderBlack: {
          type: 1, // 0-全部 1-具体uids
          uids: this.formGroup.value.channelRecommenderBlack?.uids || [], // uid合集
        },

        channelCodes:
          this.formGroup.value.channelCustomArr
            ?.split(',')
            .map((e) => e.trim())
            .filter((e) => e) || [],
        countryType: this.formGroup.value.countryType!,
        countrys: this.selectCountryList.length ? this.selectCountryList.map((e) => e.countryIso3) : ['all'],
        currencys: this.selectCurrencyList.length ? this.selectCurrencyList : ['all'],
        depositChoose: ActivityStep2IsCheckEnum[String(!!this.formGroup.value.depositChoose)],
        betChoose: ActivityStep2IsCheckEnum[String(!!this.formGroup.value.isTransactionStatus)],

        /** 交易时间类型 */
        betTimeType: this.formGroup.value.transactionTimeType!, // 交易时间类型
        betTimeStart: timeFormat(this.formGroup.value.transactionTime?.[0]), // betTimeType 为 0 时候不能为空,交易时间开始
        betTimeEnd: timeFormat(this.formGroup.value.transactionTime?.[1]), // betTimeType 为 0 时候不能为空,交易时间结束

        /** 交易条件 */
        betType, // 交易条件
        lastBetDays: +this.formGroup.value.transactionLatestDay!, // betType 为 1 必填 距离上次交易 几天
        betCount: +this.formGroup.value.transactionCount!, // betType 为 2 必填! 交易笔数
        betSingleUsdt: +this.formGroup.value.transactionMinEveryTime!, // betType 为 2 必填! 每笔交易最小金额
        betTotalUsdt: +this.formGroup.value.transactionTotal!, // 交易金额 betType 为 2 时必填! 累计金额
        categorys: this.providerList
          .map((c) => ({
            code: c.code,
            providers: c.providers.filter((j) => j.checked).map((e) => ({ providerId: e.providerId })),
          }))
          .filter((e) => e.providers.length),

        /** 存款条件 */
        depositType: this.formGroup.value.depositType!, // 存款条件
        lastDepositDays: +this.formGroup.value.depositLatestDay!, // depositType 为 1 必填 距离上次存款 几天
        depositStartTime: timeFormat(this.formGroup.value.depositTime?.[0]), // depositType 为 2 必填 存款范围时间开始
        depositEndTime: timeFormat(this.formGroup.value.depositTime?.[1]), // depositType 为 2 必填 存款范围时间结束
        depositTotalUsdt: +this.formGroup.value.depositTimeUSDT!, // depositType 为 2 必填 存款范围时间 内总和
        lastDepositTotalUsdt: +this.formGroup.value.lastDepositTotalUsdt!, // depositType 为 4 必填 前一天存款总和USDT 内总和
        currentDepositTotalUsdt: +this.formGroup.value.currentDepositTotalUsdt!, // depositType 为 5 必填 当天存款总和USDT 内总和
      })
      .subscribe((res) => {
        this.appService.isContentLoadingSubject.next(false);

        if (res?.code !== '0000') {
          return this.appService.showToastSubject.next(
            res.message ? { msg: res.message } : { msgLang: 'bonus.activity.updateActivityFail' }
          );
        }

        this.jump('activity');
      });
  }

  onBack() {
    this.jump('base');
  }

  jump(lastPath: string) {
    const prefix = this.router.url.split('/').slice(0, 7).join('/');

    return this.router.navigate([`${prefix}/${lastPath}` + (this.isReadonly ? '-view' : ''), this.id, this.code], {
      relativeTo: this.activatedRoute,
      queryParamsHandling: 'merge',
    });
  }

  /**
   * 选择国家
   */
  openAddPopupCountry() {
    const type = 'area';
    const modalRef = this.modalService.open(AddPopupComponent, { width: '776px' });
    modalRef.componentInstance['type'] = type;
    modalRef.componentInstance['list'] = this.countryList;
    modalRef.componentInstance['selectedList'] = this.selectCountryList;
    modalRef.componentInstance.confirm.subscribe((selList) => {
      this.selectCountryList = selList;
    });

    modalRef.result.then(() => {}).catch(() => {});
  }

  openAddPopup() {
    const type = 'currency';
    const modalRef = this.modalService.open(AddPopupComponent, { width: '776px' });
    modalRef.componentInstance['type'] = type;
    modalRef.componentInstance['list'] = this.currencyList;
    modalRef.componentInstance['selectedList'] = this.selectCurrencyList;
    modalRef.componentInstance.confirm.subscribe((selList) => {
      this.selectCurrencyList = selList;
    });

    modalRef.result.then(() => {}).catch(() => {});
  }

  onChannel() {
    const isCustom = this.formGroup.value.channel === ActivityStep2Channel.DesignatedChannel;
    const custom = this.formGroup.get('channelCustomArr');

    if (!custom) return;
    custom.setValidators(isCustom ? Validators.required : null);
    custom.updateValueAndValidity();
  }

  /**
   * 渠道状况 - 新 - 改变
   */
  onChannelTypes(value: ActivityStep2ChannelType) {
    const channelTypes = this.formGroup.controls.channelTypes!;
    if (value === ActivityStep2ChannelType.All || !channelTypes.value!.length) {
      return this.formGroup.controls.channelTypes?.setValue([ActivityStep2ChannelType.All]);
    }

    const hasOther =
      this.formGroup.value.channelTypes!.length > 1 &&
      this.formGroup.value.channelTypes?.includes(ActivityStep2ChannelType.All);

    if (!hasOther) return;
    channelTypes.setValue(channelTypes.value!.filter((e) => e !== ActivityStep2ChannelType.All));
    channelTypes.updateValueAndValidity();
  }

  /**
   * 是否只读查看
   */
  @Input() isView = false;

  /** 是否只读查看 */
  get isReadonly() {
    return this.isView;
  }

  /**
   * 新用户注册时间改变
   */
  onRegistryTimeChange() {
    this.formGroup.value.isNewUser && this.formGroup.controls.isTransactionStatus.setValue(false);
  }

  /**
   * 厂商选择改变 - 全选的时候异步让子选项先勾选上
   */
  async onProviderChange() {
    setTimeout(() => {
      const hasChecked = this.providerList.some((c) => c.providers.some((p) => p.checked));
      // 有厂商被选中时，交易状态自动勾选上
      hasChecked && this.formGroup.controls.isTransactionStatus.setValue(true);
    }, 10);
  }

  /**
   * 打开会员选择弹窗
   */
  onOpenMemberSelectPopup() {
    const modalRef = this.modalService.open(SelectMemberComponent, { width: '744px', disableClose: true });
    modalRef.componentInstance['tenantId'] = this.tenantId;

    modalRef.componentInstance.selectSuccess.subscribe((list) => {
      const all = [...this.memberSelectedList, ...list];
      // 对象数组去重
      const res = new Map();
      this.memberSelectedList = all.filter((item) => !res.has(item['uid']) && res.set(item['uid'], 1));
    });

    modalRef.result.then(() => {}).catch(() => {});
  }

  /**
   * 发送对象 - 会员名单上传
   * @param file
   */
  customUpload = async (file /*{ done }*/) => {
    this.appService.isContentLoadingSubject.next(true);
    this.api.step2UploadUserTemplate(file).subscribe((res) => {
      this.appService.isContentLoadingSubject.next(false);

      this.appService.showToastSubject.next({
        msgLang: res?.code === '0000' ? 'member.coupon.model.uploadSuccess' : 'member.coupon.model.uploadFailed',
        successed: res?.code === '0000',
      });
      this.memberManualUploadList = res.data || [];
    });
  };

  /**
   * 发送对象 - 下载会员名单模板
   */
  downloadTemplate() {
    this.appService.isContentLoadingSubject.next(true);
    this.api.step2DownloadUserTemplate().subscribe((isSuccess) => {
      this.appService.isContentLoadingSubject.next(false);
      this.appService.showToastSubject.next({
        msgLang: isSuccess ? 'member.coupon.model.downloadSuccessful' : 'member.coupon.model.downloadFailed',
        successed: isSuccess,
      });
    });
  }

  /**
   * 获取指定用户会员uids
   */
  getChannelPersonalUids(): ActivityQualificationsStep2ChannelPersonalUser[] {
    switch (this.formGroup.value!.channelPersonal!.inputType!) {
      // 会员选择
      case 0:
        return this.memberSelectedList.map((v) => ({ uid: v.uid, uact: v.name || v.uact }));
      // 手动输入
      case 1:
        return this.memberManualRemark
          .split(';')
          .filter((v) => v)
          .map((v) => ({ uid: v, uact: '' }));
      // 上传名单
      case 2:
        return this.memberManualUploadList;
      default:
        return [];
    }
  }

  /**
   * 打开选择上级弹窗
   * @param userType 用户类型(2=推荐上级/3=代理)
   * @param uids
   */
  async openSelectParent(userType: number, uids: FormControl) {
    const modal = this.modalService.open(SelectParentComponent, { width: '744px', disableClose: true });
    modal.componentInstance.userType = userType;
    modal.componentInstance.merchantId = this.tenantId;
    if (await !modal.result) return;

    uids.setValue([...new Set([...uids.value, ...((await modal.result) || [])])]);
    uids.updateValueAndValidity();
  }
}

@Component({
  selector: 'quality-view',
  template: '<quality [isView]="true"></quality>',
  standalone: true,
  imports: [QualityComponent],
})
export class QualityViewComponent {}
