import { Component, EventEmitter, HostBinding, OnInit, Optional, TemplateRef } from '@angular/core';
import { AppService } from 'src/app/app.service';
import { ChannelApi } from 'src/app/shared/api/channel.api';
import { MatModal, MatModalRef } from 'src/app/shared/components/dialogs/modal';
import { SelectApi } from 'src/app/shared/api/select.api';
import { Adjustment, WithdrawalTypeEnum } from 'src/app/shared/interfaces/channel';
import { FormBuilder, FormControl, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UploadComponent } from 'src/app/shared/components/upload/upload.component';
import { ImgViewerComponent } from 'src/app/shared/components/img-viewer/img-viewer.component';
import { wordHide, wordHideFirst } from 'src/app/shared/models/tools.model';
import { LocalStorageService } from 'src/app/shared/service/localstorage.service';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { CancelWithdrawComponent } from 'src/app/pages/money/components/cancel-withdraw/cancel-withdraw.component';
import { RevokeAmountComponent } from 'src/app/pages/money/components/revoke-amount/revoke-amount.component';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { CurrencyValuePipe } from 'src/app/shared/pipes/currency-value.pipe';
import { FormatMoneyPipe, FormatNumberDecimalPipe } from 'src/app/shared/pipes/big-number.pipe';
import { TimeFormatPipe } from 'src/app/shared/pipes/time.pipe';
import { UploadComponent as UploadComponent_1 } from 'src/app/shared/components/upload/upload.component';
import {
  InputTrimDirective,
  InputNumberDirective,
  InputFloatDirective,
} from 'src/app/shared/directive/input.directive';
import { ModalFooterComponent } from 'src/app/shared/components/dialogs/modal/modal-footer.component';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { ModalTitleComponent } from 'src/app/shared/components/dialogs/modal/modal-title.component';
import { LabelComponent } from 'src/app/shared/components/label/label.component';
import { ImgViewerComponent as ImgViewerComponent_1 } from 'src/app/shared/components/img-viewer/img-viewer.component';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { StateLabelComponent } from '../../transaction-list/state-label/state-label.component';
import { NgIf, NgTemplateOutlet, NgFor, SlicePipe, AsyncPipe } from '@angular/common';
import { SearchDirective, SearchInpDirective } from 'src/app/shared/directive/search.directive';

@Component({
  selector: 'app-order-detail',
  templateUrl: './order-detail.component.html',
  styleUrls: ['./order-detail.component.scss'],
  host: {
    'style.display': 'block',
    '[style.width.px]': 'modalWidth',
    '[style.min-width.px]': 'modalWidth',
  },
  standalone: true,
  imports: [
    NgIf,
    NgTemplateOutlet,
    NgFor,
    StateLabelComponent,
    AngularSvgIconModule,
    ImgViewerComponent_1,
    LabelComponent,
    ModalTitleComponent,
    FormRowComponent,
    MatFormFieldModule,
    MatSelectModule,
    FormsModule,
    ReactiveFormsModule,
    MatOptionModule,
    ModalFooterComponent,
    InputTrimDirective,
    InputNumberDirective,
    InputFloatDirective,
    UploadComponent_1,
    SlicePipe,
    TimeFormatPipe,
    FormatMoneyPipe,
    FormatNumberDecimalPipe,
    CurrencyValuePipe,
    LangPipe,
    SearchDirective,
    SearchInpDirective,
    AsyncPipe,
  ],
})
export class OrderDetailComponent implements OnInit {
  constructor(
    @Optional() public modalRef: MatModalRef<any>,
    public appService: AppService,
    private channelApi: ChannelApi,
    private api: SelectApi,
    private modal: MatModal,
    private fb: FormBuilder,
    public ls: LocalStorageService,
    public lang: LangService
  ) {}

  id = '';
  data: any = {};
  merchantName = '';
  adjustmentList: Adjustment[] = [];
  init = true;
  WithdrawalTypeEnum = WithdrawalTypeEnum;

  change = new EventEmitter();

  @HostBinding('hidden')
  get hidden() {
    return this.init;
  }

