import { Component, EventEmitter, Input, OnInit, Output, TemplateRef } from '@angular/core';
import { MatModal } from 'src/app/shared/components/dialogs/modal';
import { FormControl, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppService } from 'src/app/app.service';
import { ChannelApi } from 'src/app/shared/api/channel.api';
import { LocalStorageService } from 'src/app/shared/service/localstorage.service';
import { wordHide, wordHideFirst } from 'src/app/shared/models/tools.model';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { Clipboard } from '@angular/cdk/clipboard';
import { PayService } from 'src/app/pages/proxy/approval/approval-apply/pay.service';
import { RevokeAmountComponent } from 'src/app/pages/money/components/revoke-amount/revoke-amount.component';
import { CancelWithdrawComponent } from 'src/app/pages/money/components/cancel-withdraw/cancel-withdraw.component';
import { WithdrawalTypeEnum } from 'src/app/shared/interfaces/channel';
import { FinancialWithdrawStatus } from 'src/app/shared/interfaces/status';
import { SubHeaderPipe } from 'src/app/_metronic/partials/layout/subheader/subheader1/sub-header.service';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { CurrencyValuePipe } from 'src/app/shared/pipes/currency-value.pipe';
import { FormatMoneyPipe } from 'src/app/shared/pipes/big-number.pipe';
import { TimeFormatPipe } from 'src/app/shared/pipes/time.pipe';
import { InputTrimDirective, InputNumberDirective } from 'src/app/shared/directive/input.directive';
import { ModalFooterComponent } from 'src/app/shared/components/dialogs/modal/modal-footer.component';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ModalTitleComponent } from 'src/app/shared/components/dialogs/modal/modal-title.component';
import { ImgViewerComponent } from 'src/app/shared/components/img-viewer/img-viewer.component';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { StateLabelComponent } from '../../../../money/transaction-list/state-label/state-label.component';
import { NgIf, NgFor, NgTemplateOutlet, AsyncPipe } from '@angular/common';
import { SearchDirective, SearchInpDirective } from 'src/app/shared/directive/search.directive';

@Component({
  selector: 'fiat-batch',
  templateUrl: './fiat-batch.component.html',
  styleUrls: ['./fiat-batch.component.scss'],
  host: {
    // '[class.is-simple]': 'isSimple'
  },
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    NgTemplateOutlet,
    StateLabelComponent,
    AngularSvgIconModule,
    FormRowComponent,
    ImgViewerComponent,
    ModalTitleComponent,
    MatFormFieldModule,
    MatSelectModule,
    FormsModule,
    ReactiveFormsModule,
    MatOptionModule,
    ModalFooterComponent,
    InputTrimDirective,
    InputNumberDirective,
    TimeFormatPipe,
    FormatMoneyPipe,
    CurrencyValuePipe,
    LangPipe,
    SubHeaderPipe,
    AsyncPipe,
    SearchDirective,
    SearchInpDirective,
  ],
})
export class FiatBatchComponent implements OnInit {
  constructor(
    public modal: MatModal,
    public channelApi: ChannelApi,
    public appService: AppService,
    public ls: LocalStorageService,
    private clipboard: Clipboard,
    public lang: LangService,
    public payService: PayService
  ) {}

  WithdrawalTypeEnum = WithdrawalTypeEnum;

  @Input()
  get data() {
    return this._data;
  }

  set data(v: any) {
    const isSpecial = v?.withdrawTabCategory === 'Special';

    // 如果是特殊标签，不是超级管理员则隐藏（只显示金额和卡号或地址后8位）
    if (isSpecial && !this.isSuper) {
      [
        'auditTime', // 审批时间
        'auditUserName', // 审批人
        'createdTime', // 申请时间
        'createdUserName', // 申请人
        'currency', // 币种
        'description', // 备注
        'merchantName',
        'merchantUserAccount',
        'withdrawTabName', // 标签名称
        'paymentMethodId', // 支付方式
      ].forEach((key) => (v[key] = wordHide(v[key])));

      v?.transactionDetails?.forEach((child) => {
        [
          'bankAccountHolder', // 银行账户持有人
          'bankName', // 银行名称
          'channelAccountAlias', // 渠道名称
          'channelOrderId', // 渠道订单号
          'merchantOrderId', // 商户订单号
          'currency', // 币种
          'integrals', // 积分
          'modifiedTime', // 更新时间
          'completeTime', // 完成时间
          'channelTime', // 渠道处理时间
        ].forEach((key) => (child[key] = wordHide(child[key])));
        child.txHash = wordHideFirst(child.txHash, true, 8);
        child.bankAccountNumber = wordHideFirst(child.bankAccountNumber, true, 8);
        child.allocations = {};
      });

      v.appointmentTime = null;
      v.hideOpera = true;
    }

    this._data = v;
  }

  private _data: any = {};

  @Output() reload = new EventEmitter<any>();

  /** lifeCycle */
  ngOnInit(): void {}

  /** 是否虚拟币类型 */
  get isDigital() {
    return this.data?.currencyCoinCategory === 'Coin';
  }

  get isSuper() {
    return this.ls.userInfo.isSuperAdmin;
  }

