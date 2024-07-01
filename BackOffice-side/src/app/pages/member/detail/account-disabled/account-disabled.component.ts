import { Component, EventEmitter, Input, OnInit, Output, WritableSignal, computed, signal } from '@angular/core';
import { AppService } from 'src/app/app.service';
import { MemberApi } from 'src/app/shared/api/member.api';
import { SelectApi } from 'src/app/shared/api/select.api';
import { MatModalRef } from 'src/app/shared/components/dialogs/modal';
import { MemberService } from '../../member.service';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { ModalFooterComponent } from 'src/app/shared/components/dialogs/modal/modal-footer.component';
import { DefaultDirective } from 'src/app/shared/components/upload/default.directive';
import { UploadComponent } from 'src/app/shared/components/upload/upload.component';
import { SelectChildrenDirective, SelectGroupDirective } from 'src/app/shared/directive/select.directive';
import { TimeCompoentComponent } from '../overview/time-compoent/time-compoent.component';
import { FormsModule } from '@angular/forms';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { NgIf, NgFor, KeyValuePipe } from '@angular/common';
import { ModalTitleComponent } from 'src/app/shared/components/dialogs/modal/modal-title.component';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { ProviderGroupItem } from 'src/app/shared/interfaces/select.interface';
import { ActivityInfo } from 'src/app/shared/interfaces/member.interface';
import { AttrDisabledDirective } from 'src/app/shared/directive/d-disabled.directive';
import { combineLatest } from 'rxjs';
import { RiskApi } from 'src/app/shared/api/risk.api';

@Component({
  selector: 'app-account-disabled',
  templateUrl: './account-disabled.component.html',
  styleUrls: ['./account-disabled.component.scss'],
  standalone: true,
  imports: [
    ModalTitleComponent,
    NgIf,
    FormRowComponent,
    FormsModule,
    TimeCompoentComponent,
    SelectChildrenDirective,
    SelectGroupDirective,
    NgFor,
    UploadComponent,
    DefaultDirective,
    ModalFooterComponent,
    LangPipe,
    KeyValuePipe,
    AttrDisabledDirective,
  ],
})
export class AccountDisabledComponent implements OnInit {
  constructor(
    public modal: MatModalRef<AccountDisabledComponent>,
    public appService: AppService,
    private memberService: MemberService,
    private selectApi: SelectApi,
    private api: MemberApi,
    public lang: LangService,
    private riskApi: RiskApi
  ) {}

  @Input() isAllow: any;
  @Input() tenantId: any;
  @Input() uid: any;
  @Input() userDetailsInfo: any;

  @Output() accDisabledSuccess = new EventEmitter();

  isLoading = false;

  /**登录开启 */
  enable: any = false;

  /**登录时间控制 */
  loginTime: any = {
    allowTimeType: 'lifelong',
    time: '',
    name: 'loginTime',
  };

  /**游戏时间 */
  gameTime: any = { allowTimeType: 'lifelong', time: '', name: 'gameTime' };

  /**支付时间 */
  payTime: any = { allowTimeType: 'lifelong', time: '', name: 'payTime' };

  /**红利时间 */
  // activityTime: any = { allowTimeType: '', time: '', name: 'activityTime' };

  /**游戏厂商 - 数据 */
  providerList: ProviderGroupItem[] = [];
  /**游戏厂商 - 勾选：全部参数 */
  allchecked = { name: '全部', lang: 'common.all', checked: false };

  /**支付方式禁用上传图片 */
  image = '';
  /**存款列表 */
  depositList = [
    { name: '法币', checkd: false, lang: 'member.overview.fiatCurrency', type: 'Legal' },
    { name: '信用卡买币', checkd: false, lang: 'member.overview.cradBuyCoins', type: 'BankCard' },
  ];

  /**提款列表 */
  withdrawalList = [
    { name: '法币', checkd: false, lang: 'member.overview.fiatCurrency', type: 'Legal' },
    { name: '加密货币', checkd: false, lang: 'member.overview.cryptocurrency', type: 'Encryption' },
  ];

  /** 禁用备注信息 */
  disabledRemark = '';

  /** 被禁止的列表 */
  forbidActivityCodes: WritableSignal<{
    [key: string]: Array<{
      activityCode: string;
      displayName: string;
      isBlocked: boolean;
    }>;
  }> = signal({
    R1: [],
    R2: [],
    R3: [],
    R4: [],
    R5: [],
  });