  /** Getters */
  /** 订单分类 */
  get payType(): string {
    switch (this.data.paymentCategory) {
      case 'Deposit':
        return 'payment.transactionList.deposit';
      case 'Withdraw':
        return 'payment.transactionList.dispensing';
      case 'Adjustment':
        return 'payment.transactionList.reconciliation';
      case WithdrawalTypeEnum.CurrencyExchange:
        return 'budget.asset';
      default:
        return '';
    }
  }

  /** 是否是调账 */
  get isAdjustment(): boolean {
    return this.data.paymentCategory === 'Adjustment';
  }

  /** 弹窗宽度 */
  get modalWidth(): number {
    if (this.isAdjustmentDistribution) return 764;
    return this.isAdjustment ? 440 : 1050;
  }

  /** 调账原因名称 */
  get curAdjustment() {
    return this.adjustmentList.find((e) => e.code === this.data.paymentCategoryReason)?.name || '';
  }

  /**
   * 是否调账 - 换汇
   */
  get isAdjustmentDistribution() {
    return this.data?.paymentCategoryReason === WithdrawalTypeEnum.CurrencyExchange;
  }

  /** 历程列表 */
  get allocations() {
    return Object.keys(this.data?.allocations || {}).map((time) => ({
      time,
      desc: this.data.allocations[time],
    }));
  }

  /** 是否显示冲正 */
  get showRedemption(): boolean {
    return (
      !this.data.isDigital && this.data.status === 'Success'
      // && this.data.completeTime && Date.now() - this.data.completeTime <= 864e5 * 2 // 2天内
    );
  }

  /** 是否显指定渠道 */
  get showDesignChannel(): boolean {
    return (
      !this.data.isDigital &&
      (['Allocating'].includes(this.data.status) ||
        (['Fail', 'Cancel'].includes(this.data.status) && this.data.hasRules === false))
    );
  }

  /** 是否请求异常 */
  get isRequestException(): boolean {
    return this.data.status === 'RequestException';
  }

  /** 是否是超级管理员 */
  get isSuper() {
    return this.ls.userInfo.isSuperAdmin;
  }

  /** lifeCycle */
  ngOnInit(): void {
    this.loadData();
  }

  /** Methods */
  loadData() {
    this.appService.isContentLoadingSubject.next(true);
    this.channelApi.getOrderDetail({ id: this.id }).subscribe((res) => {
      this.init = false;
      this.appService.isContentLoadingSubject.next(false);

      if (!res) {
        this.modalRef.dismiss();
        return this.appService.showToastSubject.next({
          msgLang: 'payment.transactionList.transactionFailed',
          successed: false,
        });
      }

      this.data = this.filterDetail(res);

      // 调账
      if (res.paymentCategory === 'Adjustment') {
        this.api.goMoneyGetAdjustmentList().subscribe((res) => {
          this.adjustmentList = res;
        });
      }

      const pane = this.modal?.['_overlayRef']?.['_pane'] as HTMLDivElement;
      if (pane) {
        pane.style.minWidth = this.modalWidth + 'px';
      }
    });
  }

  // 重送查询
  sendQuery() {
    this.appService.isContentLoadingSubject.next(true);
    this.channelApi.resendQueryOrder(this.data.id).subscribe((res) => {
      this.appService.isContentLoadingSubject.next(false);
      // 重送查询
      this.processResponse(res, 'payment.transactionList.resendQuery');
    });
  }

  // 重送提款
  sendWithdraw() {
    this.appService.isContentLoadingSubject.next(true);
    this.channelApi.resendWithdrawOrder(this.data.id).subscribe((res) => {
      this.appService.isContentLoadingSubject.next(false);
      // 重送提款
      this.processResponse(res, 'payment.transactionList.redeliverWithdrawal');
    });
  }

  // 重送回调
  sendCallback() {
    this.appService.isContentLoadingSubject.next(true);
    this.channelApi.resendCallbackOrder(this.data.id).subscribe((res) => {
      this.appService.isContentLoadingSubject.next(false);
      this.processResponse(res, 'payment.transactionList.resendCallback');
    });
  }

  // 取消存款订单
  async sendCancelWithdraw() {
    const ref = this.modal.open(CancelWithdrawComponent, { width: '514px', disableClose: true, data: this.data.id });
    this.processResponse(await ref.result, 'payment.transactionList.cancelWithdrawal');
  }

