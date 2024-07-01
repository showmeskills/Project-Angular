import { Component, OnInit } from '@angular/core';
import { SelectApi } from 'src/app/shared/api/select.api';
import { forkJoin, of, switchMap } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { AppService } from 'src/app/app.service';
import { ChannelApi } from 'src/app/shared/api/channel.api';
import BigNumber from 'bignumber.js';
import { catchError, tap } from 'rxjs/operators';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { CurrencyRateAndRange, MainChannelSupportCurrency, PaymentMethod } from 'src/app/shared/interfaces/channel';
import { LocalStorageService } from 'src/app/shared/service/localstorage.service';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { InputFloatDirective } from 'src/app/shared/directive/input.directive';
import { MatTabsModule } from '@angular/material/tabs';
import { SelectDirective } from 'src/app/shared/directive/select.directive';
import { SelectGroupComponent } from 'src/app/shared/components/select-group/select-group.component';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { MatOptionModule } from '@angular/material/core';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { NgIf, NgFor, JsonPipe, AsyncPipe } from '@angular/common';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { cloneDeep } from 'lodash';
import { SubHeaderService } from 'src/app/_metronic/partials/layout/subheader/subheader1/sub-header.service';
import { ConfirmModalService } from 'src/app/shared/components/dialogs/confirm-modal/confirm-modal.service';
import { SearchDirective, SearchInpDirective } from 'src/app/shared/directive/search.directive';
@Component({
  selector: 'channel-edit',
  templateUrl: './channel-sub-edit.component.html',
  styleUrls: ['./channel-sub-edit.component.scss'],
  standalone: true,
  imports: [
    FormRowComponent,
    NgIf,
    MatFormFieldModule,
    MatSelectModule,
    FormsModule,
    NgFor,
    MatOptionModule,
    AngularSvgIconModule,
    SelectGroupComponent,
    SelectDirective,
    MatTabsModule,
    InputFloatDirective,
    LangPipe,
    JsonPipe,
    AsyncPipe,
    SearchDirective,
    SearchInpDirective,
  ],
  host: {
    '[class.channel-card]': `isAdd`,
  },
})
export class ChannelSubEditComponent implements OnInit {
  constructor(
    private router: Router,
    private selectApi: SelectApi,
    private appService: AppService,
    private api: ChannelApi,
    private activatedRoute: ActivatedRoute,
    public lang: LangService,
    public ls: LocalStorageService,
    private subHeaderService: SubHeaderService,
    private confirmModalService: ConfirmModalService
  ) {
    const { id } = activatedRoute.snapshot.params;
    this.id = id;
  }

  paymentList: PaymentMethod[] = []; // 币种标签
  channelList: any[] = []; // 主渠道列表
  supportPayList: any[] = []; // 币种支持支付方式列表
  payListSource: MainChannelSupportCurrency; // 币种支持支付方式列表_源数据
  currencies: any[] = []; // 币种列表
  curTab = 0; // 当前tab索引
  id = ''; // 编辑所用id
  detail: any[] = []; // 币种详情数据
  rateAndRangeList: CurrencyRateAndRange[] = [];

  showSelect = false; // 商户选择显示

  EMPTY = {
    merchantIds: [] as number[], // 商户配置
    subChannelName: '', // 子渠道名
    channelId: '', // 主渠道下拉
    merchantAccountApiSettings: '', // 渠道信息
  };

  data = cloneDeep(this.EMPTY);

  private _merchantList: any[] = [];
  vipLevelList: Array<number> = [...[...new Array(125)].map((e, i) => i), 999999];

  get merchantList(): any[] {
    return this._merchantList;
  }

  set merchantList(v) {
    this.data.merchantIds = []; // 联动关系 赋值进行清空
    this._merchantList = v;
  }

  get isEdit(): boolean {
    return !!this.id;
  }

  get isAdd(): boolean {
    return !this.id;
  }