  renderForidActivityCodes = computed(() => {
    if (Object.values(this.forbidActivityCodes()).filter((item) => item.length > 0).length) {
      return this.forbidActivityCodes();
    }
    return null;
  });

  renderForbidKeys = computed(() => Object.keys(this.forbidActivityCodes()));

  /** 风控级别 */
  riskLevel = '';

  /** getters */
  /** 游戏内容数组是否有至少一个被选中 */
  get providerListSelcted() {
    return this.providerList
      .map((v) => v.providers)
      .flat(Infinity)
      .some((item) => item?.checked);
  }

  get payListSelcted() {
    const list = [...this.depositList, ...this.withdrawalList];
    return list.some((item) => item.checkd);
  }

  ngOnInit() {
    /** 支付方式数据 */
    this.payInit(this.userDetailsInfo.paymentInfo);

    /** 禁用登陆初始化数据 */
    this.loginInit(this.userDetailsInfo);

    /** 结束 */
    this.onInit(this.userDetailsInfo.gameInfo, this.userDetailsInfo.activityInfo);

    // this.getForbidActivityCodes(this.userDetailsInfo.activityInfo);
  }

  /** 支付方式初始化 */
  payInit(list) {
    if (this.lapseTime(list?.endTime)) {
      this.depositList.forEach((e) => (e.checkd = false));
      this.withdrawalList.forEach((e) => (e.checkd = false));
      this.payTime.allowTimeType = 'lifelong';
      this.payTime.time = '';
      return;
    }
    /** 存款数组 */
    for (const item of this.depositList) {
      if (list.depositType.includes(item.type)) {
        item.checkd = true;
      } else {
        item.checkd = false;
      }
    }
    /** 提款数组 */
    for (const item of this.withdrawalList) {
      if (list.withdrawType.includes(item.type)) {
        item.checkd = true;
      } else {
        item.checkd = false;
      }
    }
    if (list.isForever) {
      this.payTime.allowTimeType = 'lifelong';
    } else {
      this.payTime.allowTimeType = 'specify';
      this.payTime.time = [new Date(list.startTime), new Date(list.endTime)];
    }
    this.image = list.fileUrl;
  }

  onInit(list, activityInfo: ActivityInfo | null) {
    this.riskLevel = this.userDetailsInfo?.riskControl || '';
    this.loading(true);
    combineLatest([
      this.selectApi.getProviderGroupSelect({ tenantId: this.tenantId, gameStatue: 'Online' }),
      this.api.getForbidActivityCodes(),
      this.riskApi.getRiskControlConfig({ tenantId: this.tenantId }),
    ]).subscribe(([providerList, data, config]) => {
      this.loading(false);
      if (Object.values(config).filter((item) => Number(item.activityCodes?.length || 0) > 0).length && data.length) {
        this.forbidActivityCodes.update((item) => {
          const result = {
            ...item,
            R1:
              data?.map((list) => ({
                ...list,
                isBlocked: config.r1.activityCodes?.find((code) => code === list.activityCode) ? true : false,
              })) || [],
            R2:
              data?.map((list) => ({
                ...list,
                isBlocked: config.r2.activityCodes?.find((code) => code === list.activityCode) ? true : false,
              })) || [],
            R3:
              data?.map((list) => ({
                ...list,
                isBlocked: config.r3.activityCodes?.find((code) => code === list.activityCode) ? true : false,
              })) || [],
            R4:
              data?.map((list) => ({
                ...list,
                isBlocked: config.r4.activityCodes?.find((code) => code === list.activityCode) ? true : false,
              })) || [],
            R5:
              data?.map((list) => ({
                ...list,
                isBlocked: config.r5.activityCodes?.find((code) => code === list.activityCode) ? true : false,
              })) || [],
          };
          if (!activityInfo) {
            result[this.riskLevel] =
              data?.map((list) => ({
                ...list,
                isBlocked: false,
              })) || [];
          } else {
            result[this.riskLevel] =
              data?.map((list) => {
                if (activityInfo?.activityCode?.includes(list.activityCode)) {
                  return {
                    ...list,
                    isBlocked: true,
                  };
                }
                return {
                  ...list,
                  isBlocked: false,
                };
              }) || [];
          }
          return result;
        });
      }

      this.providerList = providerList;

      if (this.lapseTime(list?.endTime)) {
        this.gameTime.allowTimeType = 'lifelong';
        this.gameTime.time = '';
        return;
      }

      /** 禁用游戏初始化数据 */
      this.providerList
        .map((v) => v?.providers)
        .flat(Infinity)
        .forEach((e) => {
          e.checked = (list?.gameCode || []).includes(e?.providerCatId);
        });

      /** 判断数据是否为空 */
      if (list) {
        this.gameTime.allowTimeType = list?.isForever ? 'lifelong' : 'specify';
        /** 非终生禁用进行赋值操作 */
        if (!list.isForever) {
          this.gameTime.time = [new Date(list?.startTime), new Date(list?.endTime)];
        }
      }
    });
  }