  async processResponse(res: any, msg: string) {
    const info = await this.lang.getOne(msg);
    const suc = await this.lang.getOne('common.success');
    const fail = await this.lang.getOne('common.fail');
    if (res === true) {
      this.loadData();
      this.change.emit();
      this.appService.showToastSubject.next({
        msg: info + suc,
        successed: true,
      });
    } else {
      this.appService.showToastSubject.next({
        msg: info + fail,
        successed: false,
      });
    }
  }

  /** 打开更换渠道 */
  openChangeChannel(tpl) {
    this.appService.isContentLoadingSubject.next(true);
    this.channelApi
      .getSubChannelList({
        merchantId: this.data.merchantId,
        currency: this.data.currency,
        paymentMethod: this.data.paymentMethodId,
        isDigital: this.data.isDigital,
      })
      .subscribe(async (res) => {
        this.appService.isContentLoadingSubject.next(false);

        if (!Array.isArray(res))
          return this.appService.showToastSubject.next({
            msgLang: 'payment.transactionList.failTosub',
          });

        const list = res
          .filter((e) => e.isEnable)
          .filter((e) => e.channelAccountId !== this.data.channelAccountId) // 过滤当前的渠道
          .filter((e) => this.data.presetOrderAmount >= e.minAmount && this.data.presetOrderAmount <= e.maxAmount); // 过滤出符合的渠道

        if (!list.length)
          return this.appService.showToastSubject.next({
            msgLang: 'payment.transactionList.noReplaceableChannels',
          });

        const control = new FormControl(
          this.data.channelAccountId === '00000000-0000-0000-0000-000000000000' ? '' : this.data.channelAccountId,
          { validators: Validators.required }
        );
        const result = this.modal.open(tpl, {
          width: '540px',
          data: { control, list },
        });
        if ((await result.result) !== true) return;
      });
  }

  /** 指定渠道 */
  onChangeChannel(c: any, { control }: any) {
    if (control.markAsTouched() || control.invalid) return;

    this.appService.isContentLoadingSubject.next(true);
    this.channelApi.changeOrderChannel({ id: this.data.id, channelAccountId: control.value }).subscribe((res) => {
      this.appService.isContentLoadingSubject.next(false);

      res === true && c(true);
      this.processResponse(res, 'payment.transactionList.designatedChannel');
    });
  }

  /** 打开积分调整 */
  async openChangeIntegral(channelTpl: TemplateRef<any>, data: any) {
    const control = new FormControl(data.integrals, {
      validators: Validators.required,
    });
    const result = this.modal.open(channelTpl, {
      width: '540px',
      data: control,
    });
    if ((await result.result) !== true) return;
  }

  /** 打开冲正撤单 */
  async openRedemption() {
    const ref = this.modal.open(RevokeAmountComponent, {
      width: '500px',
      disableClose: true,
      data: { id: this.data.id, maxAmount: this.data.receiveAmount },
    });
    this.processResponse(await ref.result, 'payment.transactionList.redemption');
  }

  /** 积分调整 */
  onChangeIntegrity(c: any, control: any) {
    if (control.markAsTouched() || control.invalid) return;

    this.appService.isContentLoadingSubject.next(true);
    this.channelApi.changeOrderIntegrity({ id: this.data.id, integrals: control.value }).subscribe((res) => {
      this.appService.isContentLoadingSubject.next(false);

      res === true && c(true);
      this.processResponse(res, 'payment.transactionList.adjustPoints');
    });
  }

  /** 积分失去焦点 */
  onIntegrityBlur(control: FormControl) {
    if (control.value === '') control.setValue(0);

    let value = +control.value || 0;

    value = Math.max(0, value);
    // value = Math.min(1000, value);
    control.setValue(value);
  }

  /**
   * 打开人工编辑
   */
  async openManualEditing(tpl: TemplateRef<any>, data: any) {
    const group = this.fb.group({ amount: [data.orderAmount, Validators.required] });
    const list = Array.isArray(data.imagePath) ? data.imagePath : [];

    const result = this.modal.open(tpl, {
      width: '540px',
      data: { list, group },
      disableClose: true,
    });

    if ((await result.result) !== true) return;
  }

  /**
   * 打开手动存款
   */
  async openManualDeposit(tpl: TemplateRef<any>, data: any) {
    const group = this.fb.group({
      amount: [data.orderAmount, Validators.required],
      remarks: [],
    });
    const list = Array.isArray(data.imagePath) ? data.imagePath : [];

    const result = this.modal.open(tpl, {
      width: '540px',
      data: { list, group, data },
      disableClose: true,
    });

    if ((await result.result) !== true) return;
  }