  /** methods */
  /** 是否显示冲正 */
  showRedemption(item: any): boolean {
    return (
      !this.isDigital && item.status === 'Success' // && item.completeTime && Date.now() - item.completeTime <= 864e5 * 2
    );
  }

  /** 历程列表 */
  getAllocations(data): any[] {
    return Object.keys(data?.allocations || {}).map((time) => ({
      time,
      desc: data?.allocations[time],
    }));
  }

  /** 打开更换渠道 */
  openChangeChannel(tpl, item: any) {
    this.appService.isContentLoadingSubject.next(true);
    this.channelApi
      .getSubChannelList({
        merchantId: this.data.merchantId,
        currency: item.currency,
        paymentMethod: this.data.paymentMethodId,
        isDigital: this.isDigital,
      })
      .subscribe(async (res) => {
        this.appService.isContentLoadingSubject.next(false);

        if (!Array.isArray(res))
          return this.appService.showToastSubject.next({
            msgLang: 'payment.transactionList.failTosub',
          });

        const list = res
          .filter((e) => e.isEnable) // 过滤掉不可用的渠道
          .filter((e) => e.channelAccountId !== item.channelAccountId) // 过滤当前的渠道
          .filter((e) => item.presetAmount >= e.minAmount && item.presetAmount <= e.maxAmount); // 过滤出符合的渠道

        if (!list.length)
          return this.appService.showToastSubject.next({
            msgLang: 'payment.transactionList.noReplaceableChannels',
          });

        const control = new FormControl(
          item.channelAccountId === '00000000-0000-0000-0000-000000000000' ? '' : item.channelAccountId,
          { validators: Validators.required }
        );
        const result = this.modal.open(tpl, {
          width: '540px',
          data: { data: { ...item }, control, list },
        });
        if ((await result.result) !== true) return;

        this.reload.emit(true);
      });
  }

  /** 指定渠道 */
  onChangeChannel(c: any, { control, data }: any) {
    if (control.markAsTouched() || control.invalid) return;

    this.appService.isContentLoadingSubject.next(true);
    this.channelApi
      .changeOrderChannel({
        id: data.orderRecordId,
        channelAccountId: control.value,
      })
      .subscribe((res) => {
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
      data: { data, control },
    });
    if ((await result.result) !== true) return;

    this.reload.emit();
  }

  /** 积分调整 */
  onChangeIntegrity(c: any, { control, data }: any) {
    if (control.markAsTouched() || control.invalid) return;

    this.appService.isContentLoadingSubject.next(true);
    this.channelApi
      .changeOrderIntegrity({
        id: data.orderRecordId,
        integrals: control.value,
      })
      .subscribe((res) => {
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

  /** 取消提款 */
  async sendCancelWithdraw(id) {
    const ref = this.modal.open(CancelWithdrawComponent, { width: '514px', disableClose: true, data: id });
    this.processResponse(await ref.result, 'payment.transactionList.cancelWithdrawal', true);
  }

  /** 打开冲正确认 */
  async openRedemption(data: any) {
    const ref = this.modal.open(RevokeAmountComponent, {
      width: '500px',
      disableClose: true,
      data: { id: data.orderRecordId, maxAmount: data.amount },
    });
    this.processResponse(await ref.result, 'payment.transactionList.redemption', true);
  }

  async processResponse(res: any, msg: string, reloadList = false) {
    let info = await this.lang.getOne(msg);
    let suc = await this.lang.getOne('common.success');
    let fail = await this.lang.getOne('common.fail');
    if (res === true) {
      this.reload.emit(reloadList);
      let msgLang = info + suc;
      this.appService.showToastSubject.next({
        // msg: msg + '成功',
        msg: msgLang,
        successed: true,
      });
    } else {
      let msgLang = info + fail;
      this.appService.showToastSubject.next({
        msg: msgLang,
        successed: false,
      });
    }
  }

  /** 重送查询 */
  sendQuery(id) {
    this.appService.isContentLoadingSubject.next(true);
    this.channelApi.resendQueryOrder(id).subscribe((res) => {
      this.appService.isContentLoadingSubject.next(false);
      this.processResponse(res, 'payment.transactionList.resendQuery');
    });
  }

  /** 重送提款 */
  sendWithdraw(id) {
    this.appService.isContentLoadingSubject.next(true);
    this.channelApi.resendWithdrawOrder(id).subscribe((res) => {
      this.appService.isContentLoadingSubject.next(false);
      this.processResponse(res, 'payment.transactionList.redeliverWithdrawal');
    });
  }

  /** 重送回调 */
  sendCallback(id) {
    this.appService.isContentLoadingSubject.next(true);
    this.channelApi.resendCallbackOrder(id).subscribe((res) => {
      this.appService.isContentLoadingSubject.next(false);
      this.processResponse(res, 'payment.transactionList.notifyMerchants');
    });
  }

  async onCopy(value: string) {
    if (!value) return;

    const successed = this.clipboard.copy(value);
    let copy = await this.lang.getOne('budget.copy');
    let suc = await this.lang.getOne('common.success');
    let fail = await this.lang.getOne('common.fail');
    this.appService.showToastSubject.next({ msg: `${copy}${successed ? suc : fail}！`, successed });
  }

  protected readonly FinancialWithdrawStatus = FinancialWithdrawStatus;
}