  /** 登录方式初始化 */
  loginInit(info) {
    if (this.lapseTime(info?.endTime)) {
      this.enable = false;
      this.loginTime.allowTimeType = 'lifelong';
      this.loginTime.time = '';
      return;
    }
    this.loginTime.allowTimeType = info.isForever ? 'lifelong' : 'specify';
    this.enable = info.statusCode === 'Disable';
    if (!info.isForever) {
      if (info.startTime && info.endTime) {
        this.loginTime.time = [new Date(info.startTime), new Date(info.endTime)];
      }
    }
  }

  confirm() {
    if (!this.disabledRemark) {
      // 备注为必填项
      return this.appService.showToastSubject.next({ msgLang: 'risk.fillRemarks' });
    }

    if (!this.riskLevel) {
      // 请选择风控级别
      return this.appService.showToastSubject.next({ msgLang: 'member.overview.riskLevelTips' });
    }

    if (this.loginTime.allowTimeType != 'lifelong' && this.enable) {
      if (this.timeCheck(this.loginTime)) {
        return this.appService.showToastSubject.next({ msgLang: this.timeCheck(this.loginTime) });
      }
    }
    if (this.gameTime.allowTimeType != 'lifelong' && this.providerListSelcted) {
      if (this.timeCheck(this.gameTime)) {
        return this.appService.showToastSubject.next({ msgLang: this.timeCheck(this.gameTime) });
      }
    }
    if (this.payTime.allowTimeType != 'lifelong' && this.payListSelcted) {
      if (this.timeCheck(this.payTime)) {
        return this.appService.showToastSubject.next({ msgLang: this.timeCheck(this.payTime) });
      }
    }

    let params = {
      batchId: String(Date.now()),
      uid: this.uid,
      remark: this.disabledRemark,
      riskControl: this.riskLevel,
      ...this.loginDisableParams(),
      ...this.gameDisableParams(),
      ...this.payDisableParams(),
      ...this.forbidActivityCodeDisableParams(),
    };
    this.loading(true);
    this.api.prohibitionAll(params).subscribe((res) => {
      this.loading(false);

      const isSuccess = res === true;

      this.appService.showToastSubject.next({
        msgLang: isSuccess ? 'member.overview.disabledSuccessfully' : 'member.overview.disableFailed',
        successed: isSuccess,
      });

      if (isSuccess) {
        this.memberService.updateMember.next(); // 更新会员数据
        this.modal.close();
        this.accDisabledSuccess.emit();
      }
    });
  }

  /** 登录禁用 - 入参 */
  loginDisableParams() {
    /** 判断时间是否终身 */
    const isForbidLoginForever = this.loginTime.allowTimeType !== 'specify';

    return {
      isLoginEnabled: !this.enable,
      isForbidLoginForever,
      ...(this.loginTime.time[0]
        ? { forbidLoginStartTime: this.toDateStamp(this.loginTime.time[0]) }
        : { forbidLoginStartTime: 0 }),
      ...(this.loginTime.time[1]
        ? { forbidLoginEndTime: this.toDateStamp(this.loginTime.time[1]) }
        : { forbidLoginEndTime: 0 }),
    };
  }

  /** 游戏禁用 - 入参 */
  gameDisableParams() {
    /** 判断时间是否终身 */
    const isForbidGameForever = this.gameTime.allowTimeType !== 'specify';
    /** 获取选中的游戏厂商 */
    const gameCodes = this.providerList
      .map((v) => v.providers)
      .flat(Infinity)
      .filter((e) => e.checked)
      .map((e) => e.providerCatId);

    return {
      gameCodes,
      isForbidGameForever,
      ...(this.gameTime.time[0]
        ? { forbidGameStartTime: this.toDateStamp(this.gameTime.time[0]) }
        : { forbidGameStartTime: 0 }),
      ...(this.gameTime.time[1]
        ? { forbidGameEndTime: this.toDateStamp(this.gameTime.time[1]) }
        : { forbidGameEndTime: 0 }),
    };
  }