  onManualEditing(c: any, { group, list }: { group: FormGroup; list: string[] }) {
    group.markAllAsTouched();

    if (group.invalid) return;
    if (!list?.length) return this.appService.showToastSubject.next({ msgLang: 'payment.transactionList.ploadOneImg' });

    this.appService.isContentLoadingSubject.next(true);
    this.channelApi
      .orderManualCheck({
        id: this.data.id,
        receiveAmount: group.value.amount,
        imagePath: list,
      })
      .subscribe((res) => {
        this.appService.isContentLoadingSubject.next(false);

        res?.success === true && c(true);
        this.processResponse(res?.success, 'payment.transactionList.manualEditing');
      });
  }

  /**
   * 手动上分提交
   * @param c
   * @param group
   * @param list
   */
  onManualDeposit(c: any, { group, list }: { group: FormGroup; list: string[] }) {
    group.markAllAsTouched();

    if (group.invalid) return;
    if (!list?.length) return this.appService.showToastSubject.next({ msgLang: 'payment.transactionList.ploadOneImg' });

    this.appService.isContentLoadingSubject.next(true);
    this.channelApi
      .orderManualDeposit({
        id: this.data.id,
        receiveAmount: group.value.amount || 0,
        imagePath: list,
        remark: group.value.remarks,
      })
      .subscribe((res) => {
        this.appService.isContentLoadingSubject.next(false);

        res?.success === true && c(true);
        this.processResponse(res?.success, 'payment.transactionList.manualDeposit');
      });
  }

  /** 上传图片 */
  onUpload({ uploadURL }, data, upload: UploadComponent, viewer: ImgViewerComponent) {
    if (!uploadURL || !uploadURL?.filePath) return;

    data.list = [...data.list, uploadURL?.filePath];
    viewer.updateIndex(data.list.length - 1);

    this.appService.showToastSubject.next({ msgLang: 'payment.transactionList.uploadSuc', successed: true });

    upload.clear();
  }

  /** 过滤详情操作 */
  private filterDetail(v: any) {
    const isSpecial = v?.withdrawTabCategory === 'Special';

    // 如果是特殊标签，不是超级管理员则隐藏（只显示金额和卡号或地址后8位）
    if (isSpecial && !this.isSuper && v.paymentCategory === 'Withdraw') {
      [
        'applicationTime', // 申请时间
        'currency', // 币种
        'merchantName', // 商户名称
        'merchantUserAccount',
        'withdrawTabName', // 标签名称
        'completeTime', // 完成时间
        'integrals', // 积分
        'merchantChannelName', // 子渠道名称
        'merchantOrderId', // 商户订单号
        'channelOrderId', // 渠道订单号
        'updateTime', // 更新时间
        'withdrawTabName', // 标签
        'paymentMethod', // 支付方式
        'channelOrderId', // 渠道订单
        'orderId', // 订单id
      ].forEach((key) => (v[key] = wordHide(v[key])));

      v.imagePath = null; // 付款截图
      v?.digitalInfo?.txHash && (v.digitalInfo.txHash = wordHide(v.digitalInfo.txHash)); // 虚拟币交易hash
      v?.digitalInfo?.fromAddress && (v.digitalInfo.fromAddress = wordHide(v.digitalInfo.fromAddress)); // 虚拟币收款地址
      v?.digitalInfo?.toAddress && (v.digitalInfo.toAddress = wordHide(v.digitalInfo.toAddress)); // 虚拟币收款地址
      v?.bankInfo?.bankAccountNumber &&
        (v.bankInfo.bankAccountNumber = wordHideFirst(v.bankInfo.bankAccountNumber, true, 8)); // 卡号
      v?.bankInfo?.bankAccountHolder && (v.bankInfo.bankAccountHolder = wordHide(v.bankInfo.bankAccountHolder)); // 持卡人
      v?.bankInfo?.bankName && (v.bankInfo.bankName = wordHide(v.bankInfo.bankName, true)); // 开户行 银行名称

      v.allocations = {};
      v.hideOpera = true; // 隐藏操作和重送按钮
    }

    return v;
  }
}
