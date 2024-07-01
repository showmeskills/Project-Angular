import { Component, Input, NgZone, OnDestroy, OnInit, signal, TemplateRef, ViewChild } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { finalize, Subject, switchMap, zip } from 'rxjs';
import { SelectApi } from 'src/app/shared/api/select.api';
import { AppService } from 'src/app/app.service';
import { takeUntil, tap } from 'rxjs/operators';
import { ChannelApi } from 'src/app/shared/api/channel.api';
import { SubHeaderService } from 'src/app/_metronic/partials/layout/subheader/subheader1/sub-header.service';
import { Router } from '@angular/router';
import { UploadChange } from 'src/app/shared/interfaces/upload';
import { MatModal } from 'src/app/shared/components/dialogs/modal';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { validatorNumberRequired } from 'src/app/shared/models/validator';
import { Clipboard } from '@angular/cdk/clipboard';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { LocalStorageService } from 'src/app/shared/service/localstorage.service';
import { PayService } from 'src/app/pages/proxy/approval/approval-apply/pay.service';
import { AssetDistributionComponent } from 'src/app/pages/proxy/approval/approval-apply/asset-distribution/asset-distribution.component';
import { PaymentApplyDetail, PaymentApplyType } from 'src/app/shared/interfaces/financial';
import {
  UploadComponent,
  UploadComponent as UploadComponent_1,
} from 'src/app/shared/components/upload/upload.component';
import {
  ImgViewerComponent,
  ImgViewerComponent as ImgViewerComponent_1,
} from 'src/app/shared/components/img-viewer/img-viewer.component';
import { PayChannelList, WithdrawalTypeEnum } from 'src/app/shared/interfaces/channel';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { FormatMoneyArrPipe, FormatMoneyPipe } from 'src/app/shared/pipes/big-number.pipe';
import { AssetDistributionComponent as AssetDistributionComponent_1 } from './asset-distribution/asset-distribution.component';
import { SearchDirective, SearchInpDirective } from 'src/app/shared/directive/search.directive';
import {
  InputFloatDirective,
  InputNumberDirective,
  InputTrimDirective,
} from 'src/app/shared/directive/input.directive';
import { MatTabsModule } from '@angular/material/tabs';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';

/**
 * 预约时间交叉验证
 * @param group {FormGroup}
 */
function validatorAppointmentTime(group: FormGroup) {
  if (!group.value.transferType) return null;
  const value = group.value.appointmentTime;

  if (!value) return { required: true }; // 必填
  if (+new Date(value) < Date.now()) return { lg: true }; // 大于当前时间

  return null;
}

@Component({
  selector: 'approval-apply',
  templateUrl: './approval-apply.component.html',
  styleUrls: ['./approval-apply.component.scss'],
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    FormRowComponent,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    NgFor,
    NgIf,
    AngularSvgIconModule,
    MatTabsModule,
    InputTrimDirective,
    SearchDirective,
    SearchInpDirective,
    InputNumberDirective,
    InputFloatDirective,
    UploadComponent_1,
    AssetDistributionComponent_1,
    ImgViewerComponent_1,
    AsyncPipe,
    FormatMoneyPipe,
    FormatMoneyArrPipe,
    LangPipe,
  ],
})
export class ApprovalApplyComponent implements OnInit, OnDestroy {
  constructor(
    public modal: MatModal,
    private router: Router,
    private selectApi: SelectApi,
    public appService: AppService,
    private channelApi: ChannelApi,
    private subHeader: SubHeaderService,
    private fb: FormBuilder,
    private clipboard: Clipboard,
    private zone: NgZone,
    public ls: LocalStorageService,
    public lang: LangService,
    public payService: PayService
  ) {}

  // 是否可编辑标签
  @Input() isEditTag = true;

  curApplyType = 0; // 提交方式索引
  get currencyListType() {
    return this.payService.currencyListType;
  }

  formGroup = this.fb.group({
    label: ['', Validators.required],
    time: this.fb.group(
      {
        transferType: [0],
        appointmentTime: [],
      },
      { validators: validatorAppointmentTime }
    ),
    description: [''],
  });

  /** 法币手动输入 */
  manualFiat = this.fb.group({
    channel: [''],
    currency: ['', Validators.required],

    list: this.fb.array([this.addManualFiat()]),
  });

  /** 数字货币手动输入 */
  manualDigital = this.fb.group({
    channel: ['', this.ls.isGB ? Validators.required : null],
    network: ['', Validators.required], // 转账网络
    currency: ['', Validators.required],

    list: this.fb.array([this.addManualDigital()]),
  });

  /** 法币批量 */
  fiatBatch = this.fb.group({
    excel: ['', Validators.required],
    list: [[] as any[]],
    channel: [''],
    paymentMethodId: [''],
  });

  /** 法币批量 */
  digitalBatch = this.fb.group({
    excel: ['', Validators.required],
    list: [[] as any[]],
    channel: ['', this.ls.isGB ? Validators.required : null],
    paymentMethodId: [''],
  });

