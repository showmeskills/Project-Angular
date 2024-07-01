import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  TemplateRef,
  computed,
  signal,
} from '@angular/core';
import { BonusApi } from '../../apis/bonus.api';
import { BonusList } from '../../interfaces/bonus.interface';
import { LocaleService } from '../../service/locale.service';
import { ToastService } from '../../service/toast.service';
import { SelectDepositBonusService } from './select-deposit-bonus.service';

@Component({
  selector: 'app-select-deposit-bonus',
  templateUrl: './select-deposit-bonus.component.html',
  styleUrls: ['./select-deposit-bonus.component.scss'],
})
export class SelectDepositBonusComponent implements OnChanges {
  constructor(
    private localeService: LocaleService,
    public selectDepositBonusService: SelectDepositBonusService,
    private bonusApi: BonusApi,
    private toast: ToastService,
  ) {}

  /** 存款类型 */
  @Input() depositType: 'paymentIQ' | 'faitDeposit' | 'cryptoDeposit' | string = '';

  /** 其他 不同样式 */
  @Input() otherDepositElement?: TemplateRef<HTMLElement>;

  /** 当前已选择的红利 */
  @Input() selectedVoucher: BonusList | null = null;
  _selectedVoucher = signal(this.selectedVoucher);
  renderSelectedVourcher = computed(() => {
    if (this._selectedVoucher()) return this._selectedVoucher();
    return null;
  });
  renderSelectedMinDeposit = computed(() => {
    if (
      this._selectedVoucher() &&
      Array.isArray(this._selectedVoucher()?.rateVos) &&
      Number(this._selectedVoucher()?.rateVos?.length || 0) > 0
    ) {
      return this._selectedVoucher()?.rateVos[0];
    }
    return null;
  });

  /** 红利 loading 筛选 */
  @Input() voucherLoading = false;

  /** 红利数据 */
  @Input() voucherList: BonusList[] = [];
  _voucherList = signal(this.voucherList);
  renderVoucherList = computed(() => {
    if (this._voucherList().length === 0) return true;
    return false;
  });

  /** 弹窗触发事件 */
  @Output() voucherPopup = new EventEmitter();

  /** 币种 */
  @Input() currency: string = 'USDT';
  _currency = signal(this.currency);

  /** 金额 */
  @Input() amount: number = 0;
  _amount = signal(this.amount);

  couponValue: string = '';
  couponLoading: boolean = false;
  verifySuccess: boolean = false;
  @Output() handleCallback = new EventEmitter();

  /** 选择按钮 */
  switchBtn: string[] = [this.localeService.getValue('use_coupon'), this.localeService.getValue('i_have_voucher')];
  switchBtnIndex: number = 0;

  ngOnChanges(changes: SimpleChanges): void {
    this._selectedVoucher.set(changes.selectedVoucher?.currentValue || null);
    this.voucherLoading = changes.voucherLoading?.currentValue;
    this._voucherList.set(changes.voucherList?.currentValue || []);
    this._currency.set(changes.currency?.currentValue || 'USDT');
    this._amount.set(changes.amount?.currentValue || 0);
  }

  /**
   * 打开红利弹窗
   *
   * @param $event
   */
  openBonusPopup($event: string) {
    if (this.verifySuccess) return;
    this.voucherPopup.emit($event);
  }

  /**
   * 切换类型
   *
   * @param index
   */
  onSwitchBonusType(index: number) {
    this.switchBtnIndex = index;
    this.onReset();
  }

  /**
   * coupon code 修改
   *
   * @param event
   */
  onCoupnValueChange(event: string) {
    this.couponValue = event;
    if (event.length < 4) {
      this.onReset();
    }
  }

  /** 交换 coupon */
  onGetCouponCode() {
    if (!this.couponValue) return;
    this.couponLoading = true;
    this.bonusApi
      .getCoupondeposit({
        amount: this.amount,
        currency: this.currency,
        couponCode: this.couponValue,
      })
      .subscribe(response => {
        const data = response?.data;
        if (data) {
          this.verifySuccess = true;
          this.handleCallback.emit({
            ...data,
            rateVos: [
              {
                minDepositUsdt: data.minDepositUsdt,
                rate: data.returnPercentage,
              },
            ],
          });
          switch (data.prizeAmountType) {
            case 0:
              this.couponValue = `${data.bonusActivityName || ''} , ${
                data.freeSpinTimes || 0
              } ${this.localeService.getValue('num_times')}`;
              break;
            case 1:
              this.couponValue = `${data.bonusActivityName || ''} , ${data.bonusFixedUsdt || 0} USDT`;
              break;
            case 2:
              if (this.depositType === 'faitDeposit') {
                this.couponValue = `${data.bonusActivityName || ''} , ${
                  data.returnPercentage || 0
                }%, ${this.localeService.getValue('max')}${data.bonusMaxUsdt || 0} USDT`;
              } else {
                this.couponValue = `${data.bonusActivityName || ''} , ${data.returnPercentage || 0}%`;
              }
              break;
            default:
              break;
          }
        } else {
          if (response?.code === '2121') {
            this.toast.show({ message: response?.message || '', type: 'fail' });
          } else {
            this.toast.show({ message: this.localeService.getValue('exch_fail00'), type: 'fail' });
          }
        }
        this.couponLoading = false;
      });
  }

  onReset() {
    this._selectedVoucher.set(null);
    this.verifySuccess = false;
    this.couponValue = '';
  }
}