  get currency() {
    return this.currencies.filter((e) => this.supportPayList.some((j) => j.currency === e.code));
  }

  get currencyValue() {
    return this.currency[this.curTab] || {};
  }

  get curSupport() {
    return this.supportPayList.find((e) => e.currency === this.currencyValue.code);
  }

  get curChannel() {
    return this.channelList.find((e) => e.code === this.data.channelId) || {};
  }

  get channelName(): string {
    return this.curChannel?.name || '';
  }

  /**
   * 是否为虚拟币
   *  商户：
   *   1. 虚拟币只能添加一个
   *   2. 编辑模式下不能修改
   */
  get isDigital() {
    return this.curChannel.category === 'Coin';
  }

  /** 已选的商户列表 */
  get curMerchantList() {
    return this.merchantList.filter((e) => this.data.merchantIds.includes(e.id));
  }

  /** 已选商户名 多个逗号拼接 */
  get merchantName(): string {
    return this.curMerchantList.map((e) => e.name).join(', ');
  }

  ngOnInit(): void {
    this.appService.isContentLoadingSubject.next(true);
    forkJoin([
      this.api.getAllChannels(),
      this.selectApi.goMoneyGetCurrencies(),
      this.selectApi.goMoneyGetMerchant(),
      this.selectApi.goMoneyGetPaymentMethods(),
      this.isEdit ? this.api.getSubChannelConfig(this.id).pipe(catchError(() => of(null))) : of(null),
      this.isEdit ? this.api.getSubChannelMerchantInfo(this.id).pipe(catchError(() => of(null))) : of(null),
    ]).subscribe(([channelAll, currencies, merchant, payment, detail, merchantInfo]) => {
      this.appService.isContentLoadingSubject.next(false);
      this.channelList = channelAll;
      this.currencies = currencies;
      this.merchantList = merchant;
      this.paymentList = payment;
      this.loadDetail(detail);
      this.processSettings(merchantInfo);

      this.isEdit && this.updateData({ ...detail, ...merchantInfo });
    });
  }

  loadDetail(detail: any): void {
    if (!detail || this.isAdd) return;
    this.detail = detail?.details || [];
  }