  bankList: any[] = [];
  fiatManualBankList: any[] = []; // 法币手动输入 银行列表（会根据匹配所支持的银行）
  labelList: any[] = [];
  protected readonly _destroy$ = new Subject<void>();

  paste = '';
  searchGroup: any = {};
  isLoadingFiatBatch = false;
  isLoadingDigitalBatch = false;
  labelControl = new FormControl('', Validators.required);
  imgList: string[] = [];

  @ViewChild('fiatBatchBankErrorContinueTpl') fiatBatchBankErrorContinueTpl: TemplateRef<any>; // 法币分批部分可提交是否继续

  /** 法币手动输入列表 */
  get manualFiatList(): FormArray<FormGroup> {
    return this.manualFiat?.get('list') as FormArray<FormGroup>;
  }

  /** 虚拟币手动输入列表 */
  get manualDigitalList(): FormArray<FormGroup> {
    return this.manualDigital?.get('list') as FormArray<FormGroup>;
  }

  /** 是否数字货币 */
  get isDigital() {
    return this.payService.curCurrencyTab === 1;
  }

  /** 是否法币 */
  get isFiat() {
    return this.payService.curCurrencyTab === 0;
  }

  /** 是否换汇 */
  get isAssetDistribution() {
    return this.payService.curCurrencyTab === 2;
  }

  /** 是否手动 */
  get isManual() {
    return this.curApplyType === 0;
  }

  /** 是否批量 */
  get isBatch() {
    return this.curApplyType === 1;
  }

  /** 法币类型 */
  get currencyListFiat(): any[] {
    return this.payService.currencyList.filter((e) => !e.isDigital);
  }

  /** 虚拟币类型 */
  get currencyListDigital(): any[] {
    return this.payService.currencyList.filter((e) => e.isDigital);
  }

  /** 获取货币类型 */
  get getCurrencyType(): string {
    return this.currencyListType.find((e, i) => i === this.payService.curCurrencyTab)?.value;
  }

  /** 法币批量可用渠道 */
  get allowFiatBatchChannelList() {
    return this.payService.channelList.filter((e) => e.currency === this.fiatBatchExcelList[0]?.currency);
  }

  allowFiatBatchChannelListSignal = signal([] as PayChannelList[]);

  /** 虚拟币批量可用渠道 */
  get allowDigitalBatchChannelList() {
    return this.payService.channelList
      .filter((e) => e.currency === this.digitalBatchExcelList[0]?.['currency'])
      .filter((e) => e.channelId === 'GBPayCoin') // Marr：分批目前只有这个渠道;
      .filter((e) => e.paymentMethodId === this.digitalBatch.value.paymentMethodId); // 过滤支付方式-> 又名网络转账
  }

  allowDigitalBatchChannelListSignal = signal([] as PayChannelList[]);

  /** 手动输入根据币种匹配渠道/虚拟币为币种+网络 */
  get allowManualChannelList() {
    let res = this.payService.channelList?.filter((e) => e.currency === this.curManual?.value.currency) || [];

    // 手动输入虚拟货币匹配网络转账
    if (this.isDigital && this.isManual) {
      res = res.filter((e) => e.paymentMethodId === this.manualDigital.value.network);
    }

    return res;
  }

  allowManualDigitalChannelListSignal = signal([] as PayChannelList[]);

  /** 手动输入法币可用渠道列表 */
  get manualFiatChannelList() {
    return this.payService.channelList.filter((e) => e.currency === this.manualFiat?.value.currency);
  }

  manualFiatChannelListSignal = signal([] as PayChannelList[]);

  /** 法币批量excel数据列表 */
  get fiatBatchExcelList() {
    return this.fiatBatch.value.list || ([] as any[]);
  }

  /** 虚拟币批量excel数据列表 */
  get digitalBatchExcelList() {
    return this.digitalBatch.value.list || ([] as any[]);
  }

  /** 当前手动模式所选的子渠道 */
  get curSubChannel(): any {
    return this.allowManualChannelList.find((e) => e.channelAccountId === this.curManual?.get('channel')?.value);
  }

  /** 法币 - 分批模式所选的子渠道 */
  get curFiatBatchSubChannel(): any {
    return this.allowFiatBatchChannelList.find((e) => e.channelAccountId === this.curBatch?.get('channel')?.value);
  }

  /** 最小最大金额的限制 */
  get minMaxAmount(): { maxAmount: number; minAmount: number } {
    if (!this.allowManualChannelList.length) return { maxAmount: 0, minAmount: 0 };

    return this.curSubChannel
      ? this.curSubChannel
      : {
          // 如果自动分配，默认找可用列表中的最小和最大金额
          minAmount: Math.min(...(this.allowManualChannelList.map((e) => e.minAmount) as number[])),
          maxAmount: Math.max(...(this.allowManualChannelList.map((e) => e.maxAmount) as number[])),
        };
  }

  /** 当前手动输入 */
  get curManual(): FormGroup<any> | null {
    return (this.isFiat && this.manualFiat) || (this.isDigital && this.manualDigital) || null;
  }

  /** 当前批量 */
  get curBatch(): FormGroup<any> | null {
    return (this.isFiat && this.fiatBatch) || (this.isDigital && this.digitalBatch) || null;
  }