  /** 支付方式禁用 - 入参 */
  payDisableParams() {
    /** 判断时间是否终身 */
    const isForbidPaymentForever = this.payTime.allowTimeType !== 'specify';

    // 被禁用的存款类型
    const depositType: string[] = [];
    for (const value of this.depositList) {
      if (value.checkd) depositType.push(value.type);
    }

    // 被禁用的提款类型
    const withdrawType: string[] = [];
    for (const value of this.withdrawalList) {
      if (value.checkd) withdrawType.push(value.type);
    }

    return {
      depositType,
      withdrawType,
      isForbidPaymentForever,
      ...(this.payTime.time[0]
        ? { forbidPaymentStartTime: this.toDateStamp(this.payTime.time[0]) }
        : { forbidPaymentStartTime: 0 }),
      ...(this.payTime.time[1]
        ? { forbidPaymentEndTime: this.toDateStamp(this.payTime.time[1]) }
        : { forbidPaymentEndTime: 0 }),
      fileUrl: this.image,
    };
  }

  forbidActivityCodeDisableParams() {
    return {
      isForbidActivityForever: true,
      forbidActivityStartTime: 0,
      forbidActivityEndTime: 0,
      activityCodes:
        this.forbidActivityCodes()
          [this.riskLevel].filter((item) => item.isBlocked)
          .map((item) => item.activityCode) || [],
    };
  }

  /** 返回时间戳该页面不能使用固有this.toDateStamp方法 */
  toDateStamp(time) {
    return time.getTime();
  }

  /** 判断禁用时间是否小于当前时间 */
  lapseTime(time) {
    //判断时间是否为终身
    if (time === 0) {
      return false;
    }
    return (time || 0) < new Date().getTime();
  }

  /** 时间验证*/
  timeCheck(time): any {
    let fullTime = '';
    let thanTime = '';
    switch (time.name) {
      case 'loginTime':
        fullTime = 'member.overview.loginFullTimeTips';
        thanTime = 'member.overview.loginThanTimeTips';
        break;
      case 'gameTime':
        fullTime = 'member.overview.gameFullTimeTips';
        thanTime = 'member.overview.gameThanTimeTips';
        break;
      case 'payTime':
        fullTime = 'member.overview.payFullTimeTips';
        thanTime = 'member.overview.payThanTimeTips';
        break;

      default:
        break;
    }
    /** 判断时间是否选中 */
    if (!time.time[0] || !time.time[1]) {
      return fullTime;
    }
    /** 判断选中时间是否超过当前时间 */
    if (time.time[1]) {
      const slectTime: any = this.toDateStamp(time.time[1]);
      const currTime: any = this.toDateStamp(new Date());
      if (slectTime < currTime) {
        return thanTime;
      }
    }
  }

  /** 游戏交易 - 是否半选状态 */
  isIndeterminate(item: any): boolean {
    let hasChecked = false;
    let isAll = false;

    if (item.name !== '全部') {
      hasChecked = item['providers'].some((v) => v['checked']); // 有一个满足条件返还true
      isAll = item['providers'].every((v) => v['checked']); // 全部满足条件返还true
    } else {
      hasChecked = this.providerList.some((v) => v['providers'].some((j) => j['checked']));
      isAll = this.providerList.every((v) => v['providers'].every((j) => j['checked']));
    }

    item['checked'] = hasChecked;
    return hasChecked && !isAll;
  }

  /** 游戏交易 - 勾选全部 */
  checkItem(item: any) {
    if (!item) return;
    const val = item['checked'];
    if (item.providers && item.providers.length) {
      item.providers.forEach((v) => (v['checked'] = val));
    } else {
      this.providerList.forEach((v) => {
        v['checked'] = val;
        v.providers.forEach((j) => (j['checked'] = val));
      });
    }
  }

  /**
   * 修改 状态
   * @param key
   * @param activityCode
   * @param isBlocked
   */
  onChange(key: string, activityCode: string, isBlocked: boolean) {
    this.forbidActivityCodes.update((list) => ({
      ...list,
      [key]: list[key]?.map((item) => ({
        ...item,
        isBlocked: item.activityCode === activityCode ? isBlocked : item.isBlocked,
      })),
    }));
  }

  // 加载状态
  loading(v: boolean): void {
    this.isLoading = v;
    this.appService.isContentLoadingSubject.next(v);
  }
}