  /**
   * setting
   */
  processSettings(detail: any) {
    if (!detail) return;

    if (detail?.merchantIds?.length) {
      this.data.merchantIds = detail.merchantIds;
      // this.updateVipList();
    }

    detail.channelName && (this.data.subChannelName = detail.channelName);
    this.data.merchantAccountApiSettings = detail.merchantAccountApiSettings
      ? JSON.stringify(detail.merchantAccountApiSettings)
          .replace(/","/g, '",\n  "')
          .replace(/":"/g, '": "')
          .replace(/(?<!"){"/g, '{\n  "')
          .replace(/(?<!\\)"}/g, '"\n}')
      : '';
  }

  /** 编辑时更新数据 回显 */
  updateData(data: any): void {
    if (!data) return;

    const { merchantIds, channelId, channelName } = data || {};

    this.data.channelId = channelId || '';
    this.data.subChannelName = channelName || '';

    channelId && this.onChannel();

    if (merchantIds?.length) {
      this.data.merchantIds = merchantIds; // 等上面请求清空完 这里再赋值回去
      // this.updateVipList();
    }
  }

  /** 渠道选择 */
  onChannel(): void {
    this.data.merchantIds = [];
    // this.updateVipList();

    this.appService.isContentLoadingSubject.next(true);
    this.getPayMethods$().subscribe(() => {
      this.appService.isContentLoadingSubject.next(false);
    });
  }

  /** 获取所支持的支付方式 */
  getPayMethods$() {
    return this.api.getChannelSupport(this.data.channelId).pipe(
      tap((payList) => {
        this.curTab = 0;
        this.payListSource = payList;
      }),
      switchMap(() => this.getRateAndRange$()),
      tap((res) => {
        this.rateAndRangeList = res;
        this.setPayList();
      })
    );
  }

  /** 设置支付列表数据 */
  setPayList(): void {
    this.supportPayList = this.countCurrency(this.payListSource);
  }

  countCurrency(data: any): any[] {
    if (!data) return [];

    return [
      ...new Set([
        ...Object.keys(data.supportedDepositPaymentMethods || {}),
        ...Object.keys(data.supportedWithdrawalPaymentMethods || {}),
      ]),
    ].map((key) => {
      let curData = this.detail.find((e) => e.currency === key);

      if (!curData) {
        curData = {
          isDigital: this.curChannel.category === 'Coin',
          balanceDetails: [],
        };
      }

      const curRateAndRange = this.rateAndRangeList.find((e) => e.currency === key);

      return {
        currency: key,
        deposit:
          data.supportedDepositPaymentMethods[key]?.map((method) => ({
            isDigital: curData.isDigital,
            singleOrderMinimum: curRateAndRange?.depositMin,
            singleOrderMaximum: curRateAndRange?.depositMax,
            ...this.getCurrencyData(method, 'Deposit'),
            ...curData?.balanceDetails.find((e) => e.paymentCategory === 'Deposit' && e.paymentMethod === method),
          })) || [],
        withdrawal:
          data.supportedWithdrawalPaymentMethods[key]?.map((method) => ({
            isDigital: curData.isDigital,
            singleOrderMinimum: curRateAndRange?.withdrawMin,
            singleOrderMaximum: curRateAndRange?.withdrawMax,
            ...this.getCurrencyData(method, 'Withdraw'),
            ...curData?.balanceDetails.find((e) => e.paymentCategory === 'Withdraw' && e.paymentMethod === method),
          })) || [],
      };
    });
  }

  getCurrencyData(code: string, category: string): object {
    if (code === 'Overview') {
      // 总览enable 为true
      return {
        name: this.lang.isLocal ? '总览' : 'Overview',
        paymentCategory: 'Deposit',
        paymentMethod: code,
        isEnable: true,
      };
    }

    return {
      name: this.paymentList.find((e) => e.code === code)?.name || '',
      paymentMethod: code,
      paymentCategory: category,
    };
  }

  back(): void {
    this.router.navigate(['/money/subChannel']);
  }

  onSubmit(single?: boolean) {
    // if (!this.data.channelId)
    //   return this.appService.showToastSubject.next({ msgLang: 'payment.subChannel.selectMainChannel' });
    // if (!this.data.merchantIds.length)
    //   return this.appService.showToastSubject.next({ msgLang: 'payment.subChannel.selectMerchant' });
    // if (!this.data.subChannelName)
    //   return this.appService.showToastSubject.next({ msgLang: 'payment.subChannel.fillSubChannelName' });

    let detail: any[] = this.supportPayList;

    // 货币的单次提交
    if (single) {
      detail = [this.curSupport];
    }

    detail = detail.map((e) => {
      e = { ...e };
      e.paymentMethod = [...e.deposit, ...e.withdrawal].map((j) => ({
        isEnable: j.isEnable,
        isForcingGrabOrder: j.isForcingGrabOrder, // felix: 提款方式(withdrawal) - 是否强制获取
        paymentCategory: j.paymentCategory,
        paymentMethod: j.paymentMethod,
        balanceMaximumLimit: ['', null].includes(j.balanceMaximum) ? null : +j.balanceMaximum,
        balanceMinimumLimit: ['', null].includes(j.balanceMinimum) ? null : +j.balanceMinimum,
        singleDayLimit: ['', null].includes(j.singleDayLimit) ? null : +j.singleDayLimit,
        singleOrderMinLimit: +j.singleOrderMinimum || 0,
        singleOrderMaxLimit: +j.singleOrderMaximum || 0,
        singleDayLimitThreshold: +j.singleDayLimitThreshold || 0,
        feeRate: new BigNumber(+j.feeRate).div(100).toNumber() || 0,
        vipLevelLimit: +j.vipLevelLimit || 0,
      }));
      delete e.deposit;
      delete e.withdrawal;
      return e;
    });

    let apiSettings = undefined;
    try {
      if (this.isAdd) {
        apiSettings = JSON.parse(this.data.merchantAccountApiSettings);
      }
    } catch (e) {
      console.error(e);
    }

    this.appService.isContentLoadingSubject.next(true);
    this.api[this.isAdd ? 'addSubChannel' : 'updateSubChannel']({
      ...(this.isEdit ? { channelAccountId: this.id } : {}),
      channelId: this.data.channelId,
      merchantIds: this.data.merchantIds,
      channelAccountAlias: this.data.subChannelName,
      apiSettings, // 取当前的子渠道信息 后台说明每条都是一致的
      detail,
    }).subscribe(async (res) => {
      this.appService.isContentLoadingSubject.next(false);

      if (res === true || typeof res === 'string') {
        // 新增提交之后没有id不能做刷新 这里统一都返回到列表
        this.appService.toastOpera(true);

        if (this.isAdd) return this.back();

        // 停留当前页面进行更新当前数据
        if (this.isEdit) {
          this.updatePageData();

          // 返回id进行跳转到当前id的编辑页面
        } else if (typeof res === 'string') {
          return this.router.navigate(['/money/subChannel', res]);
        }
      } else {
        this.appService.toastOpera(false);
      }

      return void 0;
    });
  }

  updatePageData() {
    this.appService.isContentLoadingSubject.next(true);
    this.api.getSubChannelConfig(this.id).subscribe((res) => {
      this.appService.isContentLoadingSubject.next(false);
      this.loadDetail(res);
    });
  }

  onMerchantInfoSubmit() {
    try {
      const obj = JSON.parse(this.data.merchantAccountApiSettings);
      if (!Object.keys(obj).length)
        return this.appService.showToastSubject.next({
          msgLang: 'payment.subChannel.jsonFormat',
        });
    } catch (e) {
      return this.appService.showToastSubject.next({
        msgLang: 'payment.subChannel.jsonFormatCorrectly',
      });
    }

    if (this.isAdd) return this.onSubmit();

    this.appService.isContentLoadingSubject.next(true);
    this.api
      .updateSubChannelMerchantInfo({
        ...(this.isEdit ? { channelAccountId: this.id } : {}),
        channelId: this.data.channelId,
        merchantIds: this.data.merchantIds,
        channelAccountAlias: this.data.subChannelName,
        apiSettings: JSON.parse(this.data.merchantAccountApiSettings), // 取当前的子渠道信息 后台说明每条都是一致的
      })
      .subscribe((res) => {
        this.appService.isContentLoadingSubject.next(false);
        this.appService.toastOpera(res === true);
      });
  }

  /** 商户选择 */
  onSelectMerchant(sel): void {
    if (!this.isDigital && !sel.length)
      return this.appService.showToastSubject.next({ msgLang: 'payment.subChannel.selectOneMerchant' });

    const ids = sel.map((e) => e.id);
    const delIds = ids.length ? this.data.merchantIds.filter((id) => !ids.includes(id)) : this.data.merchantIds;
    const addIds = ids.filter((id) => !this.data.merchantIds.includes(id));

    // 如果是新增这里直接赋值
    if (this.isAdd) {
      this.data.merchantIds = sel.map((e) => e.id);
      return;
    }

    forkJoin([
      delIds.length ? this.deleteMerchants(delIds, true) : of(false),
      addIds.length ? this.addMerchants(addIds) : of(false),
    ]).subscribe(() => {
      this.appService.isContentLoadingSubject.next(false);
      // this.updateVipList();
    });
  }

  /** 新增商户和渠道的关联 */
  async addMerchants(merchantIds: number[]): Promise<any> {
    // 如果原来没有商户5，现在要新增提示他是否继续并重新设置VIP等级
    // if (
    //   !this.data.merchantIds.some((e) => this.subHeaderService.isMerchant5(e)) &&
    //   merchantIds.some((e) => this.subHeaderService.isMerchant5(e))
    // ) {
    //   const modal = this.confirmModalService.open('payment.subChannel.delMerchantResetVIPLimit');
    //   if ((await modal.result) !== true) return false;
    //   this.supportPayList.forEach((e) =>
    //     e.deposit.forEach((j) => {
    //       j.vipLevelLimit = 0;
    //     })
    //   );
    // }

    return new Promise((resolve) => {
      this.appService.isContentLoadingSubject.next(true);
      this.api.addChannelMerchants(this.id, merchantIds).subscribe((res) => {
        this.appService.isContentLoadingSubject.next(false);
        resolve(res);

        if (res === true) {
          this.data.merchantIds = this.data.merchantIds.concat(merchantIds);
          return;
        }

        this.appService.showToastSubject.next({ msgLang: 'common.operationFailed' });
      });
    });
  }

  /** 取消商户和渠道的关联 */
  async deleteMerchants(merchantIds: number[], skipCheck = false): Promise<any> {
    if (!skipCheck && this.data.merchantIds.length <= 1) {
      this.appService.showToastSubject.next({ msgLang: 'payment.subChannel.selectOneMerchant' });
      return false;
    }

    // 如果原来有商户5，现在要删除了提示他是否继续并重新设置VIP等级
    // if (
    //   this.data.merchantIds.some((e) => this.subHeaderService.isMerchant5(e)) &&
    //   merchantIds.some((e) => this.subHeaderService.isMerchant5(e))
    // ) {
    //   const modal = this.confirmModalService.open('payment.subChannel.delMerchantResetVIPLimit');
    //   if ((await modal.result) !== true) return false;
    //   // 重置VIP等级（商户5到商户1会缩小等级）
    //   this.supportPayList.forEach((e) =>
    //     e.deposit.forEach((j) => {
    //       j.vipLevelLimit = 0;
    //     })
    //   );
    // }

    const callback = () => {
      this.data.merchantIds = this.data.merchantIds.filter((id) => !merchantIds.includes(id));
    };

    if (this.isAdd) {
      callback();
      return true;
    }

    return new Promise((resolve) => {
      this.appService.isContentLoadingSubject.next(true);
      this.api.deleteChannelMerchants(this.id, merchantIds).subscribe((res) => {
        this.appService.isContentLoadingSubject.next(false);
        resolve(res);

        if (res === true) return callback();

        this.appService.showToastSubject.next({ msgLang: 'common.operationFailed' });
      });
    });
  }

  /** 打开商户选择 */
  openMerchantSelect() {
    if (!this.data.channelId)
      return this.appService.showToastSubject.next({ msgLang: 'payment.subChannel.selectMainChannel' });

    this.showSelect = true;
  }

  /**
   * 单笔限额 - 虚拟币同步所有网络
   * @param $event
   * @param item
   * @param list
   * @param field
   */
  onLimit($event: Event, item: any, list: any[], field: string) {
    if (!item.isDigital) return;
    list.forEach((e) => (e[field] = $event.target?.['value']));
  }

  getRateAndRange$() {
    if (!this.data.channelId || this.isEdit) return of([]);

    return this.api.getCurrencyRateAndRange(
      [
        ...new Set([
          ...Object.keys(this.payListSource.supportedDepositPaymentMethods),
          ...Object.keys(this.payListSource.supportedWithdrawalPaymentMethods),
        ]),
      ].join(',')
    );
  }

  /**
   * 更新VIP列表
   */
  updateVipList(): void {
    this.vipLevelList = this.data.merchantIds.some((e) => this.subHeaderService.isFiveMerchantFn(e))
      ? [...[...new Array(125)].map((e, i) => i), 999999]
      : [...[...new Array(11)].map((e, i) => i)];
  }
}