  /** 支付方式 */
  get paymentMethodId(): string | undefined {
    switch (this.getCurrencyType) {
      case 'Currency':
        return 'C2CBankTransfer'; // Marr: 法币只有C2C
      case 'Coin':
        if (this.isDigital && this.isBatch) {
          return this.curBatch?.value?.['paymentMethodId'];
        }

        return this.manualDigital.value.network as string;
      default:
        return undefined;
    }
  }

  /** 转账网络 */
  get networkList(): any[] {
    return this.payService.channelList.filter((e) => e.currency === this.manualDigital.value?.currency);
  }

  /** 时间表单 */
  get formGroupTime() {
    return this.formGroup.get('time') as FormGroup<any>;
  }

  /** 是否预约 */
  get isAppointment(): boolean {
    return !!this.formGroup.value.time.transferType;
  }

  /** 获取提款方式 */
  get selectMethod(): string {
    // Manual 手动     Batch 分批
    switch (this.curApplyType) {
      case 0:
        return 'Manual';
      case 1:
        return 'Batch';
      default:
        return '';
    }
  }

  /** lifeCycle */
  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  ngOnInit(): void {
    this.appService.isLoginSubject.next(true);
    zip(this.selectApi.getCurrencySelect(), this.selectApi.goMoneyGetBankList()).subscribe(([currency, bank]) => {
      this.appService.isLoginSubject.next(false);
      this.payService.currencyList = currency;
      this.bankList = bank;
    });

    // 指定渠道前处理
    this.subHeader.merchantId$
      .pipe(
        takeUntil(this._destroy$),
        tap(() => this.appService.isContentLoadingSubject.next(true)),
        switchMap((merchantId) => zip([this.channelApi.getSubChannelList({ merchantId }), this.getLabel$()]))
      )
      .subscribe(([channel]) => {
        this.appService.isContentLoadingSubject.next(false);
        this.formGroup.get('label')?.setValue('');

        if (!channel?.length) {
          this.appService.showToastSubject.next({
            msgLang: 'budget.NoListAvailable',
          });
        }

        this.channelInit();
      });
  }

  /** methods */
  /** 重置渠道 */
  channelInit(triggerType?: string): void {
    // 法币手动输入
    this.manualFiat
      .get('channel')
      ?.setValidators(!this.ls.isGB || this.manualFiatChannelList.length ? null : Validators.required);

    // 如果变动还有当前渠道就不改变 如果没有则设置为空的验证 自动分配子渠道为空字符串 这里给null
    if (!this.manualFiatChannelList?.some((e) => e.channelAccountId === this.manualFiat.get('channel')?.value)) {
      this.manualFiat.get('channel')?.reset(!this.ls.isGB || this.manualFiatChannelList.length ? '' : null);
    }

    this.manualFiatBankList();

    // 虚拟币手动输入
    const digitalSubChannelList = this.payService.channelList.filter(
      (e) => e.currency === this.manualDigital?.value.currency
    );
    const hasNetwork = digitalSubChannelList.some(
      (e) => e.paymentMethodId === this.manualDigital.get('network')?.value || e.channelId === 'GBPayCoin' // Marr：分批目前只有这个渠道
    );

    if (
      hasNetwork &&
      digitalSubChannelList.some((e) => e.channelAccountId === this.manualDigital.get('channel')?.value)
    ) {
      this.manualDigital.get('channel')?.setValidators(null);
    } else if (!hasNetwork) {
      this.manualDigital.get('network')?.reset('');
      this.manualDigital.get('channel')?.reset('');
    }

    // 法币批量 - 设置自动分配的校验
    this.fiatBatchBankCodeCheck();
    const fiatBatchChannel = this.fiatBatch.get('channel');
    // const preview = fiatBatchChannel?.value || '';
    // fiatBatchChannel?.patchValue(null);
    fiatBatchChannel?.setValidators(
      !this.ls.isGB || this.allowFiatBatchChannelList.length ? null : Validators.required
    );
    fiatBatchChannel?.updateValueAndValidity();
    // fiatBatchChannel?.patchValue(preview);

    // 手动法币 触发金额校验
    if (this.isFiat && !this.isBatch) {
      this.fiatAmountCheck();
    } else if (this.isDigital && !this.isBatch) {
      this.digitalAmountCheck();
    }

    // 法币批量
    if (this.isFiat && this.isBatch) {
      this.curBatch?.get('channel')?.setValue('');
    }

    // 虚拟币批量
    if (this.isDigital && this.isBatch) {
      this.curBatch?.get('channel')?.setValue('');
    }

    // 手动 - 法币 有选币种，无渠道弹出提示
    if (triggerType !== 'manualFiat') {
      this.fiatCurrencyChange();
    }
  }

  /** 手动输入法币改变 */
  fiatCurrencyChange(sel?: any): void {
    if (!(this.isFiat && !this.isBatch)) return;
    let value = sel?.value || undefined;

    if (value !== undefined) {
      this.manualFiat.get('currency')?.setValue(value); // 更新渲染其他类目的币种
      this.channelInit('manualFiat');
      this.manualFiat.get('channel')!.markAllAsTouched();
      this.fiatAmountCheck();
    }

    if (!this.allowManualChannelList.length && this.manualFiat.get('currency')?.value) {
      this.appService.showToastSubject.next({ msgLang: 'budget.noCurrencyChannels' });
    }

    // 更新匹配到的子渠道列表
    this.manualFiatChannelListSignal.update(() =>
      this.payService.channelListSignal().filter((e) => e.currency === this.manualFiat?.value.currency)
    );
  }

  /** 网络转账变动 */
  networkChange({ value }: MatSelectChange): void {
    this.digitalChannelChange();
    this.manualDigital.get('network')?.setValue(value); // 更新渲染其他类目的网络转账

    if (!this.allowManualChannelList?.some((e) => e.channelAccountId === this.manualDigital.get('channel')?.value)) {
      if (!this.allowManualChannelList.length) {
        this.manualDigital.get('channel')?.setValue('');
        this.appService.showToastSubject.next({
          msgLang: 'budget.noChannels',
        });
      } else {
        this.manualDigital
          .get('channel')
          ?.setValue(this.ls.isGB ? '' : this.allowManualChannelList[0]?.channelAccountId || '');
      }
    }

    this.digitalAmountCheck();
  }

  /** 虚拟币币种变动 */
  digitalCurrencyChange({ value }: MatSelectChange): void {
    this.digitalChannelChange();
    this.manualDigital.get('currency')?.setValue(value); // 更新渲染其他类目的币种

    if (!this.networkList.length) {
      this.manualDigital.get('network')?.setValue('');
      this.appService.showToastSubject.next({ msgLang: 'budget.noAvailableTransfer' });
      // 如果已选转账网络在可选转账网络中不做清空处理
    } else if (!this.networkList.some((e) => e.paymentMethodId === this.manualDigital.value.network)) {
      this.manualDigital.get('network')?.setValue('');
    }

    this.channelInit();
    this.digitalAmountCheck();
  }

  /**
   * 虚拟币手动输入 - 更新渠道可选列表
   */
  digitalChannelChange(): void {
    this.allowManualDigitalChannelListSignal.update(() => {
      let res = this.payService.channelListSignal().filter((e) => e.currency === this.curManual?.value.currency) || [];

      // 手动输入虚拟货币匹配网络转账
      if (this.isDigital && this.isManual) {
        res = res.filter((e) => e.paymentMethodId === this.manualDigital.value.network);
      }

      return res;
    });
  }

  /** 手动 - 法币金额校验 */
  fiatAmountCheck(): void {
    this.manualFiat.get('list')?.['controls']?.forEach((e) => e.get('amount').updateValueAndValidity());
  }

  /** 手动 - 虚拟币数量校验 */
  digitalAmountCheck(): void {
    this.manualDigital.get('list')?.['controls']?.forEach((e) => e.get('amount').updateValueAndValidity());
  }

  /** 输入限制采用渠道费用限制 - 实际金额限制 */
  amountBlur(control?: FormControl<string>): void {
    control?.updateValueAndValidity();
  }

  /** 金额范围控制 */
  validatorAmountRange(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (control === undefined || !Number(control?.value)) return null;

      let val = Number(control.value) || 0;

      // 最大最小限制
      // if (this.minMaxAmount.minAmount) val = Math.max(val, this.minMaxAmount.minAmount);
      // if (this.minMaxAmount.maxAmount) val = Math.min(val, this.minMaxAmount.maxAmount);
      if (this.minMaxAmount.minAmount && val < this.minMaxAmount.minAmount) {
        return { minAmount: true, limitRange: true };
      } else if (this.minMaxAmount.maxAmount && val > this.minMaxAmount.maxAmount) {
        return { maxAmount: true, limitRange: true };
      }

      // control.setValue(String(val));

      return null;
    };
  }

  /** 法币 - 指定子渠道选择 */
  subChannelFiatChange(): void {
    if (this.isBatch) {
      if (this.fiatBatchExcelList.length) {
        this.fiatBatch.get('list')?.markAllAsTouched();
      }

      this.fiatBatchBankCodeCheck();
    } else {
      // 选了币种重新校验列表数据
      if (this.manualFiat.get('currency')?.value) {
        this.manualFiatBankList();
      }
    }

    this.triggerAmountBlur();
  }

  /** 触发手动输入金额失去焦点 */
  triggerAmountBlur() {
    if (!this.isManual) return; // 不是手动输入 不需要处理

    if (this.isFiat) {
      this.manualFiatList.controls.forEach((e) => {
        this.amountBlur(e.get('amount') as FormControl<string>);
      });
    } else if (this.isDigital) {
      this.manualDigitalList.controls.forEach((e) => {
        this.amountBlur(e.get('amount') as FormControl<string>);
      });
    }
  }

  onSearch(key: string, kw: any): void {
    this.searchGroup[key] = kw ?? '';
  }

  /**
   * 获取标签
   */
  getLabel() {
    this.appService.isContentLoadingSubject.next(true);
    this.getLabel$().subscribe(() => this.appService.isContentLoadingSubject.next(false));
  }

  /**
   * 获取标签的流
   */
  getLabel$() {
    return this.selectApi.getDrawLabelList(+this.subHeader.merchantCurrentId).pipe(
      tap((label) => {
        this.labelList = label;
      })
    );
  }

  @ViewChild(AssetDistributionComponent) assetDistributionComponent?: AssetDistributionComponent;
  async onSubmit() {
    this.triggerAmountBlur();
    this.formGroup.markAllAsTouched(); // 手动执行验证
    this.manualFiat.markAllAsTouched();
    this.manualDigital.markAllAsTouched();
    this.fiatBatch.markAllAsTouched();
    this.digitalBatch.markAllAsTouched();
    this.assetDistributionComponent?.manual.markAllAsTouched(); // 手动换汇
    this.assetDistributionComponent?.batch.markAllAsTouched(); // 批量换汇

    if (this.formGroup.controls['label'].invalid)
      return this.appService.showToastSubject.next({ msgLang: 'budget.chooseLabel' });
    if (this.formGroup.invalid) return;

    // 组合参数
    const sendData = this.combineData();
    if (!sendData) return;

    this.appService.isContentLoadingSubject.next(true);
    this.channelApi
      .addWithdraw({
        merchantId: this.subHeader.merchantCurrentId,
        paymentMethodId: this.paymentMethodId,
        currencyCoinCategory: this.getCurrencyType,
        selectMethod: PaymentApplyType[this.curApplyType],
        withdrawTabId: this.formGroup.value.label,
        hasAppointment: this.isAppointment, // 是否预约
        appointmentTime: this.isAppointment ? +this.formGroup.value.time.appointmentTime : null, // 预约时间
        description: this.formGroup.value.description,
        imagePath: this.imgList,
        ...sendData, // 这里会覆盖以上的参数
      })
      .subscribe((res) => {
        this.appService.isContentLoadingSubject.next(false);

        if (res === true) {
          this.back();
          this.appService.showToastSubject.next({
            msgLang: 'budget.addSuc',
            successed: true,
          });
        } else {
          this.appService.showToastSubject.next({
            msgLang: 'budget.addFailed',
            successed: false,
          });
        }
      });
  }

  /** 组合参数 */
  private combineData(): any {
    const sendData: any = { transactionDetails: [] as PaymentApplyDetail[] };

    // 换汇
    if (this.isAssetDistribution) {
      if (!this.assetDistributionComponent) return console.warn('【换汇】component not found');
      if (this.assetDistributionComponent.isManual) {
        // 换汇 - 手动
        if (this.assetDistributionComponent.manual.invalid) return console.warn('【换汇 - 手动输入】form invalid');
        const assetDistribution = this.assetDistributionComponent.manual.value;

        sendData.channelAccountId = assetDistribution.channel;
        sendData.channelId = this.assetDistributionComponent.currentManualChannel?.channelId;
        sendData.paymentMethodId = this.assetDistributionComponent.currentManualChannel?.paymentMethodId;
        sendData.currency = assetDistribution.currency;
        sendData.transactionDetails = assetDistribution.list?.map((e) => ({
          exchangeCurrency: assetDistribution.exchangeCurrency, // 兑换币种
          exchangeNetwork: e.network, // 兑换网络
          txHash: e.hash, // 交易哈希
          exchangeMerchantId: e.merchantId, // 兑换商户
          exchangeRate: +e.exchangeRate! || 0, // 兑换汇率
          exchangeAmount: +e.exchangeAmount! || 0, // 若有换汇，则为换汇后的金额
          amount: +e.amount! || 0, // 若有换汇，则为换汇后的金额
        }));
      } else if (this.assetDistributionComponent.isBatch) {
        // 换汇 - 批量
        if (this.assetDistributionComponent.batch.invalid) return console.warn('【换汇 - 分批】form invalid');
        const assetDistribution = this.assetDistributionComponent.batch.value;

        sendData.channelAccountId = assetDistribution.channel;
        sendData.channelId = this.assetDistributionComponent.currentBatchChannel?.channelId;
        sendData.paymentMethodId = this.assetDistributionComponent.currentBatchChannel?.paymentMethodId;
        sendData.currency = assetDistribution.list?.[0]?.currency;
        sendData.transactionDetails = assetDistribution.list;
      }

      sendData.selectMethod = PaymentApplyType[this.assetDistributionComponent.curApplyType];

      return sendData;
    }

    /** 手动输入 */
    if (this.isManual) {
      // 法币手动输入
      if (this.isFiat) {
        if (this.manualFiat.invalid) return console.warn('【法币手动输入】form invalid');

        sendData.transactionDetails = this.manualFiatList.value.map((e) => ({
          bankAccountHolder: e.bankPerson?.trim(),
          bankName: e.bankName?.trim(),
          bankCode: e.bankCode?.trim(),
          bankAccountNumber: e.bankCard?.trim(),
          presetAmount: e.amount,
          amount: e.amount,
          channelFee: 0,
          integrals: e.integral || 0,
        }));

        sendData.channelId = this.curSubChannel?.channelId || undefined;
        sendData.channelAccountId = this.manualFiat.value.channel || undefined;
        sendData.currency = this.manualFiat.value.currency;

        // 数字货币手动输入
      } else if (this.isDigital) {
        if (this.manualDigital.invalid) return console.warn('【数字货币手动输入】form invalid');

        sendData.transactionDetails = this.manualDigitalList.value.map((e) => ({
          bankAccountNumber: e.bankNum?.trim(),
          presetAmount: e.amount,
          amount: e.amount,
          channelFee: 0,
          // integrals: e.integral === '' ? 300 : e.integral,
        }));

        sendData.channelId = this.curSubChannel?.channelId || undefined;
        sendData.channelAccountId = this.manualDigital.value.channel || undefined;
        sendData.currency = this.manualDigital.value.currency;
      }
    } else if (this.isBatch) {
      /** 分批提款 */
      if (this.isDigital) {
        if (!this.digitalBatchExcelList.length)
          return this.appService.showToastSubject.next({ msgLang: 'budget.noBulkData' });
        if (this.digitalBatch.invalid) return console.warn('【数字货币分批提款】form invalid');

        sendData.currency = this.digitalBatchExcelList[0]?.currency;

        sendData.transactionDetails = this.digitalBatchExcelList.map((e: any) => ({
          ...e,
          channelFee: 0, // 渠道手续费
          amount: e.presetAmount || 0, // 实际提现金额
          ...(e.address ? { bankAccountNumber: e.address.trim() || '' } : {}), // 虚拟币情况赋值地址
        })); // 分批详情数据
        sendData.channelId =
          this.allowDigitalBatchChannelList.find((e) => e.channelAccountId === this.digitalBatch.value.channel)
            ?.channelId || undefined;
        sendData.channelAccountId = this.digitalBatch.value.channel || undefined;
      } else if (this.isFiat) {
        // 法币
        const { invalidBank } = this.fiatBatchBankCodeCheck();
        if (invalidBank) return console.warn('【法币提款】bank code invalid');

        if (!this.fiatBatchExcelList.length)
          return this.appService.showToastSubject.next({ msgLang: 'budget.noBulkData' });
        if (this.fiatBatch.invalid) return;

        sendData.currency = this.fiatBatchExcelList[0]?.currency;
        sendData.transactionDetails = this.fiatBatchExcelList.map((e: any) => ({
          ...e,
          channelFee: 0, // 渠道手续费
          amount: e.presetAmount || 0, // 实际提现金额
        })); // 分批详情数据
        sendData.channelId =
          this.allowFiatBatchChannelList.find((e) => e.channelAccountId === this.fiatBatch.value.channel)?.channelId ||
          undefined;
        sendData.channelAccountId = this.fiatBatch.value.channel || undefined;
      }
    }

    return sendData;
  }

  /** 上传分批excel流请求 - 法币 */
  uploadExcelFiat = (file) =>
    this.channelApi.withdrawExcelParseFiat(file, {
      reportProgress: true,
      observe: 'events',
    });

  /** 上传分批excel流请求 - 虚拟币 */
  uploadExcelDigital = (file) =>
    this.channelApi.withdrawExcelParseDigital(file, {
      reportProgress: true,
      observe: 'events',
    });

  /** 上传excel回调 */
  async onUploadChange({ upload }: UploadChange, batchGroup, isDigital = true) {
    if (upload?.state !== 'DONE') return;

    // 以下只能通过 batchGroup 的形参来匹配，因可能上传中被切换tab会造成判断不准确的情况

    // 闭包一手避免再次执行污染形参
    ((isDigital) => {
      this.isDigital && (this.isLoadingFiatBatch = true);
      !this.isDigital && (this.isLoadingDigitalBatch = true);
      setTimeout(async () => {
        this.isDigital && (this.isLoadingFiatBatch = false);
        !this.isDigital && (this.isLoadingDigitalBatch = false);

        const res = Array.isArray(upload.body) ? upload.body : [];

        if (!res.length) {
          this.appService.showToastSubject.next({
            msg: (await this.lang.getOne('budget.parseError')) + ' ' + (upload.body?.detail || ''),
          });

          batchGroup.get('excel')?.setValue('');
          batchGroup.get('list')?.setValue([]);
          batchGroup.get('paymentMethodId')?.setValue('');
        } else {
          batchGroup.get('list')?.setValue(
            res.map((e) => {
              e.presetAmount = e.amount; // 存储预设金额
              e.address = e.address?.trim() || '';
              e.bankAccountHolder = e.bankAccountHolder?.trim() || '';
              e.bankCode = e.bankCode?.trim() || '';
              e.bankName = e.bankName?.trim() || '';
              e.bankAccountNumber = e.bankAccountNumber?.trim() || '';

              return e;
            })
          );
          batchGroup.get('paymentMethodId')?.setValue(res[0].paymentMethodId);
          this.updateDigitalBatchChannelList();
          this.updateFiatBatchChannelList();

          const list = isDigital ? this.allowDigitalBatchChannelList : this.allowFiatBatchChannelList;

          if (!list.length) {
            this.appService.showToastSubject.next({ msgLang: `budget.noChannelAvailable` });
          }

          batchGroup.get('channel')?.setValue('');

          // 重置渠道以及校验
          this.channelInit();
        }
      }, 1);
    })(isDigital);
  }

  /** 更新虚拟币批量 - 子渠道列表 */
  updateDigitalBatchChannelList(): void {
    this.allowDigitalBatchChannelListSignal.update(() => this.allowDigitalBatchChannelList);
  }

  /** 更新法币批量 - 子渠道列表 */
  updateFiatBatchChannelList(): void {
    this.allowFiatBatchChannelListSignal.update(() => this.allowFiatBatchChannelList);
  }

  /** 法币手动输入 - 银行列表过滤 */
  manualFiatBankList() {
    const { isCheckBank, bankList: supportBank } = this.fiatSupportBank(
      this.curSubChannel,
      this.allowManualChannelList
    );

    if (isCheckBank) {
      this.fiatManualBankList = supportBank;

      // 判断是否情况当前所选银行
      this.manualFiat.get('list')?.['controls'].forEach((e) => {
        const control = e.get('bankCode') as FormControl;

        // 如果不支持的银行，直接置空
        if (!supportBank.some((e) => e.bankCode === control.value)) {
          control.patchValue('');
          control.updateValueAndValidity();
          this.onFiatManualBankChange({ value: '' }, control);
        }
      });
    } else {
      this.fiatManualBankList = this.bankList;
    }
  }

  /** 获取法币 - 所支持的银行 */
  fiatSupportBank(curSubChannel: any, subChannelList: any[]): { isCheckBank: boolean; bankList: any[] } {
    const isCheckBank: boolean =
      curSubChannel?.isCheckBankCode || (!!subChannelList.length && !subChannelList.some((e) => !e.isCheckBankCode)); // 是否需要校验（如果有一个渠道不需要校验可以直接提交）

    let bankList: any[] = this.bankList;

    if (isCheckBank) {
      const supportBankCode =
        curSubChannel?.bankCodes ||
        subChannelList.reduce((t, c) => [...new Set([...t, ...(c?.bankCodes || [])])], []) ||
        [];

      bankList = this.bankList.filter((e) => supportBankCode.includes(e.bankCode));
    }

    return { isCheckBank, bankList };
  }

  /** 法币分批 - 校验银行 */
  fiatBatchBankCodeCheck(): { invalidBank: boolean; invalidBankNameList?: any[]; validBankList?: any[] } {
    if (!(this.isFiat && this.isBatch)) return { invalidBank: false };

    // 校验批量的银行
    const fiatBatch = this.fiatBatch.get('list') as AbstractControl<any, any>;
    if (!fiatBatch?.value?.length) return { invalidBank: false };

    const { isCheckBank, bankList: supportBank } = this.fiatSupportBank(
      this.curFiatBatchSubChannel,
      this.allowFiatBatchChannelList
    );

    // 没有渠道还原校验
    if (!this.allowFiatBatchChannelList.length) {
      fiatBatch.setValue(fiatBatch.value.map((e) => ({ ...e, invalidBank: false })));
    }

    if (!isCheckBank) return { invalidBank: false }; // 不需要校验

    // 标记不支持的银行
    const value = fiatBatch.value.map((e) => {
      return { ...e, invalidBank: !supportBank.some((j) => j.bankCode === e.bankCode) };
    });

    const invalidBankList = [...new Set<string>(value.filter((e) => e.invalidBank).map((e) => e.bankName))]; // 去重

    // 超过3个银行，聚合提示
    if (invalidBankList.length > 3) {
      this.appService.showToastSubject.next({
        msgLang: 'budget.unsupportedBanks',
        msgChildren: invalidBankList,
        duration: 5e3,
        reactivateDuration: 3e3,
      });
    } else if (invalidBankList.length) {
      (async () => {
        this.appService.showToastSubject.next({
          msg: (await this.lang.getOne('budget.unsupportedBanks')) + ': ' + invalidBankList.join(' | '),
          duration: 5e3,
        });
      })();
    }

    fiatBatch.setValue(value);

    return {
      invalidBank: !!invalidBankList.length, // 是否有不支持的银行
      invalidBankNameList: invalidBankList, // 不支持的银行名称列表（会去重）
      validBankList: value.filter((e) => e.invalidBank), // 有效的银行列表
    };
  }

  /** 时间类型选择 */
  onChangeTimeType() {
    this.formGroup.patchValue({
      time: {
        appointmentTime: new Date(Date.now() + 1e3),
      },
    });
  }

  /** 提币地址粘贴 */
  onPaste(control: FormControl): void {
    // readText 兼容：除了IE都兼容
    navigator.clipboard.readText().then((v) => control.setValue(v));
  }

  /** 打开删除标签提示 */
  async openDelTag(tpl: TemplateRef<any>, item: any) {
    if (item.category === 'Special') return; // 特殊标签不可删除

    const modal = this.modal.open(tpl, { width: '500px' });
    if ((await modal.result) !== true) return;

    this.delTag(item);
  }

  /** 删除标签 */
  delTag(item: any): void {
    this.appService.isContentLoadingSubject.next(true);
    this.selectApi
      .deleteDrawLabel(item.id)
      .pipe(finalize(() => this.appService.isContentLoadingSubject.next(false)))
      .subscribe((res) => {
        if (res !== true) return this.appService.showToastSubject.next({ msgLang: 'budget.failedDelete' });
        if (this.labelControl.value === item.id) this.labelControl.patchValue('');
        this.appService.showToastSubject.next({
          msgLang: 'budget.sucDeleted',
          successed: true,
        });
        this.getLabel();
      });
  }

  /** 打开编辑标签 */
  async openEditLabel(tpl: TemplateRef<any>) {
    this.labelControl.setValue('');
    this.modal.open(tpl, { width: '500px' });
  }

  /** 编辑更新标签 */
  updateTag(c: any): void {
    this.labelControl.markAllAsTouched();
    if (this.labelControl.invalid) return;

    this.appService.isContentLoadingSubject.next(true);
    this.selectApi
      .addDrawLabel(+this.subHeader.merchantCurrentId, (this.labelControl.value as string).trim())
      .pipe(finalize(() => this.appService.isContentLoadingSubject.next(false)))
      .subscribe((res) => {
        if (res !== true) return this.appService.showToastSubject.next({ msgLang: 'budget.addFailed' });
        this.getLabel();
        c(true);
      });
  }

  /** 返回 */
  back(): void {
    this.router.navigate(['/proxy/budget-approval']);
  }

  /** 下载模板 */
  onDownloadTemplate(type: keyof typeof WithdrawalTypeEnum) {
    this.appService.isContentLoadingSubject.next(true);
    this.channelApi.withdrawDownloadTemplate(WithdrawalTypeEnum[type]).subscribe(() => {
      this.appService.isContentLoadingSubject.next(false);
    });
  }

  /** 时间Control */
  timeGetControl(field) {
    return this.formGroupTime.get(field) as FormControl;
  }

  /** 批量清空excel */
  onClearExcel(batchGroup: FormGroup<any>) {
    batchGroup.get('list')?.reset([]);
    if (this.isDigital) {
      this.allowDigitalBatchChannelListSignal.update(() => []);
    } else {
      this.allowFiatBatchChannelListSignal.update(() => []);
    }
    this.channelInit();
  }

  async onCopy(value: string) {
    if (!value) return;

    const successed = this.clipboard.copy(value);
    let copy = await this.lang.getOne('budget.copy');
    let suc = await this.lang.getOne('common.success');
    let fail = await this.lang.getOne('common.fail');
    this.appService.showToastSubject.next({ msg: `${copy}${successed ? suc : fail}！`, successed });
  }

  /** 添加法币手动输入 */
  addManualFiat(el?) {
    const list = this.manualFiatList;
    const item = this.fb.group({
      bankName: [''],
      bankCode: ['', Validators.required],
      bankCard: ['', Validators.required],
      bankPerson: ['', Validators.required],
      amount: ['', Validators.compose([validatorNumberRequired, this.validatorAmountRange()])],
      integral: [''],
    });

    list?.push(item);
    el && this.scrollBottom(el);

    return item;
  }

  /** 添加虚拟币手动输入 */
  addManualDigital(el?) {
    const list = this.manualDigitalList;
    const item = this.fb.group({
      bankNum: ['', Validators.required],
      amount: ['', Validators.compose([validatorNumberRequired, this.validatorAmountRange()])],
      // integral: [''],
    });

    list?.push(item);
    el && this.scrollBottom(el);

    return item;
  }

  /** 滚动到底部 */
  scrollBottom(el: any) {
    if (!el?.scrollTop) return;

    setTimeout(() => {
      this.zone.runOutsideAngular(() => {
        el.scrollTop = 9e9;
      });
    }, 0);
  }

  /** 法币手动 - 银行变动 */
  onFiatManualBankChange({ value }: any, control) {
    const curBank = this.bankList.find((e) => e.bankCode === value);

    // Marr: 这里暂时英文版 也用bankNameLocal 2023-04-02
    // control.parent.get('bankName').patchValue((this.lang.isLocal ? curBank?.bankNameLocal : curBank?.bankNameEn) || '');
    control.parent.get('bankName').patchValue(curBank?.bankNameLocal);
  }

  /** 分批 - 移除类目 */
  onRemoveBatch(batchGroup, number: number) {
    const list: any[] = batchGroup.get('list').value || [];
    list.splice(number, 1);

    !list.length && batchGroup.get('excel')?.setValue('');
  }

  /** 上传图片 */
  onUpload({ uploadURL }: UploadChange, upload: UploadComponent, viewer: ImgViewerComponent) {
    if (!uploadURL || !uploadURL?.filePath) return;

    this.imgList = [...this.imgList, uploadURL?.filePath];
    viewer.updateIndex(this.imgList.length - 1);

    this.appService.showToastSubject.next({ msgLang: 'payment.transactionList.uploadSuc', successed: true });

    upload.clear();
  }
}
